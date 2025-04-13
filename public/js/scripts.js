document.addEventListener('DOMContentLoaded', () => {
    if (!document.body.classList.contains('gallery')) return;

    console.log("📸 DOM fully loaded - starting gallery scripts...");

    const overlay = document.getElementById('loading-overlay');
    const imageGrid = document.querySelector('.image-grid');
    const pageScrollPosition = localStorage.getItem("pageScrollPosition");
    const imageGridScrollPosition = localStorage.getItem("imageGridScrollPosition");

    // Save scroll positions before deleting an image
    document.querySelectorAll('.delete-form').forEach(form => {
        form.addEventListener('submit', () => {
            localStorage.setItem("pageScrollPosition", window.scrollY);
            localStorage.setItem("imageGridScrollPosition", imageGrid ? imageGrid.scrollTop : 0);
        });
    });

    if (overlay) overlay.style.display = 'flex';

    const allImages = document.querySelectorAll('.image-grid .image-item img');
    let loadedCount = 0;

    const checkAllImagesLoaded = () => {
        loadedCount++;
        if (loadedCount === allImages.length) {
            // Restore scroll positions
            if (performance.navigation.type === 1) {
                window.scrollTo(0, 0);
            } else if (pageScrollPosition) {
                window.scrollTo(0, parseInt(pageScrollPosition));
                localStorage.removeItem("pageScrollPosition");
            }

            if (imageGridScrollPosition && imageGrid) {
                imageGrid.scrollTop = parseInt(imageGridScrollPosition);
                localStorage.removeItem("imageGridScrollPosition");
            }

            if (overlay) overlay.style.display = 'none';
            console.log("✅ All images loaded. Overlay hidden.");
        }
    };

    if (allImages.length === 0) {
        if (overlay) overlay.style.display = 'none';
        console.log("ℹ️ No images found, overlay hidden immediately.");
    } else {
        allImages.forEach(img => {
            if (img.complete) {
                checkAllImagesLoaded();
            } else {
                img.addEventListener('load', checkAllImagesLoaded);
                img.addEventListener('error', checkAllImagesLoaded);
            }
        });
    }

    // Image preview overlay
    const previewOverlay = document.getElementById('image-preview-overlay');
    const previewImage = document.getElementById('preview-image');

    if (previewOverlay && previewImage) {
        document.querySelectorAll('.image-grid .image-item img').forEach(img => {
            img.addEventListener('click', () => {
                previewImage.src = img.src;
                previewOverlay.style.display = 'flex';
            });
        });

        previewOverlay.addEventListener('click', () => {
            previewOverlay.style.display = 'none';
        });
    }

    // Show loading count
    if (overlay) {
        const imageCountDisplay = document.createElement('div');
        imageCountDisplay.id = 'image-count';
        imageCountDisplay.className = 'pulse';
        imageCountDisplay.style.cssText = `
            color: #DCAE96;
            font-size: 2rem;
            margin-top: 1rem;
            text-align: center;
        `;
        overlay.appendChild(imageCountDisplay);

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
});
