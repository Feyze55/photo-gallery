// Ensure the page starts at the top
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
} else {
    window.onbeforeunload = () => window.scrollTo(0, 0);
}

// Loading overlay: wait for all images to fully load
window.addEventListener('load', () => {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = 'none';
});

// Prevent form resubmission on refresh (for delete/upload forms)
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}

// Fullscreen image preview
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('.image-item img');
    const overlay = document.getElementById('image-preview-overlay');
    const previewImage = document.getElementById('preview-image');

    if (!images || !overlay || !previewImage) return;

    images.forEach(img => {
        img.addEventListener('click', () => {
            previewImage.src = img.src;
            overlay.style.display = 'flex';
        });
    });

    overlay.addEventListener('click', () => {
        overlay.style.display = 'none';
        previewImage.src = '';
    });
});
