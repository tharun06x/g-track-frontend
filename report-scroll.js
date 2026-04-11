document.addEventListener('DOMContentLoaded', () => {
    // 1. Setting up elegant Intersection Observer for Scroll items
    const scrollContainers = document.querySelectorAll('.scroll-container');
    
    scrollContainers.forEach(container => {
        // Options setup to trigger when items are 10% into the scroll container's view computationally
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Element popped into view
                    entry.target.classList.add('pop-up');
                    entry.target.classList.remove('vanish');
                } else {
                    // Element vanished entirely out of view
                    entry.target.classList.add('vanish');
                    entry.target.classList.remove('pop-up');
                }
            });
        }, {
            root: container, // Bounds the observer specifically to the scrollable div frame natively
            rootMargin: '-5% 0px -5% 0px',
            threshold: 0.1
        });
        
        // Target every item in this specific scroll container dynamically
        container.querySelectorAll('.scroll-item').forEach((item, index) => {
            // Setup base hidden structural class mathematically
            item.classList.add('vanish'); 
            // Add slight staggered delay to popping up initially natively
            item.style.transitionDelay = `${(index % 5) * 50}ms`;
            observer.observe(item);
        });
    });
});
