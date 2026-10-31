const STORAGE_KEYS = {
    ENGINE: 'newtab_engine'
};

const clockEl = document.getElementById('clock');
const dateEl = document.getElementById('date');
const greetingEl = document.getElementById('greeting');
const quoteEl = document.getElementById('privacy-quote');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const engineSelect = document.getElementById('engine-select');
const engineSelectModal = document.getElementById('engine-select-modal');
const backgroundEl = document.getElementById('background');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings');
const bgUpload = document.getElementById('bg-upload');
const bgReset = document.getElementById('bg-reset');
const shortcutsGrid = document.getElementById('shortcuts-grid');
const addShortcutBtn = document.getElementById('add-shortcut-btn');

// zmienna do przechowywania obecnego url tła (aby móc go zwolnić z pamięci)
let currentBgObjectUrl = null;

// inicjalizacja bazy danych, ładowanie tła i kafelków przy starcie
initDB().then(() => {
    loadBackground();
    renderShortcuts();
}).catch((err) => {
    console.error('Nie udało się zainicjalizować bazy danych:', err);
    backgroundEl.style.backgroundImage = 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)';
});

function updateClock() {
    const now = new Date();
    
    // godzina
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${hours}:${minutes}:${seconds}`;

    // data i święta
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    let dateStr = now.toLocaleDateString('pl-PL', options);
    dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

    const monthDay = String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    
    // doklejanie święta do daty, jeśli istnieje w bazie
    if (APP_DATA.holidays[monthDay]) {
        dateEl.textContent = `${dateStr} • ${APP_DATA.holidays[monthDay]}`;
    } else {
        dateEl.textContent = dateStr;
    }

    // zaawansowane powitanie
    const hour = now.getHours();
    let greeting;

    if (hour >= 5 && hour < 12) {
        greeting = 'Dzień dobry';
    } else if (hour >= 12 && hour < 18) {
        greeting = 'Miłego dnia';
    } else if (hour >= 18 && hour < 23) {
        greeting = 'Dobry wieczór';
    } else {
        greeting = 'Dobranoc';
    }
    
    greetingEl.textContent = greeting;
}

setInterval(updateClock, 1000);
updateClock();

// inicjalizacja losowego cytatu
function setRandomQuote() {
    const quotes = APP_DATA.privacyQuotes;
    const randomIndex = Math.floor(Math.random() * quotes.length);
    quoteEl.textContent = quotes[randomIndex];
}
setRandomQuote();

function getSelectedEngine() {
    return localStorage.getItem(STORAGE_KEYS.ENGINE) || 'duckduckgo';
}

function setSelectedEngine(engineKey) {
    localStorage.setItem(STORAGE_KEYS.ENGINE, engineKey);
    engineSelect.value = engineKey;
    engineSelectModal.value = engineKey;
}

function performSearch(query) {
    if (!query.trim()) return;
    const engineKey = getSelectedEngine();
    const engine = APP_DATA.searchEngines[engineKey] || APP_DATA.searchEngines.duckduckgo;
    const url = engine.url.replace('%s', encodeURIComponent(query.trim()));
    window.location.href = url;
}

const savedEngine = getSelectedEngine();
engineSelect.value = savedEngine;
engineSelectModal.value = savedEngine;

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    performSearch(searchInput.value);
});

engineSelect.addEventListener('change', (e) => {
    setSelectedEngine(e.target.value);
});

engineSelectModal.addEventListener('change', (e) => {
    setSelectedEngine(e.target.value);
});

// --- logika tła z użyciem indexeddb i webp ---

async function loadBackground() {
    try {
        const savedBlob = await getFromDB('background');
        
        // zwolnienie starego obiektu z pamięci, jeśli istnieje
        if (currentBgObjectUrl) {
            URL.revokeObjectURL(currentBgObjectUrl);
        }

        if (savedBlob) {
            currentBgObjectUrl = URL.createObjectURL(savedBlob);
            backgroundEl.style.backgroundImage = `url(${currentBgObjectUrl})`;
        } else {
            backgroundEl.style.backgroundImage = 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)';
        }
    } catch (err) {
        console.error('Błąd podczas ładowania tła:', err);
        backgroundEl.style.backgroundImage = 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)';
    }
}

async function processAndSetBackground(file) {
    try {
        // 1. wczytanie obrazu z uwzględnieniem orientacji exif (ważne dla zdjęć z telefonu)
        const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
        
        // 2. obliczenie nowych wymiarów (max 1920x1080)
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        let width = bitmap.width;
        let height = bitmap.height;

        if (width > height) {
            if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            }
        } else {
            if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
            }
        }

        // 3. rysowanie na canvasie (używamy offscreencanvas jeśli jest dostępny)
        const canvas = (typeof OffscreenCanvas !== 'undefined') 
            ? new OffscreenCanvas(width, height) 
            : document.createElement('canvas');
        
        if (!(canvas instanceof OffscreenCanvas)) {
            canvas.width = width;
            canvas.height = height;
        }

        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0, width, height);

        // 4. kompresja do formatu webp
        let blob;
        if (canvas instanceof OffscreenCanvas) {
            blob = await canvas.convertToBlob({ type: 'image/webp', quality: 0.8 });
        } else {
            blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.8));
        }

        // 5. zapisanie blob w indexeddb
        await saveToDB('background', blob);
        
        // 6. zwolnienie pamięci i zaktualizowanie widoku
        bitmap.close();
        await loadBackground();

    } catch (error) {
        console.error('Błąd podczas przetwarzania obrazu:', error);
        alert('Wystąpił błąd podczas przetwarzania obrazu. Spróbuj wybrać inny plik.');
    }
}

bgUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    processAndSetBackground(file);
});

bgReset.addEventListener('click', async () => {
    try {
        await deleteFromDB('background');
        await loadBackground();
        bgUpload.value = '';
    } catch (err) {
        console.error('Błąd podczas resetowania tła:', err);
    }
});

// --- logika kafelków ze skrótami ---

async function getShortcuts() {
    try {
        const shortcuts = await getFromDB('shortcuts');
        return shortcuts || [];
    } catch (err) {
        console.error('Błąd podczas pobierania skrótów:', err);
        return [];
    }
}

async function saveShortcuts(shortcuts) {
    try {
        await saveToDB('shortcuts', shortcuts);
    } catch (err) {
        console.error('Błąd podczas zapisywania skrótów:', err);
    }
}

async function addShortcut(name, url) {
    const shortcuts = await getShortcuts();
    if (shortcuts.some(s => s.url === url)) {
        alert('Ten skrót już istnieje!');
        return false;
    }
    shortcuts.push({ name, url }); // Nie zapisujemy już obrazka (blob) w bazie
    await saveShortcuts(shortcuts);
    await renderShortcuts();
    return true;
}

async function removeShortcut(url) {
    let shortcuts = await getShortcuts();
    shortcuts = shortcuts.filter(s => s.url !== url);
    await saveShortcuts(shortcuts);
    await renderShortcuts();
}

async function renderShortcuts() {
    const shortcuts = await getShortcuts();
    shortcutsGrid.innerHTML = ''; 

    for (const shortcut of shortcuts) {
        const item = document.createElement('a');
        item.href = shortcut.url;
        item.target = '_blank';
        item.rel = 'noopener noreferrer';
        item.className = 'shortcut-item';
        item.title = shortcut.name;

        const iconDiv = document.createElement('div');
        iconDiv.className = 'shortcut-icon';

        // Próbujemy załadować ikonę bezpośrednio z serwera docelowego
        try {
            const domain = new URL(shortcut.url).hostname;
            const faviconUrl = `https://${domain}/favicon.ico`;
            
            const img = document.createElement('img');
            img.src = faviconUrl;
            img.alt = shortcut.name;
            
            // Jeśli obrazek nie istnieje (404) lub jest zablokowany, wyświetlamy literę
            img.onerror = () => {
                iconDiv.innerHTML = ''; 
                iconDiv.textContent = shortcut.name.charAt(0).toUpperCase();
            };
            
            iconDiv.appendChild(img);
        } catch (e) {
            // Fallback w razie błędnego URL
            iconDiv.textContent = shortcut.name.charAt(0).toUpperCase();
        }

        const label = document.createElement('span');
        label.className = 'shortcut-label';
        label.textContent = shortcut.name;

        item.appendChild(iconDiv);
        item.appendChild(label);

        // usuwanie skrótu (kliknięcie prawym / przytrzymanie na telefonie)
        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (confirm(`Czy na pewno chcesz usunąć skrót "${shortcut.name}"?`)) {
                removeShortcut(shortcut.url);
            }
        });

        shortcutsGrid.appendChild(item);
    }
}

addShortcutBtn.addEventListener('click', async () => {
    const url = prompt('Podaj adres URL strony (np. https://github.com):');
    if (!url) return;

    try {
        new URL(url);
    } catch (e) {
        alert('Podano nieprawidłowy adres URL. Upewnij się, że zaczyna się od http:// lub https://');
        return;
    }

    let name = prompt('Podaj nazwę skrótu (np. GitHub):');
    if (!name) {
        name = new URL(url).hostname.replace('www.', '');
    }

    await addShortcut(name, url);
});

// --- koniec logiki kafelków ---

function openSettings() {
    settingsModal.classList.remove('hidden');
}

function closeSettings() {
    settingsModal.classList.add('hidden');
}

settingsBtn.addEventListener('click', openSettings);
closeSettingsBtn.addEventListener('click', closeSettings);

settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        closeSettings();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !settingsModal.classList.contains('hidden')) {
        closeSettings();
    }
});
