// zarządzanie wyszukiwarkami (domyślnymi i własnymi)

const ENGINE_STORAGE_KEYS = {
    ENGINE: 'newtab_engine',
    CUSTOM_ENGINES: 'newtab_custom_engines'
};

// pobieranie własnych wyszukiwarek z localStorage
function getCustomEngines() {
    const data = localStorage.getItem(ENGINE_STORAGE_KEYS.CUSTOM_ENGINES);
    return data ? JSON.parse(data) : {};
}

// zapisywanie własnych wyszukiwarek
function saveCustomEngines(engines) {
    localStorage.setItem(ENGINE_STORAGE_KEYS.CUSTOM_ENGINES, JSON.stringify(engines));
}

// pobieranie aktualnie wybranej wyszukiwarki
function getSelectedEngine() {
    return localStorage.getItem(ENGINE_STORAGE_KEYS.ENGINE) || 'duckduckgo';
}

// ustawianie wybranej wyszukiwarki
function setSelectedEngine(engineKey) {
    localStorage.setItem(ENGINE_STORAGE_KEYS.ENGINE, engineKey);
    const engineSelect = document.getElementById('engine-select');
    const engineSelectModal = document.getElementById('engine-select-modal');
    if (engineSelect) engineSelect.value = engineKey;
    if (engineSelectModal) engineSelectModal.value = engineKey;
}

// generowanie opcji w obu listach rozwijanych (main + modal)
function renderEngineOptions() {
    const customEngines = getCustomEngines();
    const allEngines = { ...APP_DATA.searchEngines, ...customEngines };
    
    const currentValue = getSelectedEngine();
    const engineSelect = document.getElementById('engine-select');
    const engineSelectModal = document.getElementById('engine-select-modal');
    
    let optionsHTML = '';
    for (const [key, engine] of Object.entries(allEngines)) {
        optionsHTML += `<option value="${key}">${engine.name}</option>`;
    }
    
    if (engineSelect) engineSelect.innerHTML = optionsHTML;
    if (engineSelectModal) engineSelectModal.innerHTML = optionsHTML;
    
    // przywrócenie wybranej wartości
    if (allEngines[currentValue]) {
        setSelectedEngine(currentValue);
    } else {
        setSelectedEngine('duckduckgo');
    }
}

// wykonywanie wyszukiwania
function performSearch(query) {
    if (!query.trim()) return;
    const engineKey = getSelectedEngine();
    const customEngines = getCustomEngines();
    const allEngines = { ...APP_DATA.searchEngines, ...customEngines };
    
    const engine = allEngines[engineKey] || allEngines.duckduckgo;
    const url = engine.url.replace('%s', encodeURIComponent(query.trim()));
    window.location.href = url;
}

// dodawanie nowej własnej wyszukiwarki (logika)
function addCustomEngine(name, url) {
    if (!name || !url) {
        alert('Podaj nazwę i adres URL.');
        return false;
    }
    
    if (!url.includes('%s')) {
        alert('Adres URL musi zawierać parametr %s, np. https://przyklad.pl/szukaj?q=%s');
        return false;
    }
    
    const customEngines = getCustomEngines();
    const key = 'custom_' + Date.now();
    
    customEngines[key] = { name, url };
    saveCustomEngines(customEngines);
    renderEngineOptions();
    return true;
}

// usuwanie własnej wyszukiwarki
function removeCustomEngine(key) {
    const customEngines = getCustomEngines();
    delete customEngines[key];
    saveCustomEngines(customEngines);
    
    // jeśli usunięto aktualnie wybraną, wracamy do domyślnej
    if (getSelectedEngine() === key) {
        setSelectedEngine('duckduckgo');
    }
    
    renderEngineOptions();
}

// --- logika interfejsu dla własnych wyszukiwarek ---

const customEngineNameInput = document.getElementById('custom-engine-name');
const customEngineUrlInput = document.getElementById('custom-engine-url');
const addEngineBtn = document.getElementById('add-engine-btn');
const customEnginesList = document.getElementById('custom-engines-list');

// renderowanie listy własnych wyszukiwarek w oknie ustawień
function renderCustomEnginesList() {
    const customEngines = getCustomEngines();
    const keys = Object.keys(customEngines);
    
    if (keys.length === 0) {
        customEnginesList.innerHTML = '<i>Brak własnych wyszukiwarek.</i>';
        return;
    }
    
    customEnginesList.innerHTML = keys.map(key => `
        <div class="custom-engine-item">
            <span>${customEngines[key].name}</span>
            <button class="remove-engine-btn" data-key="${key}">Usuń</button>
        </div>
    `).join('');
    
    // podpięcie zdarzeń do przycisków usuwania
    document.querySelectorAll('.remove-engine-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const key = e.target.getAttribute('data-key');
            removeCustomEngine(key);
            renderCustomEnginesList();
        });
    });
}

// obsługa przycisku dodawania wyszukiwarki
addEngineBtn.addEventListener('click', () => {
    const name = customEngineNameInput.value.trim();
    const url = customEngineUrlInput.value.trim();
    
    if (addCustomEngine(name, url)) {
        customEngineNameInput.value = '';
        customEngineUrlInput.value = '';
        renderCustomEnginesList();
    }
});
