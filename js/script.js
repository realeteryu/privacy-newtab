const clockEl = document.getElementById('clock');
const dateEl = document.getElementById('date');
const greetingEl = document.getElementById('greeting');
const quoteEl = document.getElementById('privacy-quote');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const engineSelect = document.getElementById('engine-select');
const engineSelectModal = document.getElementById('engine-select-modal');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings');

// elementy do backupu
const exportBtn = document.getElementById('export-settings-btn');
const importBtn = document.getElementById('import-settings-btn');
const importFileInput = document.getElementById('import-file-input');

// elementy do trybu prywatnego
const privacyModeBtn = document.getElementById('privacy-mode-btn');
const eyeOpen = document.getElementById('eye-open');
const eyeClosed = document.getElementById('eye-closed');
const shortcutsGridEl = document.getElementById('shortcuts-grid');

// ustawienia widoczności sekcji
const sectionVisibilityKey = 'newtab_section_visibility';
const sectionVisibilityControls = {
    greeting: document.getElementById('show-greeting'),
    search: document.getElementById('show-search'),
    shortcuts: document.getElementById('show-shortcuts')
};
const sectionVisibilityElements = {
    greeting: document.getElementById('greeting-section'),
    search: document.querySelector('.search-section'),
    shortcuts: document.getElementById('shortcuts-section')
};

function getSectionVisibility() {
    const defaults = { greeting: true, search: true, shortcuts: true };

    try {
        const saved = JSON.parse(localStorage.getItem(sectionVisibilityKey));
        if (!saved || typeof saved !== 'object') return defaults;

        return {
            greeting: typeof saved.greeting === 'boolean' ? saved.greeting : true,
            search: typeof saved.search === 'boolean' ? saved.search : true,
            shortcuts: typeof saved.shortcuts === 'boolean' ? saved.shortcuts : true
        };
    } catch (err) {
        console.warn('Nie udało się odczytać ustawień widoczności sekcji:', err);
        return defaults;
    }
}

function applySectionVisibility(visibility = getSectionVisibility()) {
    Object.entries(sectionVisibilityElements).forEach(([section, element]) => {
        if (element) {
            element.classList.toggle('section-hidden', !visibility[section]);
        }

        const control = sectionVisibilityControls[section];
        if (control) {
            control.checked = visibility[section];
        }
    });
}

function saveSectionVisibility() {
    const visibility = {
        greeting: sectionVisibilityControls.greeting.checked,
        search: sectionVisibilityControls.search.checked,
        shortcuts: sectionVisibilityControls.shortcuts.checked
    };

    localStorage.setItem(sectionVisibilityKey, JSON.stringify(visibility));
    applySectionVisibility(visibility);
}

// inicjalizacja bazy danych, ładowanie tła, kafelków i wyszukiwarek przy starcie
initDB().then(() => {
    loadBackground(); // z background.js
    renderShortcuts(); // z shortcuts.js
    renderEngineOptions(); // z engines.js
}).catch((err) => {
    console.error('Nie udało się zainicjalizować bazy danych:', err);
});

// inicjalizacja widoczności sekcji (domyślnie wszystkie są widoczne)
applySectionVisibility();
Object.values(sectionVisibilityControls).forEach((control) => {
    control.addEventListener('change', saveSectionVisibility);
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

// --- logika modala ustawień ---

function openSettings() {
    renderCustomEnginesList(); // z engines.js
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

// --- logika trybu prywatnego ---

function initPrivacyMode() {
    const isActive = localStorage.getItem('newtab_privacy_mode') === 'true';
    if (isActive) {
        shortcutsGridEl.classList.add('privacy-mode-active');
        eyeOpen.classList.add('hidden');
        eyeClosed.classList.remove('hidden');
    }
}

privacyModeBtn.addEventListener('click', () => {
    const isActive = shortcutsGridEl.classList.toggle('privacy-mode-active');
    
    if (isActive) {
        eyeOpen.classList.add('hidden');
        eyeClosed.classList.remove('hidden');
        localStorage.setItem('newtab_privacy_mode', 'true');
    } else {
        eyeOpen.classList.remove('hidden');
        eyeClosed.classList.add('hidden');
        localStorage.setItem('newtab_privacy_mode', 'false');
    }
});

initPrivacyMode();

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

// --- globalne skróty klawiszowe ---

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (!settingsModal.classList.contains('hidden')) {
            closeSettings();
        }
        const shortcutModal = document.getElementById('shortcut-modal');
        if (shortcutModal && !shortcutModal.classList.contains('hidden')) {
            shortcutModal.classList.add('hidden');
        }
    }
});
