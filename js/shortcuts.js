const shortcutsGrid = document.getElementById('shortcuts-grid');
const addShortcutBtn = document.getElementById('add-shortcut-btn');

const shortcutModal = document.getElementById('shortcut-modal');
const shortcutNameInput = document.getElementById('shortcut-name');
const shortcutUrlInput = document.getElementById('shortcut-url');
const shortcutIconUpload = document.getElementById('shortcut-icon-upload');
const saveShortcutBtn = document.getElementById('save-shortcut-btn');
const cancelShortcutBtn = document.getElementById('cancel-shortcut-btn');

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

    // --- obsługa pustego stanu ---
    if (shortcuts.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = 'Nie masz jeszcze żadnych skrótów. Kliknij <span class="empty-hint-plus">+</span> poniżej, aby dodać pierwszy.';
        shortcutsGrid.appendChild(emptyState);
        return; // przerywamy dalsze wykonywanie funkcji
    }

    for (const shortcut of shortcuts) {
        const wrapper = document.createElement('div');
        wrapper.className = 'shortcut-wrapper';

        const item = document.createElement('a');
        item.href = shortcut.url;
        item.target = '_blank';
        item.rel = 'noopener noreferrer';
        item.className = 'shortcut-item';
        item.title = shortcut.name;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-shortcut-btn';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.setAttribute('aria-label', 'Usuń skrót');
        
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            e.stopPropagation();
            if (confirm(`Czy na pewno chcesz usunąć skrót "${shortcut.name}"?`)) {
                removeShortcut(shortcut.url);
            }
        });

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

        wrapper.appendChild(item);
        wrapper.appendChild(deleteBtn); 

        shortcutsGrid.appendChild(wrapper);
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
