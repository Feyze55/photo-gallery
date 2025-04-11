// Save the scroll position of the entire page and the image grid before submitting the form (deleting image)
document.querySelectorAll('.delete-form').forEach(form => {
    form.addEventListener('submit', (e) => {
        // Save the current scroll positions before deletion
        const pageScrollPosition = window.scrollY;
        const imageGridScrollPosition = document.querySelector('.image-grid').scrollTop;
        
        // Store the positions in localStorage for later restoration
        localStorage.setItem("pageScrollPosition", pageScrollPosition);
        localStorage.setItem("imageGridScrollPosition", imageGridScrollPosition);
    });
});

// Restore the scroll positions when the page loads
window.addEventListener('load', () => {
    // Retrieve saved scroll positions from localStorage
    const pageScrollPosition = localStorage.getItem("pageScrollPosition");
    const imageGridScrollPosition = localStorage.getItem("imageGridScrollPosition");
    
    // Get references to the overlay and image grid elements
    const overlay = document.getElementById('loading-overlay');
    const imageGrid = document.querySelector('.image-grid');

    // Show the loading overlay while the content is being loaded
    overlay.style.display = 'block';

    // Periodically check if content (images) has loaded
    const checkContentLoaded = setInterval(() => {
        const imagesLoaded = document.querySelectorAll('.image-item').length;  // Check if images are loaded
        
        if (imagesLoaded > 0) {
            // If the page was refreshed manually, reset the page scroll position to the top
            if (performance.navigation.type === 1) {
                window.scrollTo(0, 0); // Reset the scroll position of the entire page
            }

            // Restore the saved image grid scroll position, if available
            if (imageGridScrollPosition !== null) {
                imageGrid.scrollTop = parseInt(imageGridScrollPosition);
                localStorage.removeItem("imageGridScrollPosition"); // Remove the saved position
            }

            // Hide the loading overlay once content is loaded
            overlay.style.display = 'none';
            clearInterval(checkContentLoaded); // Stop checking once content is loaded
        }
    }, 100); // Check every 100ms if the content is loaded

    // If the page wasn't manually refreshed, restore the page scroll position
    if (pageScrollPosition !== null && performance.navigation.type !== 1) {
        window.scrollTo(0, parseInt(pageScrollPosition)); // Scroll to the saved page position
        localStorage.removeItem("pageScrollPosition"); // Remove the saved position
    }
});

// Image preview functionality
document.querySelectorAll('.image-item img').forEach(img => {
    img.addEventListener('click', () => {
        // Display the image preview in the overlay
        const overlay = document.getElementById('image-preview-overlay');
        const previewImg = document.getElementById('preview-image');
        previewImg.src = img.src; // Set the preview image source to the clicked image
        overlay.style.display = 'flex'; // Show the preview overlay
    });
});

// Close the image preview overlay when clicked
document.getElementById('image-preview-overlay').addEventListener('click', () => {
    document.getElementById('image-preview-overlay').style.display = 'none'; // Hide the preview overlay
});

// Show image loading count in the overlay while images are loading
const imageCountDisplay = document.createElement('div');
imageCountDisplay.id = 'image-count';
imageCountDisplay.classList.add('pulse');
imageCountDisplay.style.color = '#DCAE96';
imageCountDisplay.style.fontSize = '2rem';
imageCountDisplay.style.marginTop = '1rem';
imageCountDisplay.style.textAlign = 'center';
document.getElementById('loading-overlay').appendChild(imageCountDisplay);

// Update image loading count periodically
const updateImageLoadingCount = setInterval(() => {
    const allImages = document.querySelectorAll('.image-item img');
    const loadedImages = Array.from(allImages).filter(img => img.complete); // Filter loaded images
    
    if (allImages.length > 0) {
        imageCountDisplay.textContent = `Working on loading your images, please wait... (${loadedImages.length} / ${allImages.length})`;
    }

    // Stop updating the count once all images are loaded
    if (allImages.length > 0 && loadedImages.length === allImages.length) {
        clearInterval(updateImageLoadingCount); // Stop the interval once all images are loaded
    }
}, 100);

