const STORAGE_KEYS = {
    ENGINE: 'newtab_engine',
    BACKGROUND: 'newtab_background'
};

const clockEl = document.getElementById('clock');
const dateEl = document.getElementById('date');
const holidayBadgeEl = document.getElementById('holiday-badge');
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

function updateClock() {
    const now = new Date();
    
    // Godzina
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${hours}:${minutes}:${seconds}`;

    // Data
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const dateStr = now.toLocaleDateString('pl-PL', options);
    dateEl.textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

    // Sprawdzanie świąt
    const monthDay = String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    if (APP_DATA.holidays[monthDay]) {
        holidayBadgeEl.textContent = APP_DATA.holidays[monthDay];
        holidayBadgeEl.classList.remove('hidden');
    } else {
        holidayBadgeEl.classList.add('hidden');
    }

    // Powitanie
    const hour = now.getHours();
    let greeting = 'Dobry wieczór';
    if (hour >= 5 && hour < 18) {
        greeting = 'Dzień dobry';
    }
    greetingEl.textContent = greeting;
}

setInterval(updateClock, 1000);
updateClock();

// Inicjalizacja losowego cytatu
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

function loadBackground() {
    const savedBg = localStorage.getItem(STORAGE_KEYS.BACKGROUND);
    if (savedBg) {
        backgroundEl.style.backgroundImage = `url(${savedBg})`;
    } else {
        backgroundEl.style.backgroundImage = 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)';
    }
}

function setBackground(dataUrl) {
    if (dataUrl) {
        localStorage.setItem(STORAGE_KEYS.BACKGROUND, dataUrl);
        backgroundEl.style.backgroundImage = `url(${dataUrl})`;
    } else {
        localStorage.removeItem(STORAGE_KEYS.BACKGROUND);
        loadBackground();
    }
}

bgUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
        alert('Plik jest zbyt duży. Wybierz obraz mniejszy niż 2MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        setBackground(event.target.result);
    };
    reader.readAsDataURL(file);
});

bgReset.addEventListener('click', () => {
    setBackground(null);
    bgUpload.value = '';
});

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

loadBackground();
