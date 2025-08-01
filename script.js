// Global variables
const navLinks = document.querySelectorAll('.nav-link');
const sidebar = document.querySelector('.sidebar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const overlay = document.getElementById('overlay');
const closeBtn = document.querySelector('.close-btn');

// Custom pull-to-refresh handling
let touchStartY = 0;
let isPulling = false;
const PULL_THRESHOLD = 150; // Minimum distance to trigger refresh

// Add pull indicator element
const pullIndicator = document.createElement('div');
pullIndicator.style.position = 'fixed';
pullIndicator.style.top = '0';
pullIndicator.style.left = '0';
pullIndicator.style.right = '0';
pullIndicator.style.height = '4px';
pullIndicator.style.backgroundColor = 'transparent';
pullIndicator.style.zIndex = '9999';
pullIndicator.style.transition = 'background-color 0.2s';
document.body.appendChild(pullIndicator);

// Touch start handler
function handleTouchStart(e) {
    // Only activate pull-to-refresh when at the very top of the page
    if (window.scrollY <= 5) {
        touchStartY = e.touches[0].clientY;
        isPulling = true;
    } else {
        isPulling = false;
    }
}

// Touch move handler
function handleTouchMove(e) {
    if (!isPulling) return;
    
    const touchY = e.touches[0].clientY;
    const pullDistance = touchY - touchStartY;
    
    // Only prevent default when we're actually pulling down
    if (pullDistance > 10) {
        e.preventDefault();
        
        // Update pull indicator
        const pullProgress = Math.min(pullDistance / PULL_THRESHOLD, 1);
        pullIndicator.style.backgroundColor = `rgba(0, 191, 166, ${pullProgress * 0.8})`;
        
        // If pulled hard enough, show active state
        if (pullDistance > PULL_THRESHOLD) {
            pullIndicator.style.backgroundColor = '#00BFA6';
        }
    }
}

// Touch end handler
function handleTouchEnd(e) {
    if (!isPulling) return;
    
    const touchEndY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    const pullDistance = touchEndY - touchStartY;
    
    // Reset pull indicator
    pullIndicator.style.backgroundColor = 'transparent';
    
    // Only refresh if pulled hard enough and we're at the top of the page
    if (pullDistance > PULL_THRESHOLD && window.scrollY <= 5) {
        window.location.reload();
    }
    
    isPulling = false;
}

// Add event listeners with proper options
function setupTouchHandlers() {
    // Define options for event listeners
    const passiveOpts = { passive: true };
    
    // Remove any existing listeners to prevent duplicates
    document.removeEventListener('touchstart', handleTouchStart, passiveOpts);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd, passiveOpts);
    
    // Add new listeners with proper options
    document.addEventListener('touchstart', handleTouchStart, passiveOpts);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, passiveOpts);
}

// Initialize touch handlers when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupTouchHandlers();
    
    // Allow zooming but prevent default gesture behavior
    document.documentElement.addEventListener('gesturestart', function(e) {
        e.preventDefault();
        return false;
    });
});

