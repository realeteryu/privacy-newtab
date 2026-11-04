// narzędzia do konwersji danych binarnych
const blobToBase64 = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
});

const base64ToBlob = async (base64) => {
    const res = await fetch(base64);
    return await res.blob();
};

// główna funkcja eksportu
async function exportSettings() {
    const engine = getSelectedEngine();
    const customEngines = getCustomEngines();
    const shortcuts = await getShortcuts();
    const bgBlob = await getFromDB('background');

    // budowanie wersjonowanej koperty
    const envelope = {
        app: 'privacy-newtab',
        version: '1.1.0',
        exportedAt: new Date().toISOString(),
        data: {
            engine,
            customEngines,
            background: bgBlob ? await blobToBase64(bgBlob) : null,
            shortcuts: []
        }
    };

    // przetwarzanie skrótów (konwersja ikon)
    for (const s of shortcuts) {
        const sCopy = { name: s.name, url: s.url, iconBlob: null };
        if (s.iconBlob) sCopy.iconBlob = await blobToBase64(s.iconBlob);
        envelope.data.shortcuts.push(sCopy);
    }

    // generowanie pliku do pobrania
    const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `privacy-newtab-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

// główna funkcja importu
async function importSettings(file) {
    const text = await file.text();
    const parsed = JSON.parse(text);

    // walidacja formatu
    if (!parsed.data || parsed.app !== 'privacy-newtab') {
        throw new Error('Nieprawidłowy plik kopii zapasowej.');
    }

    const { engine, customEngines, background, shortcuts } = parsed.data;

    // nadpisywanie własnych wyszukiwarek (z walidacją bezpieczeństwa)
    const safeCustomEngines = {};
    if (customEngines) {
        for (const [key, eng] of Object.entries(customEngines)) {
            if (eng.name && eng.url && isSafeUrl(eng.url)) {
                safeCustomEngines[key] = eng;
            }
        }
    }
    saveCustomEngines(safeCustomEngines);

    // nadpisywanie wybranej wyszukiwarki (tylko jeśli istnieje)
    const allValidEngines = { ...APP_DATA.searchEngines, ...safeCustomEngines };
    if (engine && allValidEngines[engine]) {
        setSelectedEngine(engine);
    } else {
        setSelectedEngine('duckduckgo');
    }
    
    // odświeżenie listy wyszukiwarek w UI
    if (typeof renderEngineOptions === 'function') {
        renderEngineOptions();
    }

    // nadpisywanie tła
    if (background) {
        await saveToDB('background', await base64ToBlob(background));
    } else {
        await deleteFromDB('background');
    }

    // nadpisywanie skrótów (z walidacją bezpieczeństwa)
    await deleteFromDB('shortcuts');
    const restored = [];
    for (const s of shortcuts || []) {
        if (s.name && s.url && isSafeUrl(s.url)) {
            let iconBlob = null;
            if (s.iconBlob) iconBlob = await base64ToBlob(s.iconBlob);
            restored.push({ name: s.name, url: s.url, iconBlob });
        }
    }
    await saveShortcuts(restored);

    // odświeżenie interfejsu
    if (typeof loadBackground === 'function') await loadBackground();
    if (typeof renderShortcuts === 'function') await renderShortcuts();
}
