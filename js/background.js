const backgroundEl = document.getElementById('background');
const bgUpload = document.getElementById('bg-upload');
const bgReset = document.getElementById('bg-reset');

// zmienna do przechowywania obecnego url tła
let currentBgObjectUrl = null;

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
