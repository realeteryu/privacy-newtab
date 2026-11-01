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

// elementy nowego modala skrótów
const shortcutModal = document.getElementById('shortcut-modal');
const shortcutNameInput = document.getElementById('shortcut-name');
const shortcutUrlInput = document.getElementById('shortcut-url');
const shortcutIconUpload = document.getElementById('shortcut-icon-upload');
const saveShortcutBtn = document.getElementById('save-shortcut-btn');
const cancelShortcutBtn = document.getElementById('cancel-shortcut-btn');

// elementy do backupu
const exportBtn = document.getElementById('export-settings-btn');
const importBtn = document.getElementById('import-settings-btn');
const importFileInput = document.getElementById('import-file-input');

// elementy do własnych wyszukiwarek
const customEngineNameInput = document.getElementById('custom-engine-name');
const customEngineUrlInput = document.getElementById('custom-engine-url');
const addEngineBtn = document.getElementById('add-engine-btn');
const customEnginesList = document.getElementById('custom-engines-list');

// zmienna do przechowywania obecnego url tła
let currentBgObjectUrl = null;

// inicjalizacja bazy danych, ładowanie tła, kafelków i wyszukiwarek przy starcie
initDB().then(() => {
    loadBackground();
    renderShortcuts();
    renderEngineOptions(); // <- inicjalizacja listy wyszukiwarek z engines.js
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

// --- obsługa zdarzeń wyszukiwarki (logika w engines.js) ---

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
        const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
        
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

        const canvas = (typeof OffscreenCanvas !== 'undefined') 
            ? new OffscreenCanvas(width, height) 
            : document.createElement('canvas');
        
        if (!(canvas instanceof OffscreenCanvas)) {
            canvas.width = width;
            canvas.height = height;
        }

        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0, width, height);

        let blob;
        if (canvas instanceof OffscreenCanvas) {
            blob = await canvas.convertToBlob({ type: 'image/webp', quality: 0.8 });
        } else {
            blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.8));
        }

        await saveToDB('background', blob);
        
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

async function addShortcut(name, url, customIconBlob = null) {
    const shortcuts = await getShortcuts();
    if (shortcuts.some(s => s.url === url)) {
        alert('Ten skrót już istnieje!');
        return false;
    }
    shortcuts.push({ name, url, iconBlob: customIconBlob });
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

        if (shortcut.iconBlob) {
            const iconUrl = URL.createObjectURL(shortcut.iconBlob);
            const img = document.createElement('img');
            img.src = iconUrl;
            img.alt = shortcut.name;
            img.onload = () => URL.revokeObjectURL(iconUrl);
            iconDiv.appendChild(img);
        } else {
            try {
                const domain = new URL(shortcut.url).hostname;
                const faviconUrl = `https://${domain}/favicon.ico`;
                
                const img = document.createElement('img');
                img.src = faviconUrl;
                img.alt = shortcut.name;
                
                img.onerror = () => {
                    iconDiv.innerHTML = ''; 
                    iconDiv.textContent = shortcut.name.charAt(0).toUpperCase();
                };
                
                iconDiv.appendChild(img);
            } catch (e) {
                iconDiv.textContent = shortcut.name.charAt(0).toUpperCase();
            }
        }

        const label = document.createElement('span');
        label.className = 'shortcut-label';
        label.textContent = shortcut.name;

        item.appendChild(iconDiv);
        item.appendChild(label);

        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (confirm(`Czy na pewno chcesz usunąć skrót "${shortcut.name}"?`)) {
                removeShortcut(shortcut.url);
            }
        });

        shortcutsGrid.appendChild(item);
    }
}

addShortcutBtn.addEventListener('click', () => {
    shortcutNameInput.value = '';
    shortcutUrlInput.value = '';
    shortcutIconUpload.value = '';
    shortcutModal.classList.remove('hidden');
    shortcutNameInput.focus();
});

function closeShortcutModal() {
    shortcutModal.classList.add('hidden');
}

