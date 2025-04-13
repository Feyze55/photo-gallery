// Save scroll positions before deleting an image
document.querySelectorAll('.delete-form').forEach(form => {
    form.addEventListener('submit', () => {
        localStorage.setItem("pageScrollPosition", window.scrollY);
        localStorage.setItem("imageGridScrollPosition", document.querySelector('.image-grid').scrollTop);
    });
});

window.addEventListener('load', () => {
    const overlay = document.getElementById('loading-overlay');
    const imageGrid = document.querySelector('.image-grid');
    const pageScrollPosition = localStorage.getItem("pageScrollPosition");
    const imageGridScrollPosition = localStorage.getItem("imageGridScrollPosition");

    overlay.style.display = 'flex';

    const allImages = document.querySelectorAll('.image-item img');
    let loadedCount = 0;

    const checkAllImagesLoaded = () => {
        loadedCount++;
        if (loadedCount === allImages.length) {
            // Restore scroll
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
        }
    };

    if (allImages.length === 0) {
        overlay.style.display = 'none'; // No images = nothing to load
    } else {
        allImages.forEach(img => {
            if (img.complete) {
                checkAllImagesLoaded();
            } else {
                img.addEventListener('load', checkAllImagesLoaded);
                img.addEventListener('error', checkAllImagesLoaded); // In case of error, still count
            }
        });
    }
});

// Image preview overlay
document.querySelectorAll('.image-item img').forEach(img => {
    img.addEventListener('click', () => {
        const overlay = document.getElementById('image-preview-overlay');
        document.getElementById('preview-image').src = img.src;
        overlay.style.display = 'flex';
    });
});

document.getElementById('image-preview-overlay').addEventListener('click', () => {
    document.getElementById('image-preview-overlay').style.display = 'none';
});

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

document.getElementById('loading-overlay').appendChild(imageCountDisplay);

const countInterval = setInterval(() => {
    const images = document.querySelectorAll('.image-item img');
    const loaded = Array.from(images).filter(img => img.complete).length;

    if (images.length > 0) {
        imageCountDisplay.textContent = `Working on loading your images, please wait... (${loaded} / ${images.length})`;
    }

    if (loaded === images.length && images.length > 0) {
        clearInterval(countInterval);
    }
}, 100);