// Mobile Navigation
document.addEventListener('DOMContentLoaded', function() {
  let isMenuOpen = false;
  let resizeTimeout;
  const TRANSITION_DURATION = 300;
  const MOBILE_BREAKPOINT = 992; // Match this with your CSS breakpoint

  // Toggle menu function
  function toggleMenu(event, forceClose = false) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // If forceClose is true, always close the menu
    isMenuOpen = forceClose ? false : !isMenuOpen;

    if (isMenuOpen) {
      // Open menu
      if (overlay) {
        overlay.style.display = 'block';
        // Small delay to ensure display:block is applied before adding active class
        requestAnimationFrame(() => {
          overlay.classList.add('active');
        });
      }
      
      document.body.classList.add('menu-open');
      document.body.style.overflow = 'hidden';
      
      if (sidebar) {
        sidebar.style.transform = 'translateX(0)';
        sidebar.style.opacity = '1';
        sidebar.style.width = '280px';
        sidebar.style.minWidth = '280px';
        sidebar.style.padding = '0 1rem';
        sidebar.classList.add('active');
      }
      
      if (mobileMenuBtn) {
        mobileMenuBtn.classList.add('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
      }
    } else {
      // Close menu
      if (overlay) overlay.classList.remove('active');
      
      if (sidebar) {
        sidebar.style.transform = 'translateX(-100%)';
        sidebar.style.opacity = '0';
        sidebar.style.width = '0';
        sidebar.style.minWidth = '0';
        sidebar.style.padding = '0';
        sidebar.classList.remove('active');
      }
      
      document.body.classList.remove('menu-open');
      document.body.style.overflow = '';
      
      if (mobileMenuBtn) {
        mobileMenuBtn.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }

      // Hide overlay after transition
      setTimeout(() => {
        if (!isMenuOpen && overlay) {
          overlay.style.display = 'none';
        }
      }, TRANSITION_DURATION);
    }
  }

  // Close menu when clicking outside
  function handleClickOutside(event) {
    if (!isMenuOpen) return;

    const isClickInsideSidebar = sidebar && sidebar.contains(event.target);
    const isClickOnMenuButton = mobileMenuBtn && (event.target === mobileMenuBtn || mobileMenuBtn.contains(event.target));

    if (!isClickInsideSidebar && !isClickOnMenuButton) {
      toggleMenu(event, true);
    }
  }
  
  // Initialize everything
  function init() {
    initMobileMenu();
    setupEventListeners();
  }
  
  // Start the app
  init();

  // Initialize mobile menu state
  function initMobileMenu() {
    if (window.innerWidth <= 768) {
      // Mobile view
      if (mobileMenuBtn) mobileMenuBtn.style.display = 'flex';
      if (sidebar) sidebar.classList.remove('active');
      if (overlay) overlay.style.display = 'none';
      document.body.classList.remove('menu-open');
      isMenuOpen = false;
      if (mobileMenuBtn) mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    } else {
      // Desktop view
      if (mobileMenuBtn) mobileMenuBtn.style.display = 'none';
      if (sidebar) sidebar.classList.add('active');
      if (overlay) overlay.style.display = 'none';
      document.body.classList.remove('menu-open');
      document.body.style.overflow = '';
      isMenuOpen = false;
    }
  }

  // Handle window resize
  function handleResize() {
    // Clear the timeout if it exists
    clearTimeout(resizeTimeout);
    
    // Set a new timeout to run after resizing is complete
    resizeTimeout = setTimeout(() => {
      const windowWidth = window.innerWidth;
      
      // If window is resized to desktop width, ensure menu is closed and reset styles
      if (windowWidth > MOBILE_BREAKPOINT) {
        if (isMenuOpen) {
          toggleMenu(null, true);
        }
        // Reset sidebar styles for desktop
        if (sidebar) {
          sidebar.style.transform = '';
          sidebar.style.opacity = '';
          sidebar.style.width = '';
          sidebar.style.minWidth = '';
          sidebar.style.padding = '';
        }
      } else {
        // On mobile, ensure sidebar is hidden by default
        if (sidebar && !isMenuOpen) {
          sidebar.style.transform = 'translateX(-100%)';
          sidebar.style.opacity = '0';
          sidebar.style.width = '0';
          sidebar.style.minWidth = '0';
          sidebar.style.padding = '0';
        }
      }
    }, 250);
  }

  // Set up event listeners
  function setupEventListeners() {
    // Menu button click
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', function(event) {
        event.stopPropagation();
        toggleMenu(event);
      });
    }

    // Overlay click
    if (overlay) {
      overlay.addEventListener('click', function(event) {
        event.stopPropagation();
        if (isMenuOpen) {
          toggleMenu(event, true);
        }
      });
    }

    // Navigation links
    navLinks.forEach(link => {
      link.addEventListener('click', function(event) {
        if (window.innerWidth <= 768) {
          const href = this.getAttribute('href');
          if (href && href !== '#') {
            event.preventDefault();
            toggleMenu(event, true);
            setTimeout(() => {
              window.location.href = href;
            }, TRANSITION_DURATION);
          }
        }
      });
    });

      if (mobileMenuBtn) {
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
      
      // Hide overlay after transition
      if (overlay) {
        setTimeout(() => {
          if (!isMenuOpen) {
            overlay.style.display = 'none';
          }
        }, 300);
      }
    }
  }
  
  // Close menu when clicking outside
  function handleClickOutside(event) {
    // Check if click is outside sidebar and not on menu button
    if (isMenuOpen && 
        !sidebar.contains(event.target) && 
        event.target !== mobileMenuBtn && 
        !mobileMenuBtn.contains(event.target)) {
      toggleMenu(event, true); // Force close the menu
    }
  }
  
  // Set up event listeners
  function setupEventListeners() {
    // Menu button click
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', function(event) {
        event.stopPropagation();
        toggleMenu(event);
      });
    }
    
    // Overlay click
    if (overlay) {
      overlay.addEventListener('click', function(event) {
        event.stopPropagation();
        if (isMenuOpen) {
          toggleMenu(event);
        }
      });
    }
    
    // Navigation links
    navLinks.forEach(link => {
      link.addEventListener('click', function(event) {
        if (window.innerWidth <= 768) {
          toggleMenu(event);
          // Allow default navigation to happen after menu closes
          if (this.getAttribute('href') !== '#') {
            event.preventDefault();
            setTimeout(() => {
              window.location.href = this.getAttribute('href');
            }, 300);
          }
        }
      });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', handleClickOutside);
    
    // Handle window resize
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(initMobileMenu, 100);
    });
  }
  
  // Initialize everything
  function init() {
    initMobileMenu();
    setupEventListeners();
  }
  
  // Set active link based on current page
  function setActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    navLinks.forEach(link => {
      const linkHref = link.getAttribute('href');
      if ((currentPage === 'index.html' && linkHref === 'index.html') || 
          (currentPage === linkHref)) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
      
      // For single page navigation (if any sections exist on the same page)
      if (linkHref && linkHref.startsWith('#')) {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          const targetId = this.getAttribute('href');
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            // Remove active from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active to clicked link
            this.classList.add('active');
            // Scroll to target
            targetElement.scrollIntoView({ behavior: 'smooth' });
            // Close sidebar on mobile after navigation
            if (window.innerWidth <= 768) {
              toggleMenu(e, true);
            }
          }
        });
      }
    });
  }
  
  // Initialize active link
  setActiveLink();
});

