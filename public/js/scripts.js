// Save scroll positions before deleting an image
document.querySelectorAll('.delete-form').forEach(form => {
    form.addEventListener('submit', () => {
        localStorage.setItem("pageScrollPosition", window.scrollY);
        localStorage.setItem("imageGridScrollPosition", document.querySelector('.image-grid').scrollTop);
    });
});

window.addEventListener('load', () => {
    console.log("Window loaded");

    const overlay = document.getElementById('loading-overlay');
    const imageGrid = document.querySelector('.image-grid');
    const pageScrollPosition = localStorage.getItem("pageScrollPosition");
    const imageGridScrollPosition = localStorage.getItem("imageGridScrollPosition");

    if (overlay) {
        overlay.style.display = 'flex';
    } else {
        console.warn("Overlay not found");
        return;
    }

    const allImages = document.querySelectorAll('.image-grid .image-item img');
    console.log(`Found ${allImages.length} images to check`);

    let loadedCount = 0;

    const checkAllImagesLoaded = () => {
        loadedCount++;
        console.log(`Image loaded: ${loadedCount} / ${allImages.length}`);

        if (loadedCount === allImages.length) {
            // Restore scroll positions
            if (performance.navigation.type === 1) {
                window.scrollTo(0, 0);
            } else if (pageScrollPosition) {
                window.scrollTo(0, parseInt(pageScrollPosition));
                localStorage.removeItem("pageScrollPosition");
            }

            if (imageGridScrollPosition) {
                imageGrid.scrollTop = parseInt(imageGridScrollPosition);
                localStorage.removeItem("imageGridScrollPosition");
            }

            overlay.style.display = 'none';
            console.log("All images loaded. Overlay hidden.");
        }
    };

    if (allImages.length === 0) {
        overlay.style.display = 'none';
        console.log("No images found, overlay hidden immediately.");
    } else {
        allImages.forEach(img => {
            if (img.complete) {
                console.log(`Image already loaded: ${img.src}`);
                checkAllImagesLoaded();
            } else {
                img.addEventListener('load', checkAllImagesLoaded);
                img.addEventListener('error', () => {
                    console.warn(`Image failed to load: ${img.src}`);
                    checkAllImagesLoaded();
                });
            }
        });
    }
});

// Image preview overlay
document.querySelectorAll('.image-grid .image-item img').forEach(img => {
    img.addEventListener('click', () => {
        const overlay = document.getElementById('image-preview-overlay');
        const previewImage = document.getElementById('preview-image');

        if (overlay && previewImage) {
            previewImage.src = img.src;
            overlay.style.display = 'flex';
        }
    });
});

const previewOverlay = document.getElementById('image-preview-overlay');
if (previewOverlay) {
    previewOverlay.addEventListener('click', () => {
        previewOverlay.style.display = 'none';
    });
}

// Show image loading count
const imageCountDisplay = document.createElement('div');
imageCountDisplay.id = 'image-count';
imageCountDisplay.className = 'pulse';
imageCountDisplay.style.cssText = `
    color: #DCAE96;
    font-size: 2rem;
    margin-top: 1rem;
    text-align: center;
`;

const overlayElement = document.getElementById('loading-overlay');
if (overlayElement) {
    overlayElement.appendChild(imageCountDisplay);

    const countInterval = setInterval(() => {
        const images = document.querySelectorAll('.image-grid .image-item img');
        const loaded = Array.from(images).filter(img => img.complete).length;

        if (images.length > 0) {
            imageCountDisplay.textContent = `Working on loading your images, please wait... (${loaded} / ${images.length})`;
        }

        if (loaded === images.length && images.length > 0) {
            clearInterval(countInterval);
        }
    }, 100);
}
