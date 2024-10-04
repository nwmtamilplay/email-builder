class PreLoader {
    constructor(settings) {
        this.showClass = settings.showClass; // set Show Class
        this.hideClass = settings.hideClass; // set Hide Class
        this.rangeTop = settings.rangeTop; // set Top Viewport
        this.rangeBottom = settings.rangeBottom; // set Bottom Viewport
        this.setImgLoaderBottomRange = settings.setImgLoaderBottomRange; // set Bottom Viewport
        this.lastScrollTop = 0; // Track the last scroll position
        this.setScrollUp = settings.setScrollUp;  // set ScrollUp Function
        this.setScrollDown = settings.setScrollDown; // set ScrollDown Function
    }

    init() {
        this.triggerPreLoader(); // Initial load
        document.addEventListener('scroll', this.triggerPreLoader.bind(this));
    }
    triggerPreLoader() {
        const pres = document.querySelectorAll('[pre-loader]');
        pres.forEach(pre => {
            const farFromTop = pre.offsetTop;
            if (window.scrollY < farFromTop + pre.clientHeight - this.rangeTop &&
                window.scrollY > farFromTop + (-window.innerHeight + this.rangeBottom)) {
                (pre.getAttribute('data-show-class')) ? pre.classList.add(pre.getAttribute('data-show-class')) : pre.classList.add(this.showClass);
                (pre.getAttribute('data-hide-class')) ? pre.classList.remove(pre.getAttribute('data-hide-class')) : pre.classList.remove(this.hideClass);
            } else {
                (pre.getAttribute('data-show-class')) ? pre.classList.remove(pre.getAttribute('data-show-class')) : pre.classList.remove(this.showClass);
                (pre.getAttribute('data-hide-class')) ? pre.classList.add(pre.getAttribute('data-hide-class')) : pre.classList.add(this.hideClass);
            }
        });
    }
    initImgLoader() {
        // Create an IntersectionObserver for image loading
        this.imgObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.getAttribute('img-loader'); // Set the actual src from data attribute
                    img.classList.add('loaded'); // Optional: add a class once image is loaded
                    img.removeAttribute('img-loader')
                    this.imgObserver.unobserve(img); // Stop observing the image
                }
            });
        }, {
            rootMargin: `0px 0px ${this.setImgLoaderBottomRange}px 0px`, // Configure the rootMargin for visibility
        });

        // Observe all images with [img-loader] attribute
        const imgs = document.querySelectorAll('[img-loader]');
        imgs.forEach(img => {
            this.imgObserver.observe(img)
        });
    }
    startScrollEvent() {
        document.addEventListener('scroll', this.handleScroll.bind(this));
    }
    handleScroll() {
        // Determine scroll direction
        const scrollTop = window.scrollY || window.pageYOffset;
        const isScrollingDown = scrollTop > this.lastScrollTop;

        if (isScrollingDown) {
            this.onScrollDown(this.setScrollDown);
        } else {
            this.onScrollUp(this.setScrollUp);
        }

        // Update last scroll position
        this.lastScrollTop = scrollTop;
    }
    onScrollDown(func) {
        // Handle scroll down event
        if (typeof func === 'function') {
            func()
        }
    }

    onScrollUp(func) {
        // Handle scroll up event
        if (typeof func === 'function') {
            func()
        }
    }
}