// Initialize contact form when DOM is loaded

// Contact form submission with EmailJS
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;
    
    // Initialize EmailJS with your public key
    emailjs.init("kSnm3tHVv5vxYWXpC");

    // Prevent form submission on mobile keyboard 'go' button
    const formInputs = contactForm.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && window.innerWidth <= 768) {
                e.preventDefault();
                // Find the next input or submit button
                const formElements = Array.from(contactForm.elements);
                const currentIndex = formElements.indexOf(e.target);
                const nextElement = formElements[currentIndex + 1];
                
                if (nextElement) {
                    nextElement.focus();
                } else {
                    // If it's the last field, blur to dismiss the keyboard
                    e.target.blur();
                }
            }
        });
    });

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        
        // Show loader and hide text
        if (btnText) btnText.style.display = 'none';
        if (btnLoader) btnLoader.style.display = 'inline-block';
        submitBtn.disabled = true;

        // Send email using EmailJS
        emailjs.send("service_eaknf5r", "template_hii8ajm", {
            from_name: name,
            from_email: email,
            subject: subject,
            message: message,
            to_name: "Nitya Sri Deepak Raj",
            to_email: "nityasri479@gmail.com"
        })
        .then(() => {
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>Message sent successfully! I'll get back to you soon.</span>
            `;
            contactForm.reset();
            contactForm.parentNode.insertBefore(successMessage, contactForm.nextSibling);
            
            // Remove success message after 5 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 5000);
        })
        .catch((error) => {
            console.log('Full error object:', error);
            console.log('Status:', error.status);
            console.log('Response:', error.text);
            
            // Show detailed error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            
            let errorText = 'Something went wrong! Please try again later.';
            if (error.status === 400) {
                errorText = 'Please fill in all fields correctly.';
            } else if (error.status === 0) {
                errorText = 'Network error. Please check your connection.';
            }
            
            errorMessage.innerHTML = `
                <i class="fas fa-exclamation-circle"></i>
                <span>${errorText}</span>
                <div style="font-size:12px; margin-top:5px; color:#ff9999">
                    Debug: Status ${error.status || 'unknown'}
                </div>
            `;
            
            contactForm.parentNode.insertBefore(errorMessage, contactForm.nextSibling);
            
            // Remove error message after 8 seconds
            setTimeout(() => {
                errorMessage.remove();
            }, 8000);
        })
        .finally(() => {
            // Reset button state on error
            if (btnText) btnText.style.display = 'inline-block';
            if (btnLoader) btnLoader.style.display = 'none';
            submitBtn.disabled = false;
        });
    });
});

// ... (rest of the code remains the same)

// Responsive: close sidebar on resize if desktop
window.addEventListener('resize', () => {
  if (window.innerWidth > 700) {
    sidebar.classList.remove('open');
  }
}); 