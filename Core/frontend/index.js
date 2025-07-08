// Add click handlers for navigation buttons
document.querySelectorAll('.nav-button').forEach(button => {
  button.addEventListener('click', function(event) {
    // Handle Canopy Agents dropdown
    if (this.nextElementSibling?.classList.contains('dropdown-menu')) {
      event.preventDefault();
      const dropdown = this.nextElementSibling;
      const isActive = dropdown.classList.contains('hidden');
      
      // Close all other dropdowns
      document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (menu !== dropdown) {
          menu.classList.add('hidden');
        }
      });
      
      // Toggle this dropdown
      dropdown.classList.toggle('hidden');
      
      // Add ripple effect
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      this.appendChild(ripple);
      
      const rect = this.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      setTimeout(() => {
        ripple.remove();
      }, 1000);
      
      return;
    }
    
    // Remove active class from all buttons
    document.querySelectorAll('.nav-button').forEach(btn => {
      btn.classList.remove('active');
      btn.classList.remove('bg-[#2c3135]');
    });
    
    // Add active class to clicked button
    this.classList.add('active');
    this.classList.add('bg-[#2c3135]');
    
    // Smooth transition animation
    this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
  });
});

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  const dropdowns = document.querySelectorAll('.dropdown-menu');
  dropdowns.forEach(dropdown => {
    if (!dropdown.contains(event.target) && !dropdown.previousElementSibling.contains(event.target)) {
      dropdown.classList.add('hidden');
    }
  });
});

// Add click handlers for tab buttons
document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', function() {
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
      btn.classList.remove('border-b-white');
      btn.classList.remove('text-white');
      btn.querySelector('p').classList.remove('text-white');
      btn.querySelector('p').classList.add('text-[#a3acb2]');
    });
    
    // Add active class to clicked tab
    this.classList.add('active');
    this.classList.add('border-b-white');
    this.classList.add('text-white');
    this.querySelector('p').classList.add('text-white');
    this.querySelector('p').classList.remove('text-[#a3acb2]');
    
    // Smooth transition animation
    this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    
    // Add ripple effect
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    this.appendChild(ripple);
    
    const rect = this.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    setTimeout(() => {
      ripple.remove();
    }, 1000);
  });
});

// Add click handlers for task items
document.querySelectorAll('.task-item').forEach(button => {
  button.addEventListener('click', function() {
    // Add loading state
    const taskName = this.querySelector('p').textContent;
    const loading = document.createElement('div');
    loading.classList.add('loading');
    this.appendChild(loading);
    
    // Simulate task click processing
    setTimeout(() => {
      loading.remove();
      // Here you would typically navigate to the task detail view
      console.log('Task clicked:', taskName);
    }, 500);
  });
});

// Add click handlers for branch buttons
document.querySelectorAll('.branch-button').forEach(button => {
  button.addEventListener('click', function() {
    const branch = this.dataset.branch;
    const loading = document.createElement('div');
    loading.classList.add('loading');
    this.appendChild(loading);
    
    if (branch === 'canopy') {
      // Redirect to Canopy access page with loading animation
      setTimeout(() => {
        loading.remove();
        const path = window.location.pathname;
        const base = path.substring(0, path.lastIndexOf('/') + 1);
        window.location.href = base + '../../branches/canopy/frontend/Canopy-access.html';
      }, 500);
    } else {
      // Add any other branch-specific logic here
      setTimeout(() => {
        loading.remove();
        console.log(`Clicked on ${branch} branch`);
      }, 500);
    }
  });
});

// Add click handlers for accordion items
document.querySelectorAll('.accordion').forEach(accordion => {
  accordion.addEventListener('click', function() {
    // Add smooth transition for accordion content
    const content = this.querySelector('div');
    if (content) {
      content.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    }
  });
});

// Add hover effects for all interactive elements
document.querySelectorAll('.nav-button, .tab-button, .task-item, .branch-button, .accordion').forEach(element => {
  element.addEventListener('mouseenter', () => {
    element.style.transform = 'scale(1.02)';
  });
  
  element.addEventListener('mouseleave', () => {
    element.style.transform = 'scale(1)';
  });
});

// Add keyboard navigation support
document.addEventListener('keydown', (event) => {
  if (event.key === 'Tab') {
    const focusableElements = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];
    
    if (event.shiftKey) {
      if (document.activeElement === firstFocusableElement) {
        lastFocusableElement.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusableElement) {
        firstFocusableElement.focus();
        event.preventDefault();
      }
    }
  }
});