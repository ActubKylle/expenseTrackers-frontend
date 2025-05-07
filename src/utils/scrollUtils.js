// Utility function for smooth scrolling with offset
// Put this in a separate file like utils/scrollUtils.js

/**
 * Scrolls smoothly to a section with offset to account for the navbar
 * @param {string} sectionId - ID of the section to scroll to
 * @param {number} offset - Offset in pixels (default 80px to account for navbar)
 */
export const scrollToSection = (sectionId, offset = 80) => {
    // Close mobile menu if it's open
    // You might need to adjust this depending on how your state is structured
    const mobileMenu = document.querySelector('.mobile-menu-open');
    if (mobileMenu) {
      // Handle closing the menu - depends on your implementation
    }
    
    // Get the target element
    const section = document.getElementById(sectionId);
    
    if (section) {
      // Get position of the section relative to the top of the page
      const sectionTop = section.getBoundingClientRect().top;
      // Get current scroll position
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      
      // Calculate target position with offset
      const offsetPosition = sectionTop + scrollPosition - offset;
      
      // Smooth scroll to that position
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      
      // Update URL hash without scrolling (for better UX and to make browser back/forward work)
      window.history.pushState(null, null, `#${sectionId}`);
    }
  };
  
  /**
   * Handle initial hash navigation when the page loads
   * Call this function in your main component's useEffect
   */
  export const handleInitialHash = (offset = 80) => {
    if (window.location.hash) {
      // Get the target element ID from the hash
      const id = window.location.hash.substring(1);
      
      // Delay the scroll slightly to ensure the page is fully loaded
      setTimeout(() => {
        scrollToSection(id, offset);
      }, 500);
    }
  };