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
const settingsBackBtn = document.getElementById('settings-back');
const settingsTitle = document.getElementById('settings-title');
const settingsHome = document.getElementById('settings-home');
const settingsPanels = document.querySelectorAll('[data-settings-panel]');
const settingsMenuButtons = document.querySelectorAll('[data-settings-view]');

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

// ustawienia kolejności sekcji
const sectionOrderKey = 'newtab_section_order';

const sectionOrderControls = {
    greeting: document.getElementById('order-greeting'),
    search: document.getElementById('order-search'),
    shortcuts: document.getElementById('order-shortcuts')
};

// domyślny układ strony
const defaultSectionOrder = {
    greeting: 1,
    search: 2,
    shortcuts: 3
};

// --- widoczność sekcji ---

function getSectionVisibility() {
    const defaults = {
        greeting: true,
        search: true,
        shortcuts: true
    };

    try {
        const saved = JSON.parse(localStorage.getItem(sectionVisibilityKey));

        if (!saved || typeof saved !== 'object') {
            return defaults;
        }

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

// --- kolejność sekcji ---

function getSectionOrder() {
    try {
        const saved = JSON.parse(localStorage.getItem(sectionOrderKey));

        if (!saved || typeof saved !== 'object') {
            return { ...defaultSectionOrder };
        }

        const values = ['greeting', 'search', 'shortcuts'].map(
            key => Number(saved[key])
        );

        const valid = values.every(
            value => Number.isInteger(value) && value >= 1 && value <= 3
        ) && new Set(values).size === 3;

        if (!valid) {
            return { ...defaultSectionOrder };
        }

        return {
            greeting: Number(saved.greeting),
            search: Number(saved.search),
            shortcuts: Number(saved.shortcuts)
        };
    } catch (err) {
        console.warn('Nie udało się odczytać kolejności sekcji:', err);
        return { ...defaultSectionOrder };
    }
}

function applySectionOrder(order = getSectionOrder()) {
    Object.entries(sectionVisibilityElements).forEach(([section, element]) => {
        if (element) {
            element.style.order = order[section];
        }

        const control = sectionOrderControls[section];

        if (control) {
            control.value = String(order[section]);
        }
    });
}

function saveSectionOrder(changedSection, newPosition) {
    const order = getSectionOrder();
    const oldPosition = order[changedSection];
    const selectedPosition = Number(newPosition);

    // znajdź sekcję, która zajmuje wybraną pozycję
    const otherSection = Object.keys(order).find(
        section =>
            section !== changedSection &&
            order[section] === selectedPosition
    );

    // zamień pozycje obu sekcji
    if (otherSection) {
        order[otherSection] = oldPosition;
    }

    order[changedSection] = selectedPosition;

    localStorage.setItem(sectionOrderKey, JSON.stringify(order));
    applySectionOrder(order);
}

// bezpieczne przywracanie kolejności z kopii zapasowej
function applyImportedSectionOrder(order) {
    if (!order || typeof order !== 'object') {
        return;
    }

    const values = ['greeting', 'search', 'shortcuts'].map(
        key => Number(order[key])
    );

    const valid = values.every(
        value => Number.isInteger(value) && value >= 1 && value <= 3
    ) && new Set(values).size === 3;

    if (!valid) {
        return;
    }

    const safeOrder = {
        greeting: Number(order.greeting),
        search: Number(order.search),
        shortcuts: Number(order.shortcuts)
    };

    localStorage.setItem(sectionOrderKey, JSON.stringify(safeOrder));
    applySectionOrder(safeOrder);
}

// --- inicjalizacja bazy danych ---

initDB().then(() => {
    loadBackground(); // z background.js
    renderShortcuts(); // z shortcuts.js
    renderEngineOptions(); // z engines.js
}).catch((err) => {
    console.error('Nie udało się zainicjalizować bazy danych:', err);
});

// inicjalizacja widoczności sekcji
applySectionVisibility();

// inicjalizacja kolejności sekcji
// domyślnie: powitania, wyszukiwarka, skróty
applySectionOrder();

// obsługa checkboxów widoczności
Object.values(sectionVisibilityControls).forEach((control) => {
    if (control) {
        control.addEventListener('change', saveSectionVisibility);
    }
});

// obsługa menu wyboru kolejności
Object.entries(sectionOrderControls).forEach(([section, control]) => {
    if (control) {
        control.addEventListener('change', () => {
            saveSectionOrder(section, control.value);
        });
    }
});

// --- zegar, data i powitanie ---

function updateClock() {
    const now = new Date();

    // godzina
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    clockEl.textContent = `${hours}:${minutes}:${seconds}`;

    // data i święta
    const options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    };

    let dateStr = now.toLocaleDateString('pl-PL', options);
    dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

    const monthDay =
        String(now.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(now.getDate()).padStart(2, '0');

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

// --- losowy cytat ---

function setRandomQuote() {
    const quotes = APP_DATA.privacyQuotes;
    const randomIndex = Math.floor(Math.random() * quotes.length);

    quoteEl.textContent = quotes[randomIndex];
}

setRandomQuote();

// --- obsługa wyszukiwarki (logika w engines.js) ---

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

const settingsViewTitles = {
    appearance: 'Wygląd',
    search: 'Wyszukiwanie',
    data: 'Dane i kopie zapasowe',
    about: 'O projekcie',
    support: 'Wesprzyj projekt'
};

function showSettingsHome() {
    settingsHome.classList.remove('hidden');
    settingsPanels.forEach(panel => panel.classList.add('hidden'));
    settingsBackBtn.classList.add('hidden');
    settingsTitle.textContent = 'Ustawienia';
}

function showSettingsView(viewName) {
    const targetPanel = document.querySelector(`[data-settings-panel="${viewName}"]`);
    if (!targetPanel) return;

    settingsHome.classList.add('hidden');
    settingsPanels.forEach(panel => panel.classList.toggle('hidden', panel !== targetPanel));
    settingsBackBtn.classList.remove('hidden');
    settingsTitle.textContent = settingsViewTitles[viewName] || 'Ustawienia';

    if (viewName === 'search') renderCustomEnginesList();
}

function openSettings() {
    showSettingsHome();
    settingsModal.classList.remove('hidden');
}

function closeSettings() {
    settingsModal.classList.add('hidden');
    showSettingsHome();
}

settingsMenuButtons.forEach(button => {
    button.addEventListener('click', () => showSettingsView(button.dataset.settingsView));
});

settingsBackBtn.addEventListener('click', showSettingsHome);
settingsBtn.addEventListener('click', openSettings);
closeSettingsBtn.addEventListener('click', closeSettings);

settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        closeSettings();
    }
});

// --- tryb prywatny ---

function initPrivacyMode() {
    const isActive =
        localStorage.getItem('newtab_privacy_mode') === 'true';

    if (isActive) {
        shortcutsGridEl.classList.add('privacy-mode-active');
        eyeOpen.classList.add('hidden');
        eyeClosed.classList.remove('hidden');
    }
}

privacyModeBtn.addEventListener('click', () => {
    const isActive =
        shortcutsGridEl.classList.toggle('privacy-mode-active');

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

// --- eksport i import ustawień (backup.js) ---

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

    if (!file) {
        return;
    }

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
            if (settingsBackBtn && !settingsBackBtn.classList.contains('hidden')) {
                showSettingsHome();
            } else {
                closeSettings();
            }
        }

        const shortcutModal = document.getElementById('shortcut-modal');

        if (shortcutModal && !shortcutModal.classList.contains('hidden')) {
            shortcutModal.classList.add('hidden');
        }
    }
});
