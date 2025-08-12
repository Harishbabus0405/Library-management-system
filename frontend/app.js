// app.js - Library Management System Core Functionality

document.addEventListener('DOMContentLoaded', function() {
  try {
    // Initialize features based on current page
    const currentPage = document.body.dataset.page || getCurrentPageName();
    
    // Common initialization
    initBackButtons();
    initFormSubmissions();
    
    // Page-specific initialization
    switch(currentPage) {
      case 'welcome':
        if (typeof particlesJS === 'function') {
          initParticles();
        } else {
          console.warn('Particles.js not loaded - skipping animation');
        }
        break;
      case 'login':
        initLoginPage();
        break;
      case 'dashboard':
        initDashboard();
        break;
      case 'view-books':
      case 'view-students':
        initDataTables();
        break;
      case 'add-book':
      case 'add-student':
      case 'issue-book':
      case 'return-book':
        initFormValidations();
        break;
      default:
        console.log('No specific initialization for page:', currentPage);
    }
  } catch (error) {
    console.error('Initialization error:', error);
    showToast('System initialization failed', 'error');
  }
});

// Helper Functions
function getCurrentPageName() {
  try {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '').replace(/_/g, '-');
    return page || 'unknown';
  } catch (e) {
    console.error('Error getting page name:', e);
    return 'unknown';
  }
}

function showToast(message, type = 'success') {
  try {
    if (!message || typeof message !== 'string') {
      console.warn('Invalid toast message');
      return;
    }

    const validTypes = ['success', 'error', 'warning', 'info'];
    const toastType = validTypes.includes(type) ? type : 'success';

    const toast = document.createElement('div');
    toast.className = `toast toast-${toastType}`;
    toast.textContent = message;
    toast.setAttribute('role', 'alert');
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
      setTimeout(() => {
        toast.remove();
      }, 3000);
    }, 100);
  } catch (e) {
    console.error('Error showing toast:', e);
  }
}

// Common Initializations
function initBackButtons() {
  try {
    const buttons = document.querySelectorAll('.back-button');
    if (!buttons.length) return;

    buttons.forEach(button => {
      if (button instanceof HTMLElement) {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          const href = button.getAttribute('href');
          if (href) {
            window.location.href = href;
          }
        });
      }
    });
  } catch (e) {
    console.error('Error initializing back buttons:', e);
  }
}

function initFormSubmissions() {
  try {
    const forms = document.querySelectorAll('form');
    if (!forms.length) return;

    forms.forEach(form => {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        try {
          setTimeout(() => {
            let formName = 'Form';
            const classList = form.classList;
            
            if (classList.contains('login-form')) formName = 'Login';
            else if (classList.contains('book-form')) formName = 'Book';
            else if (classList.contains('student-form')) formName = 'Student';
            else if (classList.contains('transaction-form')) formName = 'Transaction';
            
            showToast(`${formName} submitted successfully!`);
            
            if (!classList.contains('login-form')) {
              setTimeout(() => {
                window.location.href = 'dashboard.html';
              }, 1500);
            } else {
              window.location.href = 'dashboard.html';
            }
          }, 800);
        } catch (formError) {
          console.error('Form submission error:', formError);
          showToast('Form submission failed', 'error');
        }
      });
    });
  } catch (e) {
    console.error('Error initializing form submissions:', e);
  }
}

// Page-Specific Initializations
function initParticles() {
  try {
    const container = document.getElementById('particles-js');
    if (!container) return;

    particlesJS('particles-js', {
      particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: { value: 0.5 },
        size: { value: 3, random: true },
        line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.4, width: 1 },
        move: { enable: true, speed: 2 }
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: { enable: true, mode: "grab" },
          onclick: { enable: true, mode: "push" }
        }
      }
    });
  } catch (e) {
    console.error('Error initializing particles:', e);
  }
}

function initLoginPage() {
  try {
    console.log('Login page initialized');
  } catch (e) {
    console.error('Error initializing login page:', e);
  }
}

function initDashboard() {
  try {
    console.log('Dashboard initialized');
  } catch (e) {
    console.error('Error initializing dashboard:', e);
  }
}

function initDataTables() {
  try {
    const tables = document.querySelectorAll('.data-table');
    if (!tables.length) return;

    tables.forEach(table => {
      const headers = table.querySelectorAll('th');
      if (!headers.length) return;

      headers.forEach((header, index) => {
        header.addEventListener('click', () => {
          try {
            sortTable(table, index);
          } catch (e) {
            console.error('Error sorting table:', e);
            showToast('Error sorting table', 'error');
          }
        });
      });
    });
  } catch (e) {
    console.error('Error initializing data tables:', e);
  }
}

function sortTable(table, columnIndex) {
  try {
    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));
    if (!rows.length) return;

    rows.sort((a, b) => {
      const aCell = a.cells[columnIndex];
      const bCell = b.cells[columnIndex];
      
      if (!aCell || !bCell) return 0;
      
      const aValue = aCell.textContent.trim();
      const bValue = bCell.textContent.trim();
      
      // Check if values are numeric
      if (!isNaN(aValue)) {
        return Number(aValue) - Number(bValue);
      }
      return aValue.localeCompare(bValue);
    });
    
    // Reverse if already sorted
    if (table.dataset.sortedColumn === String(columnIndex)) {
      rows.reverse();
      table.dataset.sortedColumn = '';
    } else {
      table.dataset.sortedColumn = String(columnIndex);
    }
    
    // Rebuild table
    rows.forEach(row => tbody.appendChild(row));
    showToast('Table sorted!');
  } catch (e) {
    console.error('Error sorting table:', e);
    throw e;
  }
}

function initFormValidations() {
  try {
    const inputs = document.querySelectorAll('form input');
    if (!inputs.length) return;

    inputs.forEach(input => {
      input.addEventListener('blur', function() {
        try {
          if (!this.checkValidity()) {
            this.classList.add('invalid');
            showToast(`Please enter a valid ${this.placeholder || 'value'}`, 'error');
          } else {
            this.classList.remove('invalid');
          }
        } catch (e) {
          console.error('Validation error:', e);
        }
      });
    });
  } catch (e) {
    console.error('Error initializing form validations:', e);
  }
}