// Blog functionality
let allPosts = [];
let currentPostIndex = 0;
const postsPerLoad = 3;
let isLoading = false;

// Load posts from JSON file
async function loadPosts() {
    try {
        const response = await fetch('posts.json');
        const data = await response.json();
        allPosts = data.posts;
        
        // Create table of contents
        createTableOfContents();
        
        // Load initial posts
        loadMorePosts();
        
        // Set up infinite scroll
        setupInfiniteScroll();
    } catch (error) {
        console.error('Error loading posts:', error);
        document.getElementById('posts-container').innerHTML = '<p>Error loading posts. Please refresh the page.</p>';
    }
}

// Create table of contents
function createTableOfContents() {
    const tocList = document.getElementById('toc-list');
    tocList.innerHTML = '';
    
    allPosts.forEach((post, index) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${post.id}`;
        a.textContent = post.title;
        a.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Check if post is already loaded
            let element = document.getElementById(post.id);
            
            if (!element) {
                // Post not loaded yet, load all posts up to this one
                const postsToLoad = index + 1 - currentPostIndex;
                if (postsToLoad > 0) {
                    // Load posts up to the clicked one
                    const postsContainer = document.getElementById('posts-container');
                    for (let i = currentPostIndex; i <= index; i++) {
                        const postElement = createPostElement(allPosts[i]);
                        postsContainer.appendChild(postElement);
                    }
                    currentPostIndex = index + 1;
                    
                    // Initialize carousels for newly loaded posts
                    initializeNewCarousels();
                }
                
                // Try to get element again
                element = document.getElementById(post.id);
            }
            
            if (element) {
                // Scroll to the post with offset for better visibility
                const yOffset = -20; 
                const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        });
        li.appendChild(a);
        tocList.appendChild(li);
    });
}

// Load more posts for infinite scroll
function loadMorePosts() {
    if (isLoading || currentPostIndex >= allPosts.length) return;
    
    isLoading = true;
    document.getElementById('loading').style.display = 'block';
    
    // Simulate loading delay for smoother experience
    setTimeout(() => {
        const postsContainer = document.getElementById('posts-container');
        const endIndex = Math.min(currentPostIndex + postsPerLoad, allPosts.length);
        
        for (let i = currentPostIndex; i < endIndex; i++) {
            const postElement = createPostElement(allPosts[i]);
            postsContainer.appendChild(postElement);
        }
        
        currentPostIndex = endIndex;
        isLoading = false;
        document.getElementById('loading').style.display = 'none';
        
        // Initialize carousels for newly loaded posts
        initializeNewCarousels();
    }, 300);
}

// Create post HTML element
function createPostElement(post) {
    const article = document.createElement('article');
    article.className = 'post';
    article.id = post.id;
    
    // Post header with title and return button
    const header = document.createElement('div');
    header.className = 'post-header';
    
    const title = document.createElement('h2');
    title.textContent = post.title;
    
    header.appendChild(title);
    article.appendChild(header);
    
    // Post content
    const content = document.createElement('div');
    content.className = 'post-content';
    
    // Add image carousel FIRST if images exist
    if (post.images && post.images.length > 0) {
        const carousel = createCarousel(post.id, post.images);
        content.appendChild(carousel);
    }
    
    // Add paragraphs AFTER carousel
    post.content.forEach(paragraph => {
        const p = document.createElement('p');
        p.textContent = paragraph;
        content.appendChild(p);
    });
    
    article.appendChild(content);
    return article;
}

// Create image carousel matching personal website style
function createCarousel(postId, images) {
    const section = document.createElement('section');
    section.className = 'carousel-section';
    
    const container = document.createElement('div');
    container.className = 'carousel-container';
    container.setAttribute('data-post-id', postId);
    
    // No overlay needed
    
    // Create track
    const track = document.createElement('div');
    track.className = 'carousel-track';
    
    // Add slides
    images.forEach((image, index) => {
        const slide = document.createElement('div');
        slide.className = 'slide';
        
        // Check if this is a video or image
        const isVideo = image.type === 'video' || image.url.match(/\.(mp4|mov|webm|ogg)$/i);
        
        if (isVideo) {
            const video = document.createElement('video');
            video.src = image.url;
            video.controls = true;
            video.muted = true;
            video.playsInline = true;
            video.loading = 'lazy';
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'contain';
            
            slide.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.src = image.url;
            img.alt = image.caption || '';
            img.loading = index === 0 ? 'eager' : 'lazy';
            
            slide.appendChild(img);
        }
        
        track.appendChild(slide);
    });
    
    container.appendChild(track);
    
    // No navigation dots needed
    
    section.appendChild(container);
    
    // Initialize carousel after DOM is ready
    setTimeout(() => initializeCarousel(container, images), 0);
    
    return section;
}

// Initialize carousel with exact functionality from personal website
function initializeCarousel(container, images) {
    const track = container.querySelector('.carousel-track');
    const slides = Array.from(track.querySelectorAll('.slide'));
    
    if (slides.length === 0) return;
    
    // Clone first and last slides for infinite loop
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);
    
    track.appendChild(firstClone);
    track.insertBefore(lastClone, slides[0]);
    
    // Update slides array to include clones
    const allSlides = Array.from(track.querySelectorAll('.slide'));
    
    const numSlides = slides.length;
    let currentIndex = 0;
    let trackIndex = 1; // Start at 1 because of prepended clone
    let carouselActivated = false;
    let autoSlide = null;
    
    // No navigation dots
    
    // Function to get consistent slide dimensions
    function getSlideDimensions() {
        const isMobile = window.innerWidth <= 600;
        
        if (isMobile) {
            const firstSlide = slides[0];
            const computedStyle = window.getComputedStyle(firstSlide);
            const slideWidth = firstSlide.offsetWidth;
            const marginLeft = parseFloat(computedStyle.marginLeft);
            const marginRight = parseFloat(computedStyle.marginRight);
            const totalGap = marginLeft + marginRight;
            
            return {
                slideWidth: slideWidth,
                gap: totalGap,
                isMobile: true
            };
        } else {
            return {
                slideWidth: 360,
                gap: 16,
                isMobile: false
            };
        }
    }
    
    // Go to specific slide
    function goToSlide(index, instant = false) {
        if (index < 0) index = numSlides - 1;
        if (index >= numSlides) index = 0;
        
        allSlides.forEach(slide => {
            slide.classList.remove('active', 'prev', 'next');
        });
        
        currentIndex = index;
        trackIndex = index + 1;
        
        allSlides[trackIndex].classList.add('active');
        
        if (allSlides[trackIndex - 1]) allSlides[trackIndex - 1].classList.add('prev');
        if (allSlides[trackIndex + 1]) allSlides[trackIndex + 1].classList.add('next');
        
        const dims = getSlideDimensions();
        const containerWidth = container.offsetWidth;
        const centerOffset = (containerWidth - dims.slideWidth) / 2;
        const slideOffset = trackIndex * (dims.slideWidth + dims.gap);
        const finalOffset = centerOffset - slideOffset;
        
        if (instant) {
            track.style.transition = 'none';
        } else {
            track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        }
        
        track.style.transform = `translateX(${Math.round(finalOffset)}px)`;
        
        if (instant) {
            setTimeout(() => {
                track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            }, 50);
        }
    }
    
    // Handle infinite loop transitions
    function handleInfiniteLoop() {
        if (currentIndex === 0 && trackIndex === numSlides + 1) {
            // We're on the cloned first slide, instantly reset to actual first slide
            setTimeout(() => {
                track.style.transition = 'none';
                trackIndex = 1;
                const dims = getSlideDimensions();
                const containerWidth = container.offsetWidth;
                const centerOffset = (containerWidth - dims.slideWidth) / 2;
                const slideOffset = trackIndex * (dims.slideWidth + dims.gap);
                const finalOffset = centerOffset - slideOffset;
                track.style.transform = `translateX(${Math.round(finalOffset)}px)`;
                
                setTimeout(() => {
                    track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                }, 50);
            }, 500);
        } else if (currentIndex === numSlides - 1 && trackIndex === 0) {
            // We're on the cloned last slide, instantly reset to actual last slide
            setTimeout(() => {
                track.style.transition = 'none';
                trackIndex = numSlides;
                const dims = getSlideDimensions();
                const containerWidth = container.offsetWidth;
                const centerOffset = (containerWidth - dims.slideWidth) / 2;
                const slideOffset = trackIndex * (dims.slideWidth + dims.gap);
                const finalOffset = centerOffset - slideOffset;
                track.style.transform = `translateX(${Math.round(finalOffset)}px)`;
                
                setTimeout(() => {
                    track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                }, 50);
            }, 500);
        }
    }
    
    // Navigation functions
    function navigateNext() {
        if (currentIndex === numSlides - 1) {
            trackIndex = numSlides + 1;
            allSlides.forEach(slide => slide.classList.remove('active', 'prev', 'next'));
            allSlides[trackIndex].classList.add('active');
            if (allSlides[trackIndex - 1]) allSlides[trackIndex - 1].classList.add('prev');
            if (allSlides[trackIndex + 1]) allSlides[trackIndex + 1].classList.add('next');
            
            const dims = getSlideDimensions();
            const containerWidth = container.offsetWidth;
            const centerOffset = (containerWidth - dims.slideWidth) / 2;
            const slideOffset = trackIndex * (dims.slideWidth + dims.gap);
            const finalOffset = centerOffset - slideOffset;
            track.style.transform = `translateX(${Math.round(finalOffset)}px)`;
            
            currentIndex = 0;
            
            handleInfiniteLoop();
        } else {
            goToSlide(currentIndex + 1);
        }
    }
    
    function navigatePrev() {
        if (currentIndex === 0) {
            trackIndex = 0;
            allSlides.forEach(slide => slide.classList.remove('active', 'prev', 'next'));
            allSlides[trackIndex].classList.add('active');
            if (allSlides[trackIndex - 1]) allSlides[trackIndex - 1].classList.add('prev');
            allSlides[trackIndex + 1].classList.add('next');
            
            const dims = getSlideDimensions();
            const containerWidth = container.offsetWidth;
            const centerOffset = (containerWidth - dims.slideWidth) / 2;
            const slideOffset = trackIndex * (dims.slideWidth + dims.gap);
            const finalOffset = centerOffset - slideOffset;
            track.style.transform = `translateX(${Math.round(finalOffset)}px)`;
            
            currentIndex = numSlides - 1;
            
            handleInfiniteLoop();
        } else {
            goToSlide(currentIndex - 1);
        }
    }
    
    // Function to activate carousel
    function activateCarousel() {
        if (!carouselActivated) {
            carouselActivated = true;
            
            // Start auto-slide after activation
            autoSlide = setInterval(() => {
                navigateNext();
            }, 2750);
        }
    }
    
    // Initialize first slide
    goToSlide(0);
    
    // Activate carousel on interaction
    container.addEventListener('mouseenter', () => {
        activateCarousel();
    });
    
    // Pause auto-slide when hovering
    container.addEventListener('mouseenter', () => {
        if (autoSlide) {
            clearInterval(autoSlide);
        }
    });
    
    container.addEventListener('mouseleave', () => {
        if (carouselActivated && autoSlide) {
            clearInterval(autoSlide);
            autoSlide = setInterval(() => {
                navigateNext();
            }, 2750);
        }
    });
    
    // Click on slides to navigate
    allSlides.forEach((slide, index) => {
        slide.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Don't navigate if clicking on a video
            if (e.target.tagName === 'VIDEO' || slide.querySelector('video')) {
                activateCarousel();
                return;
            }
            
            activateCarousel();
            let targetIndex;
            if (index === 0) {
                targetIndex = numSlides - 1;
            } else if (index === numSlides + 1) {
                targetIndex = 0;
            } else {
                targetIndex = index - 1;
            }
            goToSlide(targetIndex);
        });
    });
    
    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    let isSwiping = false;
    
    container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        isSwiping = true;
        activateCarousel();
        if (autoSlide) {
            clearInterval(autoSlide);
        }
    }, { passive: true });
    
    container.addEventListener('touchmove', (e) => {
        if (!isSwiping) return;
        const currentX = e.changedTouches[0].screenX;
        const diff = currentX - touchStartX;
        if (Math.abs(diff) > 10) {
            e.preventDefault();
        }
    }, { passive: false });
    
    container.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        isSwiping = false;
        
        if (carouselActivated) {
            autoSlide = setInterval(() => {
                navigateNext();
            }, 2750);
        }
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 30;
        if (touchEndX < touchStartX - swipeThreshold) {
            navigateNext();
        }
        if (touchEndX > touchStartX + swipeThreshold) {
            navigatePrev();
        }
    }
    
    // Handle resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const savedIndex = currentIndex;
            goToSlide(savedIndex, true);
        }, 250);
    });
    
    // Periodic recalibration for mobile
    if (window.innerWidth <= 600) {
        setInterval(() => {
            if (carouselActivated) {
                const dims = getSlideDimensions();
                const containerWidth = container.offsetWidth;
                const centerOffset = (containerWidth - dims.slideWidth) / 2;
                const slideOffset = trackIndex * (dims.slideWidth + dims.gap);
                const finalOffset = centerOffset - slideOffset;
                
                const currentTransform = track.style.transform;
                const currentOffset = parseFloat(currentTransform.match(/translateX\(([-\d.]+)px\)/)?.[1] || 0);
                
                if (Math.abs(currentOffset - Math.round(finalOffset)) > 2) {
                    track.style.transform = `translateX(${Math.round(finalOffset)}px)`;
                }
            }
        }, 5000);
    }
}

// Initialize carousels for newly loaded posts
function initializeNewCarousels() {
    // Carousels are initialized when created in createCarousel function
}

// Set up infinite scroll
function setupInfiniteScroll() {
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
            loadMorePosts();
        }
    });
}

// Teleportation effect function
function teleportToTop() {
    const overlay = document.querySelector('.teleport-overlay');
    const body = document.body;
    const contentWrapper = document.querySelector('.content-wrapper');
    
    // Add teleporting class to body
    body.classList.add('teleporting');
    
    // Quick fade to black
    contentWrapper.style.transition = 'all 0.2s ease-out';
    contentWrapper.style.transform = 'scale(0.8)';
    contentWrapper.style.opacity = '0';
    
    // Quick overlay fade to black
    overlay.style.animation = 'teleportOut 0.25s ease-out forwards';
    
    // Wait for fade to complete, then teleport
    setTimeout(() => {
        // Instantly move to top
        window.scrollTo(0, 0);
        
        // Reset content wrapper for fade in
        contentWrapper.style.transition = 'none';
        contentWrapper.style.transform = 'scale(0.9)';
        
        // Quick fade back in
        overlay.style.animation = 'teleportIn 0.3s ease-out forwards';
        
        // Animate content fading back in
        setTimeout(() => {
            contentWrapper.style.transition = 'all 0.25s ease-out';
            contentWrapper.style.transform = 'scale(1)';
            contentWrapper.style.opacity = '1';
        }, 20);
        
        // Clean up after animation
        setTimeout(() => {
            body.classList.remove('teleporting');
            overlay.style.animation = '';
            contentWrapper.style.transition = '';
            contentWrapper.style.transform = '';
            contentWrapper.style.opacity = '';
        }, 300);
    }, 250); // Quick timing for fade to black
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
    
    // Setup floating home button
    const floatingHome = document.getElementById('floating-home');
    if (floatingHome) {
        // Show/hide based on scroll position
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            // Show button when scrolled down
            if (window.scrollY > 300) {
                floatingHome.classList.add('visible');
            } else {
                floatingHome.classList.remove('visible');
            }
        });
        
        // Handle click
        floatingHome.addEventListener('click', (e) => {
            e.preventDefault();
            teleportToTop();
        });
    }
});