cancelShortcutBtn.addEventListener('click', closeShortcutModal);
shortcutModal.addEventListener('click', (e) => {
    if (e.target === shortcutModal) closeShortcutModal();
});

saveShortcutBtn.addEventListener('click', async () => {
    const url = shortcutUrlInput.value.trim();
    let name = shortcutNameInput.value.trim();
    const iconFile = shortcutIconUpload.files[0];

    if (!url) {
        alert('Podaj adres URL.');
        return;
    }

    try {
        new URL(url);
    } catch (e) {
        alert('Podano nieprawidłowy adres URL. Upewnij się, że zaczyna się od http:// lub https://');
        return;
    }

    if (!name) {
        name = new URL(url).hostname.replace('www.', '');
    }

    saveShortcutBtn.textContent = 'Zapisywanie...';
    saveShortcutBtn.disabled = true;

    let iconBlob = null;

    if (iconFile) {
        try {
            const bitmap = await createImageBitmap(iconFile);
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');
            
            const scale = Math.min(128 / bitmap.width, 128 / bitmap.height);
            const x = (128 / 2) - (bitmap.width / 2) * scale;
            const y = (128 / 2) - (bitmap.height / 2) * scale;
            
            ctx.drawImage(bitmap, x, y, bitmap.width * scale, bitmap.height * scale);
            
            iconBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.8));
            bitmap.close();
        } catch (err) {
            console.error('Błąd podczas przetwarzania własnej ikony:', err);
        }
    }

    const success = await addShortcut(name, url, iconBlob);

    saveShortcutBtn.textContent = 'Dodaj';
    saveShortcutBtn.disabled = false;
    
    if (success) {
        closeShortcutModal();
    }
});

// --- logika interfejsu dla własnych wyszukiwarek ---

function renderCustomEnginesList() {
    const customEngines = getCustomEngines();
    const keys = Object.keys(customEngines);
    
    if (keys.length === 0) {
        customEnginesList.innerHTML = '<i>Brak własnych wyszukiwarek.</i>';
        return;
    }
    
    // używamy klas z css/style.css zamiast stylów inline
    customEnginesList.innerHTML = keys.map(key => `
        <div class="custom-engine-item">
            <span>${customEngines[key].name}</span>
            <button class="remove-engine-btn" data-key="${key}">Usuń</button>
        </div>
    `).join('');
    
    document.querySelectorAll('.remove-engine-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const key = e.target.getAttribute('data-key');
            removeCustomEngine(key);
            renderCustomEnginesList();
        });
    });
}

addEngineBtn.addEventListener('click', () => {
    const name = customEngineNameInput.value.trim();
    const url = customEngineUrlInput.value.trim();
    
    if (addCustomEngine(name, url)) {
        customEngineNameInput.value = '';
        customEngineUrlInput.value = '';
        renderCustomEnginesList();
    }
});

// --- koniec logiki kafelków i wyszukiwarek ---

function openSettings() {
    renderCustomEnginesList(); // <-- odświeżenie listy przy otwarciu
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

// --- logika delegowania eksportu i importu (do pliku backup.js) ---

exportBtn.addEventListener('click', () => {
    exportSettings().catch(err => {
        console.error('Błąd eksportu:', err);
        alert('Wystąpił błąd podczas eksportowania ustawień.');
    });
});

importBtn.addEventListener('click', () => {
    importFileInput.click();
});

importFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
        await importSettings(file);
        alert('Ustawienia zostały pomyślnie zaimportowane.');
        closeSettings();
    } catch (err) {
        console.error('Błąd importu:', err);
        alert('Błąd podczas importu. Upewnij się, że wybierasz poprawny plik kopii zapasowej.');
    } finally {
        importFileInput.value = '';
    }
});

// --- koniec logiki backupu ---

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !settingsModal.classList.contains('hidden')) {
        closeSettings();
    }
    if (e.key === 'Escape' && !shortcutModal.classList.contains('hidden')) {
        closeShortcutModal();
    }
});
