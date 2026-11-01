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
    const shortcuts = await getShortcuts();
    const bgBlob = await getFromDB('background');

    // budowanie wersjonowanej koperty
    const envelope = {
        app: 'privacy-newtab',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        data: {
            engine,
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

    const { engine, background, shortcuts } = parsed.data;

    // nadpisywanie wyszukiwarki
    if (engine) setSelectedEngine(engine);

    // nadpisywanie tła
    if (background) {
        await saveToDB('background', await base64ToBlob(background));
    } else {
        await deleteFromDB('background');
    }

    // nadpisywanie skrótów (najpierw usuwamy stare)
    await deleteFromDB('shortcuts');
    const restored = [];
    for (const s of shortcuts || []) {
        let iconBlob = null;
        if (s.iconBlob) iconBlob = await base64ToBlob(s.iconBlob);
        restored.push({ name: s.name, url: s.url, iconBlob });
    }
    await saveShortcuts(restored);

    // odświeżenie interfejsu
    await loadBackground();
    await renderShortcuts();
}
