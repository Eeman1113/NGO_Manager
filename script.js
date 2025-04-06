// Main script.js file for NGO Management System

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded, initializing app...');
    
    // Initialize UI on page load
    initializeUI();
    
    // After UI is initialized, setup all section-specific handlers
    setupAllSections();
});

// Set up all section handlers
function setupAllSections() {
    console.log('Setting up all section handlers');
    
    // Set up profile section
    setupProfileSection();
    
    // Set up tasks section
    setupTasksSection();
    
    // Set up events section
    setupEventTabs();
    
    // Set up ideas section
    setupIdeasSection();
    
    // Use direct modal handlers for critical buttons - FIXING CORRECT MODAL IDs
    createDirectModalHandler('editProfileBtn', 'editProfileModal');
    createDirectModalHandler('createEventBtn', 'createEventModal');
    createDirectModalHandler('submitIdeaBtn', 'submitIdeaModal');
    createDirectModalHandler('createTaskBtn', 'createTaskModal'); // This was wrong before!
    
    // Set up direct handlers for save buttons
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
        console.log('Setting up saveProfileBtn');
        const newSaveProfileBtn = saveProfileBtn.cloneNode(true);
        saveProfileBtn.parentNode.replaceChild(newSaveProfileBtn, saveProfileBtn);
        newSaveProfileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Save Profile button clicked directly');
            saveProfile();
        });
    } else {
        console.error('saveProfileBtn not found in DOM');
    }
    
    const saveEventBtn = document.getElementById('saveEventBtn');
    if (saveEventBtn) {
        console.log('Setting up saveEventBtn');
        const newSaveEventBtn = saveEventBtn.cloneNode(true);
        saveEventBtn.parentNode.replaceChild(newSaveEventBtn, saveEventBtn);
        newSaveEventBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Save Event button clicked directly');
            saveNewEvent();
        });
    } else {
        console.error('saveEventBtn not found in DOM');
    }
    
    const saveTaskBtn = document.getElementById('saveTaskBtn');
    if (saveTaskBtn) {
        console.log('Setting up saveTaskBtn');
        const newSaveTaskBtn = saveTaskBtn.cloneNode(true);
        saveTaskBtn.parentNode.replaceChild(newSaveTaskBtn, saveTaskBtn);
        newSaveTaskBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Save Task button clicked directly');
            saveNewTask();
        });
    } else {
        console.error('saveTaskBtn not found in DOM');
    }
    
    const saveIdeaBtn = document.getElementById('saveIdeaBtn');
    if (saveIdeaBtn) {
        console.log('Setting up saveIdeaBtn');
        const newSaveIdeaBtn = saveIdeaBtn.cloneNode(true);
        saveIdeaBtn.parentNode.replaceChild(newSaveIdeaBtn, saveIdeaBtn);
        newSaveIdeaBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Save Idea button clicked directly');
            saveNewIdea();
        });
    } else {
        console.error('saveIdeaBtn not found in DOM');
    }
    
    // Find and log all critical buttons to verify they exist
    console.log('Verifying critical buttons:');
    const criticalButtons = [
        'createTaskBtn', 'saveTaskBtn',
        'createEventBtn', 'saveEventBtn',
        'submitIdeaBtn', 'saveIdeaBtn',
        'editProfileBtn', 'saveProfileBtn'
    ];
    
    criticalButtons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        console.log(`Button ${btnId}: ${btn ? 'Found' : 'NOT FOUND'}`);
    });
}

// Initialize UI on page load
function initializeUI() {
    console.log('Initializing UI...');
    
    // Add any necessary modal overlay styles
    addModalOverlayStyles();
    
    // Ensure all modals have proper styles
    ensureModalStyles();
    
    // Initialize navigation
    initializeSidebarNav();
    setupNavigationListeners();
    
    // Setup modals and custom handlers
    setupCustomModals();
    
    // Setup necessary handlers for the login/dashboard toggle
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    
    // Check for existing login and show appropriate section
    if (localStorage.getItem('token')) {
        console.log('Found existing token, showing dashboard');
        fetchUserDataAndShowDashboard();
    } else {
        console.log('No token found, showing login section');
        showLoginSection();
    }
}

// Helper function to check if an element is visible
function isVisible(element) {
    return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
}

// Add styles for modal overlays if not already defined in CSS
function addModalOverlayStyles() {
    // Check if styles are already added
    if (document.getElementById('modal-overlay-styles')) return;
    
    // Create style element
    const style = document.createElement('style');
    style.id = 'modal-overlay-styles';
    style.textContent = `
        .modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 9999;
            justify-content: center;
            align-items: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .modal-overlay.visible {
            opacity: 1;
        }
        
        .modal-container {
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
            padding: 0;
            transform: translateY(-20px);
            transition: transform 0.3s ease;
        }
        
        .modal-overlay.visible .modal-container {
            transform: translateY(0);
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            border-bottom: 1px solid #e0e0e0;
            background-color: #f8f9fa;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
        }
        
        .modal-title {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            color: #888;
            padding: 0;
            margin: 0;
        }
        
        .modal-close:hover {
            color: #333;
        }
        
        .modal-body {
            padding: 20px;
            max-height: calc(90vh - 130px);
            overflow-y: auto;
        }
        
        .modal-footer {
            padding: 15px 20px;
            border-top: 1px solid #e0e0e0;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
    `;
    
    // Add to head
    document.head.appendChild(style);
    console.log('Added modal overlay styles');
}

// Setup navigation
function setupNavigation() {
    // Add event listeners for navigation
    document.querySelectorAll('.nav-link').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get target section
            const targetSection = this.getAttribute('data-section');
            if (!targetSection) return;
            
            // Show the target section
            showSection(targetSection);
            
            // Update active nav link
            document.querySelectorAll('.nav-link').forEach(navLink => {
                navLink.classList.remove('active');
            });
            this.classList.add('active');

  // Load section-specific data
            if (targetSection === 'dashboardSection') {
                // Dashboard data will be loaded in a future update
            } else if (targetSection === 'tasksSection') {
                loadTasksData();
            } else if (targetSection === 'eventsSection') {
                loadEventsData();
            } else if (targetSection === 'ideationSection') {
                loadIdeationData();
            } else if (targetSection === 'profileSection') {
                loadProfileData();
            }
        });
    });
}

// Show a specific section
function showSection(sectionId) {
    console.log(`Showing section: ${sectionId}`);
    
    // Hide all sections first
    hideAllSections();
    
    // Show the selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Update active state in sidebar
        const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
        sidebarLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            }
        });
        
        // Specific actions for each section
  if (sectionId === 'dashboardSection') {
    loadDashboardData();
  } else if (sectionId === 'profileSection') {
            setupProfileSection();
  } else if (sectionId === 'tasksSection') {
            setupTasksSection();
  } else if (sectionId === 'eventsSection') {
            setupEventTabs();
            
            // Load events data for the active tab or default to upcoming
            const activeTab = document.querySelector('#eventsSection .tab-link.active');
            const activeTabId = activeTab ? activeTab.getAttribute('data-tab') : 'upcomingEventsTab';
            loadEventsData(activeTabId);
        } else if (sectionId === 'ideasSection') {
            setupIdeasSection();
        }
    } else {
        console.error(`Section not found: ${sectionId}`);
    }
}

// Initialize sidebar navigation
function initializeSidebarNav() {
    const sidebarNav = document.getElementById('sidebarNav');
    if (!sidebarNav) {
        console.error('Sidebar navigation element not found');
        return;
    }
    
    console.log('Initializing sidebar navigation');
    
    // Clear existing navigation
    sidebarNav.innerHTML = '';
    
    // Define navigation items
    const navItems = [
        { id: 'dashboardSection', icon: 'fas fa-tachometer-alt', text: 'Dashboard' },
        { id: 'profileSection', icon: 'fas fa-user', text: 'My Profile' },
        { id: 'tasksSection', icon: 'fas fa-tasks', text: 'Tasks' },
        { id: 'eventsSection', icon: 'fas fa-calendar-alt', text: 'Events' },
        { id: 'ideationSection', icon: 'fas fa-lightbulb', text: 'Ideas' },
        { id: 'membersSection', icon: 'fas fa-users', text: 'Members', adminOnly: true },
        { id: 'settingsSection', icon: 'fas fa-cog', text: 'Settings' }
    ];
    
    // Create nav items
    navItems.forEach(item => {
        const listItem = document.createElement('li');
        listItem.className = 'nav-item' + (item.adminOnly ? ' admin-only' : '');
        
        const link = document.createElement('a');
        link.href = '#';
        link.className = 'nav-link';
        link.setAttribute('data-section', item.id);
        link.innerHTML = `<i class="${item.icon}"></i> <span>${item.text}</span>`;
        
        listItem.appendChild(link);
        sidebarNav.appendChild(listItem);
    });
    
    // Add logout item
    const logoutItem = document.createElement('li');
    logoutItem.className = 'nav-item';
    
    const logoutLink = document.createElement('a');
    logoutLink.href = '#';
    logoutLink.id = 'logoutLink';
    logoutLink.className = 'nav-link';
    logoutLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> <span>Logout</span>';
    
    logoutItem.appendChild(logoutLink);
    sidebarNav.appendChild(logoutItem);
    
    // Make sidebar visible
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.style.display = 'block';
    }
    
    // Add event listeners for navigation
    setupNavigationListeners();
    
    console.log('Sidebar navigation initialized with', navItems.length, 'items');
}

// Helper function to show/hide sidebar
function toggleSidebar(show) {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        if (show) {
            sidebar.style.display = 'block';
            sidebar.style.visibility = 'visible';
            document.querySelector('.main-content').style.marginLeft = '250px';
        } else {
            sidebar.style.display = 'none';
            document.querySelector('.main-content').style.marginLeft = '0';
        }
    }
}

// Function to fetch user data and show dashboard
function fetchUserDataAndShowDashboard() {
    fetch('http://localhost:3000/api/users/me', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(res => {
        if (!res.ok) {
            throw new Error('Authentication failed');
        }
        return res.json();
    })
    .then(userData => {
        console.log('User data loaded:', userData);
        
        // Show sidebar when logged in - using CSS display block
        document.getElementById('sidebar').style.display = 'block';
        document.querySelector('.main-content').style.marginLeft = '250px';
        
        // Show dashboard instead of login
        hideAllSections();
        document.getElementById('dashboardSection').classList.add('active');
        
        // Update sidebar with user info
        updateSidebarWithUserInfo(userData);
        
        // Setup navigation event listeners
        setupNavigationListeners();
        
        // Load data for dashboard
        loadDashboardData();
        
        // Also load profile data so it's ready when user navigates there
        loadProfileData();
    })
    .catch(err => {
        console.error('Error fetching user data:', err);
        // If error, clear token and show login
        localStorage.removeItem('token');
        
        // Hide sidebar when showing login
        document.getElementById('sidebar').style.display = 'none';
        document.querySelector('.main-content').style.marginLeft = '0';
        
        // Show login section
        hideAllSections();
        document.getElementById('loginSection').classList.add('active');
    });
}

// Setup navigation listeners
function setupNavigationListeners() {
    // Sidebar navigation
  document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
            const targetSection = this.getAttribute('data-section');
            if (targetSection) {
                showSection(targetSection);
                
                // Load appropriate data based on section
                if (targetSection === 'dashboardSection') {
                    loadDashboardData();
                } else if (targetSection === 'profileSection') {
                    loadProfileData();
                } else if (targetSection === 'tasksSection') {
                    loadTasksData();
                } else if (targetSection === 'eventsSection') {
                    // When showing events section, load the currently active tab's data
                    const activeTab = document.querySelector('#eventsSection .tab-link.active');
                    const tabId = activeTab ? activeTab.getAttribute('data-tab') : 'upcomingEventsTab';
                    console.log('Loading events for active tab:', tabId);
                    loadEventsData(tabId);
                } else if (targetSection === 'ideationSection') {
                    loadIdeationData();
                }
            }
        });
    });
    
    // Logout handler
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('token');
            hideAllSections();
            document.getElementById('loginSection').classList.add('active');
        });
    }
}

// Initialize UI components
function initializeUI() {
    console.log('Initializing UI components...');
    
    setupCustomModals();
    initializeSidebarNav();
    setupNavigationListeners();
    
    console.log('UI initialization complete');
}

// Setup modal handlers - kept for backward compatibility but most functionality moved to setupCustomModals
function setupModalHandlers() {
    console.log('Setting up modal handlers - this is kept for backward compatibility');
    
    // Setup custom modal overlay handling is now done in initializeUI
    // setupCustomModals(); - removed to prevent duplicate event handlers
    
    // Create Task Modal - using Bootstrap modals
    const createTaskBtn = document.getElementById('createTaskBtn');
    if (createTaskBtn) {
        console.log('Create task button found in setupModalHandlers');
        // Event listener is set in DOMContentLoaded
    }
    
    // Save Task Button
    const saveTaskBtn = document.getElementById('saveTaskBtn');
    if (saveTaskBtn) {
        console.log('Save task button found in setupModalHandlers');
        // Event listener is set in DOMContentLoaded
    }
    
    // Create Event and Save Event buttons are now handled by setupCustomModals
}

// Set up event tab navigation
function setupEventTabs() {
    console.log('Setting up event tabs');
    
    // Check if event tabs are already initialized
    if (window.eventTabsInitialized) {
        console.log('Event tabs already initialized, skipping setup');
        return;
    }
    
    const tabLinks = document.querySelectorAll('#eventsSection .tab-link');
    
    if (tabLinks.length === 0) {
        console.warn('No event tab links found');
        return;
    }
    
    console.log(`Found ${tabLinks.length} event tab links`);
    
    tabLinks.forEach(tabLink => {
        tabLink.addEventListener('click', function() {
            // Get the target tab ID
            const tabId = this.getAttribute('data-tab');
            console.log('Tab clicked:', tabId);
            
            // Update active class for tab links
            tabLinks.forEach(link => link.classList.remove('active'));
            this.classList.add('active');
            
            // Update active class for tab content
            const tabContents = document.querySelectorAll('#eventsSection .tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            
            const activeTabContent = document.getElementById(tabId);
            if (activeTabContent) {
                activeTabContent.classList.add('active');
                
                // Load events for the selected tab
                loadEventsData(tabId);
            }
        });
    });
    
    // Mark tabs as initialized to prevent duplicate listeners
    window.eventTabsInitialized = true;
    
    console.log('Event tabs initialized');
}

// Setup custom modal handling for modal-overlay style modals
function setupCustomModals() {
    console.log('Setting up custom modals...');
    
    // Check if modals are already initialized
    if (window.customModalsInitialized) {
        console.log('Custom modals already initialized, skipping setup');
        return;
    }
    
    // All modal overlays and close buttons
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    console.log(`Found ${modalOverlays.length} modal overlays`);
    
    const closeButtons = document.querySelectorAll('.modal-close, .cancel-btn');
    console.log(`Found ${closeButtons.length} close buttons`);
    
    // Close modal when clicking outside of modal content
    modalOverlays.forEach(overlay => {
        console.log(`Setting up click handler for modal: ${overlay.id}`);
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                console.log(`Closing modal by clicking outside: ${overlay.id}`);
                hideCustomModal(overlay.id);
            }
        });
    });
    
    // Close modal when clicking close button
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = button.closest('.modal-overlay');
            if (modal) {
                console.log(`Closing modal by close button: ${modal.id}`);
                hideCustomModal(modal.id);
            }
        });
    });
    
    // Don't set up the createEventBtn here, it's already handled by createDirectModalHandler
    console.log('Create Event button will be handled by createDirectModalHandler');
    
    // Setup save event button
    const saveEventBtn = document.getElementById('saveEventBtn');
    if (saveEventBtn) {
        console.log('Save Event button found');
        // Remove any existing handlers to prevent duplication
        const newSaveEventBtn = saveEventBtn.cloneNode(true);
        saveEventBtn.parentNode.replaceChild(newSaveEventBtn, saveEventBtn);
        
        newSaveEventBtn.addEventListener('click', function(e) {
            console.log('Save Event button clicked');
  e.preventDefault();
            // Prevent multiple clicks by immediately disabling
            this.disabled = true;
            saveNewEvent();
        });
    } else {
        console.error('Save Event button not found');
    }

    // Mark as initialized
    window.customModalsInitialized = true;
    console.log('Custom modals setup complete');
}

// Show custom modal
function showCustomModal(modalId) {
    console.log(`Showing custom modal: ${modalId}`);
    
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`Modal not found: ${modalId}`);
        return;
    }
    
    // Make sure modal is visible and ready
    modal.style.display = 'flex';
    
    // Make sure the overlay is visible
    setTimeout(() => {
        modal.classList.add('visible');
        
        // Add close handler to the backdrop - clicking outside should close the modal
        const modalContainer = modal.querySelector('.modal-container');
        if (modalContainer) {
            const closeOnBackdrop = function(e) {
                if (e.target === modal) {
                    hideCustomModal(modalId);
                    modal.removeEventListener('click', closeOnBackdrop);
                }
            };
            modal.addEventListener('click', closeOnBackdrop);
        }
        
        // Add close handler to close buttons
        const closeButtons = modal.querySelectorAll('.modal-close, .cancel-btn');
        closeButtons.forEach(button => {
            const closeHandler = function() {
                hideCustomModal(modalId);
                button.removeEventListener('click', closeHandler);
            };
            button.addEventListener('click', closeHandler);
        });
        
        // Add escape key handler
        const escHandler = function(e) {
            if (e.key === 'Escape') {
                hideCustomModal(modalId);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
        
        console.log(`Modal ${modalId} is now visible`);
    }, 10);
}

// Hide custom modal
function hideCustomModal(modalId) {
    console.log(`Hiding custom modal: ${modalId}`);
    
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`Modal not found: ${modalId}`);
        return;
    }
    
    // First remove the visible class to start the transition
    modal.classList.remove('visible');
    
    // Then hide after transition is complete
    setTimeout(() => {
        modal.style.display = 'none';
        
        // Remove any modal backdrops that might be stuck (for Bootstrap modals)
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
        
        // Remove modal-open class from body
        document.body.classList.remove('modal-open');
        
        console.log(`Modal ${modalId} is now hidden`);
    }, 300); // Matches the CSS transition time
}

// Load dashboard data
function loadDashboardData() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    console.log('Loading dashboard data...');
    
    fetch('/api/dashboard', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        // Update dashboard UI with data
        updateDashboardUI(data);
    })
    .catch(err => {
        console.error('Error loading dashboard data:', err);
        showNotification('Error loading dashboard data', 'error');
    });
}

// Setup profile section
function setupProfileSection() {
    console.log('Setting up profile section');
    
    // Check if already initialized to prevent duplicate handlers
    if (window.profileSectionInitialized) {
        console.log('Profile section already initialized, skipping setup');
        return;
    }
    
    // Remove the separate event handler setup since it's handled by createDirectModalHandler
    console.log('Edit profile button will be handled by createDirectModalHandler');
    
    // Load profile data
    loadProfileData();
    
    // Mark as initialized
    window.profileSectionInitialized = true;
}

// Open edit profile modal and populate with current user data
function openEditProfileModal() {
    console.log('Opening edit profile modal');
    
    // First ensure the modal is properly initialized
    ensureModalStyles();
    
    // Get current user data from local storage
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
        console.error('No user data found in local storage');
        // Fetch user data if not found in local storage
        fetchUserDataAndPopulateModal();
        return;
    }
    
    console.log('Populating profile form with user data:', userData);
    
    // Show the modal first so fields are accessible in the DOM
    showCustomModal('editProfileModal');
    
    // Populate form fields after a short delay to ensure modal is visible
    setTimeout(() => {
        populateProfileFormWithData(userData);
    }, 100);
}

// Helper function to fetch user data and populate modal
function fetchUserDataAndPopulateModal() {
    const token = localStorage.getItem('token');
    if (!token) {
        showToast('Please log in to edit your profile', 'error');
        return;
    }
    
    // Show loading state in form
    const formFields = ['profileName', 'profileEmail', 'profilePhone', 'profileDob'];
    formFields.forEach(id => {
        const field = document.getElementById(id);
        if (field) {
            field.value = 'Loading...';
            field.disabled = true;
        }
    });
    
    // Show the modal while data is loading
    showCustomModal('editProfileModal');
    
    fetch('/api/users/me', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to fetch user data');
        return response.json();
    })
    .then(userData => {
        // Save user data to local storage
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Populate form with fetched data
        populateProfileFormWithData(userData);
        
        // Re-enable form fields except email
        formFields.forEach(id => {
            if (id !== 'profileEmail') {
                const field = document.getElementById(id);
                if (field) field.disabled = false;
            }
        });
    })
    .catch(error => {
        console.error('Error fetching user data:', error);
        showToast('Error loading profile data', 'error');
        
        // Reset and enable form fields except email
        formFields.forEach(id => {
            if (id !== 'profileEmail') {
                const field = document.getElementById(id);
                if (field) {
                    field.value = '';
                    field.disabled = false;
                }
            }
        });
    });
}

// Helper function to populate profile form with user data
function populateProfileFormWithData(userData) {
    if (!userData) return;
    
    // Find all form elements
    let nameField = document.getElementById('profileName') || document.getElementById('editFullName');
    let emailField = document.getElementById('profileEmail') || document.getElementById('editEmail');
    let phoneField = document.getElementById('profilePhone') || document.getElementById('editPhone');
    let dobField = document.getElementById('profileDob') || document.getElementById('editDob');
    
    // Validate that the form elements exist in the DOM
    if (!nameField || !emailField) {
        console.error('Critical form fields are missing in the DOM');
        
        // Log the current state of the modal and form
        const modal = document.getElementById('editProfileModal');
        console.log('Modal exists:', !!modal);
        
        const form = document.getElementById('editProfileForm');
        console.log('Form exists:', !!form);
        
        // Try to recreate the fields if they don't exist
        if (form) {
            if (!nameField) {
                nameField = document.createElement('input');
                nameField.id = 'profileName';
                nameField.className = 'form-control';
                const nameGroup = document.createElement('div');
                nameGroup.className = 'mb-3';
                nameGroup.innerHTML = '<label for="profileName" class="form-label">Full Name</label>';
                nameGroup.appendChild(nameField);
                form.insertBefore(nameGroup, form.firstChild);
            }
            
            if (!emailField) {
                emailField = document.createElement('input');
                emailField.id = 'profileEmail';
                emailField.className = 'form-control';
                emailField.readOnly = true;
                const emailGroup = document.createElement('div');
                emailGroup.className = 'mb-3';
                emailGroup.innerHTML = '<label for="profileEmail" class="form-label">Email (Cannot be changed)</label>';
                emailGroup.appendChild(emailField);
                form.insertBefore(emailGroup, form.children[1] || form.firstChild);
            }
        }
    }
    
    // Now that we've ensured the fields exist, populate them
    if (nameField) nameField.value = userData.name || '';
    if (emailField) {
        emailField.value = userData.email || '';
        emailField.readOnly = true; // Always make email read-only
    }
    if (phoneField) phoneField.value = userData.phone || '';
    
    // Format the date correctly for the input
    if (userData.date_of_birth && dobField) {
        try {
            let dob = new Date(userData.date_of_birth);
            // Adjust for timezone (the date might be offset by timezone)
            dob.setMinutes(dob.getMinutes() + dob.getTimezoneOffset());
            // Format as YYYY-MM-DD for the date input
            const formattedDob = dob.toISOString().split('T')[0];
            dobField.value = formattedDob;
        } catch (e) {
            console.error('Error formatting date of birth:', e);
            dobField.value = userData.date_of_birth || '';
        }
    } else if (dobField) {
        dobField.value = '';
    }
    
    // Reset checkboxes - try all possible naming patterns
    document.querySelectorAll('input[name="profileDomains"], [id^="editDomain"], [id^="domain"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Check appropriate domain boxes
    if (userData.domains && Array.isArray(userData.domains) && userData.domains.length > 0) {
        userData.domains.forEach(domain => {
            // Try multiple formats of checkboxes
            try {
                const checkbox1 = document.querySelector(`input[name="profileDomains"][value="${domain}"]`);
                const checkbox2 = document.querySelector(`#editDomain${domain.charAt(0).toUpperCase() + domain.slice(1)}`);
                const checkbox3 = document.querySelector(`#domain${domain.charAt(0).toUpperCase() + domain.slice(1)}`);
                
                if (checkbox1) checkbox1.checked = true;
                if (checkbox2) checkbox2.checked = true;
                if (checkbox3) checkbox3.checked = true;
                
                // If no checkbox was found for this domain, log it
                if (!checkbox1 && !checkbox2 && !checkbox3) {
                    console.warn(`No checkbox found for domain: ${domain}`);
                }
            } catch (e) {
                console.error('Error setting domain checkbox:', e);
            }
        });
    } else {
        console.warn('No domains found in user data or domains is not an array:', userData.domains);
    }
    
    // Clear file input - try both IDs
    const fileInput = document.getElementById('profileImage') || document.getElementById('editProfileImage');
    if (fileInput) {
        fileInput.value = '';
    }
    
    // Display current profile image if available - try both IDs
    const profileImagePreview = document.getElementById('profileImagePreview') || document.getElementById('editProfileImagePreview');
    if (profileImagePreview && userData.profile_image) {
        // Show the preview container
        profileImagePreview.innerHTML = `<img src="${userData.profile_image}" class="img-thumbnail" alt="Profile Image">`;
        profileImagePreview.style.display = 'block';
    } else if (profileImagePreview) {
        profileImagePreview.innerHTML = '';
        profileImagePreview.style.display = 'none';
    }
    
    // Set up file input change handler to show image preview
    if (fileInput && profileImagePreview) {
        fileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    profileImagePreview.innerHTML = `<img src="${e.target.result}" class="img-thumbnail" alt="Profile Image Preview">`;
                    profileImagePreview.style.display = 'block';
                }
                reader.readAsDataURL(file);
            } else {
                // If no file selected and we had a previous profile image, show that again
                if (userData.profile_image) {
                    profileImagePreview.innerHTML = `<img src="${userData.profile_image}" class="img-thumbnail" alt="Profile Image">`;
                } else {
                    profileImagePreview.innerHTML = '';
                    profileImagePreview.style.display = 'none';
                }
            }
        });
    }
    
    // Set up save button handler
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
        console.log('Attaching handler to save profile button');
        // Clone to remove any existing listeners
        const newSaveProfileBtn = saveProfileBtn.cloneNode(true);
        saveProfileBtn.parentNode.replaceChild(newSaveProfileBtn, saveProfileBtn);
        
        // Add event listener
        newSaveProfileBtn.addEventListener('click', function(e) {
            console.log('Save profile button clicked');
            if (e) e.preventDefault();
            saveProfile();
        });
    } else {
        console.error('Save profile button not found');
    }
}

// Function to handle profile update
function saveProfile() {
    console.log('Saving profile...');
    
    // Prevent double submission
    if (window.isSubmittingProfile) {
        console.log('Already submitting profile changes, preventing duplicate submission');
        return;
    }
    
    window.isSubmittingProfile = true;
    
    // Get form values - try both ID formats to ensure compatibility
    const name = (document.getElementById('profileName') || document.getElementById('editFullName'))?.value.trim() || '';
    const email = (document.getElementById('profileEmail') || document.getElementById('editEmail'))?.value.trim() || '';
    const phone = (document.getElementById('profilePhone') || document.getElementById('editPhone'))?.value.trim() || '';
    const dob = (document.getElementById('profileDob') || document.getElementById('editDob'))?.value || '';
    
    // Get selected domains from both possible formats
    const domains = [];
    document.querySelectorAll('input[name="profileDomains"]:checked, [id^="editDomain"]:checked, [id^="domain"]:checked').forEach(function(checkbox) {
        // Extract domain value either from value attribute or from ID
        let value = checkbox.value;
        if (!value || value === 'on') {
            // Extract from ID like editDomainTechnology -> technology
            const match = checkbox.id.match(/editDomain([A-Z][a-z]+)/) || checkbox.id.match(/domain([A-Z][a-z]+)/);
            if (match) {
                value = match[1].toLowerCase();
            }
        }
        if (value && value !== 'on' && !domains.includes(value)) {
            domains.push(value);
        }
    });
    
    console.log('Profile data to save:', { name, phone, dob, domains });
    
    // Basic validation
    if (!name) {
        showToast('Please fill in your name', 'error');
        window.isSubmittingProfile = false;
        return;
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone || '');
    formData.append('dob', dob || '');
    formData.append('domains', JSON.stringify(domains));
    
    // Get profile image if provided - try both IDs
    const profileImage = (document.getElementById('profileImage') || document.getElementById('editProfileImage'))?.files[0];
    if (profileImage) {
        formData.append('profileImage', profileImage);
    }
    
    // Show loading state
    const saveBtn = document.getElementById('saveProfileBtn');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
    }
    
    // Send request to the correct endpoint
    fetch('/api/profile', {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || `HTTP error! Status: ${response.status}`);
            }).catch(err => {
                throw new Error(`HTTP error! Status: ${response.status}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Profile updated successfully:', data);
        
        // Update local storage with new user data
        if (data.user) {
            localStorage.setItem('userData', JSON.stringify(data.user));
        }
        
        // Show success message
        showToast('Profile updated successfully!', 'success');
        
        // Close modal using various methods to ensure it works
        try {
            // Try to close modal using our own function first
            hideCustomModal('editProfileModal');
            
            // Also try using jQuery if available
            if (typeof $ !== 'undefined') {
                $('#editProfileModal').modal('hide');
            }
            
            // Also try using Bootstrap API directly if available
            const modalElement = document.getElementById('editProfileModal');
            if (modalElement && typeof bootstrap !== 'undefined') {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) {
                    modal.hide();
                }
            }
        } catch (error) {
            console.error('Error closing modal:', error);
            // If all else fails, hide the modal directly
            const modalElement = document.getElementById('editProfileModal');
            if (modalElement) {
                modalElement.style.display = 'none';
            }
            
            // Remove any modal backdrops that might be stuck
            const backdrops = document.querySelectorAll('.modal-backdrop');
            backdrops.forEach(backdrop => backdrop.remove());
            document.body.classList.remove('modal-open');
        }
        
        // Reload profile data
        loadProfileData();
    })
    .catch(error => {
        console.error('Error updating profile:', error);
        showToast('Failed to update profile: ' + error.message, 'error');
    })
    .finally(() => {
        // Reset button state
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Changes';
        }
        
        // Reset submission flag
        window.isSubmittingProfile = false;
    });
}

// Load profile data from API
function loadProfileData() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No authentication token found');
        showNotification('Please log in to view your profile', 'warning');
      return;
    }

    console.log('Loading profile data from API...');
    
    // Show loading state for all profile elements
    setProfileLoadingState(true);
    
    fetch('/api/users/me', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to load profile data: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(userData => {
        console.log('Profile data loaded successfully:', userData);
        
        // Update the UI with the user data
        updateProfileUI(userData);
        
        // Also update any activity data if available
        if (userData.activity) {
            updateActivityData(userData.activity);
        } else {
            // Set default values for activity data
            safeUpdateElement('profileEventsCount', '0');
            safeUpdateElement('profileTasksCount', '0');
            safeUpdateElement('profileHoursCount', '0');
        }
        
        // Update certificates if available
        if (userData.certificates && userData.certificates.length > 0) {
            updateCertificates(userData.certificates);
        }
        
        // End loading state
        setProfileLoadingState(false);
    })
    .catch(error => {
        console.error('Error loading profile data:', error);
        showNotification('Error loading profile data', 'error');
        setProfileLoadingState(false);
    });
}

// Helper function to set loading state for profile elements
function setProfileLoadingState(isLoading) {
    const loadingText = isLoading ? 'Loading...' : '';
    const elements = [
        'profileName', 'profileRole', 'profileJoinDate', 
        'profileFullName', 'profileEmail', 'profilePhone', 'profileDob'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element && isLoading) {
            element.textContent = loadingText;
        }
    });
    
    // Also handle containers that might need clearing during loading
    if (isLoading) {
        const domainsContainer = document.getElementById('profileDomains');
        if (domainsContainer) domainsContainer.innerHTML = '<p>Loading domains...</p>';
        
        const certificatesTable = document.getElementById('certificatesTableBody');
        if (certificatesTable) certificatesTable.innerHTML = '<tr><td colspan="4" class="text-center">Loading certificates...</td></tr>';
    }
}

// Update activity data in profile
function updateActivityData(activity) {
    // Update activity stats
    if (activity.events_count !== undefined) {
        document.getElementById('profileEventsCount').textContent = activity.events_count;
        document.getElementById('profileLastEvent').textContent = activity.last_event 
            ? `Last event: ${formatDate(activity.last_event)}` 
            : 'No events yet';
    }
    
    if (activity.tasks_count !== undefined) {
        document.getElementById('profileTasksCount').textContent = activity.tasks_count;
        document.getElementById('profileCompletionRate').textContent = `Completion rate: ${activity.completion_rate || 0}%`;
    }
    
    if (activity.volunteer_hours !== undefined) {
        document.getElementById('profileHoursCount').textContent = activity.volunteer_hours;
    }
    
    // Update activity chart if available
    const activityChart = document.getElementById('activityChart');
    if (activityChart && window.Chart && activity.monthly_data) {
        createActivityChart(activityChart, activity.monthly_data);
    }
}

// Create activity chart for profile
function createActivityChart(canvas, monthlyData) {
    const ctx = canvas.getContext('2d');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthlyData.map(d => d.month),
            datasets: [
                {
                    label: 'Tasks',
                    data: monthlyData.map(d => d.tasks || 0),
                    borderColor: '#1cc88a',
                    backgroundColor: 'rgba(28, 200, 138, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Events',
                    data: monthlyData.map(d => d.events || 0),
                    borderColor: '#4e73df',
                    backgroundColor: 'rgba(78, 115, 223, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Update certificates table
function updateCertificates(certificates) {
    const tableBody = document.getElementById('certificatesTableBody');
    if (!tableBody) return;
    
    // Clear the table
    tableBody.innerHTML = '';
    
    // Add certificate rows
    certificates.forEach(cert => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cert.name}</td>
            <td>${cert.issued_for}</td>
            <td>${formatDate(cert.issue_date)}</td>
            <td>
                <button class="btn btn-sm btn-info download-cert" data-cert-id="${cert.id}">
                    <i class="fas fa-download"></i> Download
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Add click handlers for download buttons
    document.querySelectorAll('.download-cert').forEach(btn => {
        btn.addEventListener('click', function() {
            const certId = this.getAttribute('data-cert-id');
            // In a future implementation, this would download the certificate
            showNotification('Certificate download will be implemented in a future update', 'info');
        });
    });
}

// Setup task section functionality
function setupTasksSection() {
    const tasksSection = document.getElementById('tasksSection');
    if (!tasksSection) return;
    
    console.log('Setting up tasks section');
    
    // Setup tab navigation for tasks
    const taskTabs = tasksSection.querySelectorAll('.tab-link');
    const taskContents = tasksSection.querySelectorAll('.tab-content');
    
    taskTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Update active tab
            taskTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected tab content
            taskContents.forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(targetTab).classList.add('active');
            
            // Reload tasks with filter
            loadTasksData(targetTab);
        });
    });
    
    // The createTaskBtn event handler is now set up by createDirectModalHandler
    // in setupAllSections() to avoid conflicts
    console.log('Create task button is handled by createDirectModalHandler');
    
    // Setup save task button
    const saveTaskBtn = document.getElementById('saveTaskBtn');
    if (saveTaskBtn) {
        console.log('Found save task button');
        saveTaskBtn.addEventListener('click', function() {
            console.log('Save task button clicked');
            saveNewTask();
        });
    } else {
        console.error('Save task button not found');
    }
    
    // Initial load of all tasks
    loadTasksData();
}

// Format date for date input field (YYYY-MM-DD)
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Load tasks data with optional filter
function loadTasksData(tabId) {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    // Determine the filter based on the tab
    let url = 'http://localhost:3000/api/tasks';
    if (tabId === 'pendingTasksTab') {
        url += '?status=pending';
    } else if (tabId === 'completedTasksTab') {
        url += '?status=completed';
    } else if (tabId === 'myTasksTab') {
        url += '?assigned_to_me=true';
    }
    
    fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(tasks => {
        // Update tasks UI based on the selected tab
        displayTasks(tasks, tabId);
    })
    .catch(err => {
        console.error('Error loading tasks data:', err);
        showNotification('Error loading tasks data', 'error');
    });
}

// Display tasks in the tasks section based on the selected tab
function displayTasks(tasks, tabId) {
    // Determine which container to update
    let containerId = tabId || 'allTasksTab';
    const tasksContainer = document.querySelector(`#${containerId} .tasks-container`);
    if (!tasksContainer) return;
    
    tasksContainer.innerHTML = '';
    
    if (!tasks || tasks.length === 0) {
        tasksContainer.innerHTML = `<div class="alert alert-info">No ${tabId ? tabId.replace('TasksTab', '').toLowerCase() : ''} tasks found</div>`;
        return;
    }
    
    tasks.forEach(task => {
        const taskEl = document.createElement('div');
        taskEl.className = 'card task-card mb-3';
        
        // Show appropriate action button based on status
        let actionButton = '';
        if (task.status === 'pending') {
            actionButton = `<button class="btn btn-sm btn-success complete-task" data-task-id="${task.id}"><i class="fas fa-check"></i> Mark Complete</button>`;
        } else if (task.status === 'completed') {
            actionButton = `<button class="btn btn-sm btn-warning reopen-task" data-task-id="${task.id}"><i class="fas fa-redo"></i> Reopen</button>`;
        }
        
        taskEl.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="card-title">${task.title}</h5>
                    <span class="badge bg-${getPriorityClass(task.priority)}">${task.priority}</span>
                </div>
                <p class="card-text">${task.description}</p>
                <div class="task-details">
                    <div><strong>Domain:</strong> ${formatDomain(task.domain)}</div>
                    <div><strong>Status:</strong> <span class="badge bg-${getStatusClass(task.status)}">${formatStatus(task.status)}</span></div>
                    <div><strong>Due:</strong> ${formatDate(task.due_date)}</div>
                    <div><strong>Assigned to:</strong> ${task.assignee_name || 'Unassigned'}</div>
                </div>
                <div class="task-actions mt-3">
                    ${actionButton}
                    <button class="btn btn-sm btn-info view-task" data-task-id="${task.id}"><i class="fas fa-eye"></i> View Details</button>
                </div>
            </div>
        `;
        
        tasksContainer.appendChild(taskEl);
    });
    
    // Add event listeners for task actions
    document.querySelectorAll('.complete-task').forEach(button => {
        button.addEventListener('click', function() {
            const taskId = this.getAttribute('data-task-id');
            updateTaskStatus(taskId, 'completed');
        });
    });
    
    document.querySelectorAll('.reopen-task').forEach(button => {
        button.addEventListener('click', function() {
            const taskId = this.getAttribute('data-task-id');
            updateTaskStatus(taskId, 'pending');
        });
    });
    
    document.querySelectorAll('.view-task').forEach(button => {
        button.addEventListener('click', function() {
            const taskId = this.getAttribute('data-task-id');
            viewTaskDetails(taskId);
        });
    });
}

// Update task status
function updateTaskStatus(taskId, status) {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    fetch(`http://localhost:3000/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showNotification(`Task ${status === 'completed' ? 'completed' : 'reopened'} successfully`, 'success');
            
            // Reload tasks to reflect changes
            const activeTab = document.querySelector('#tasksSection .tab-link.active');
            if (activeTab) {
                loadTasksData(activeTab.getAttribute('data-tab'));
            } else {
                loadTasksData();
            }
        } else {
            showNotification(data.message || 'Error updating task status', 'error');
        }
    })
    .catch(err => {
        console.error('Error updating task status:', err);
        showNotification('Error updating task status', 'error');
    });
}

// View task details
function viewTaskDetails(taskId) {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    fetch(`http://localhost:3000/api/tasks/${taskId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(task => {
        if (task) {
            // For now, just show the details in a notification
            showNotification(`
                <h5>${task.title}</h5>
                <p>${task.description}</p>
                <p><strong>Assigned to:</strong> ${task.assignee_name || 'Unassigned'}</p>
                <p><strong>Due:</strong> ${formatDate(task.due_date)}</p>
            `, 'info', 10000);
        } else {
            showNotification('Task not found', 'error');
        }
    })
    .catch(err => {
        console.error('Error fetching task details:', err);
        showNotification('Error fetching task details', 'error');
    });
}

// Load events data based on the selected tab
function loadEventsData(tabId = 'upcomingEventsTab') {
    console.log(`Loading events data for tab: ${tabId}`);
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No authentication token available');
        return;
    }
    
    const tabContainer = document.getElementById(tabId);
    if (!tabContainer) {
        console.error(`Tab container not found: ${tabId}`);
        return;
    }
    
    // Show loading state
    tabContainer.innerHTML = '<div class="text-center p-5"><div class="spinner-border" role="status"></div><p class="mt-2">Loading events...</p></div>';
    
    // Determine endpoint based on tab
    let endpoint = '/api/events';
    if (tabId === 'myEventsTab') {
        endpoint = '/api/events/my';
    } else if (tabId === 'pastEventsTab') {
        endpoint = '/api/events/past';
    } else if (tabId === 'upcomingEventsTab') {
        endpoint = '/api/events/upcoming';
    }
    
    console.log(`Fetching events from: ${endpoint}`);
    
    fetch(endpoint, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log(`Received ${data.length} events from server`);
        
        // Check for duplicates
        const eventIds = {};
        const duplicates = [];
        
        data.forEach(event => {
            if (eventIds[event.id]) {
                duplicates.push(event.id);
                console.warn(`Duplicate event detected: ID ${event.id}, Title: ${event.title}`);
            } else {
                eventIds[event.id] = true;
            }
        });
        
        if (duplicates.length > 0) {
            console.error(`Found ${duplicates.length} duplicate event IDs in response:`, duplicates);
        }
        
        // Remove duplicates by using only the first occurrence of each ID
        const uniqueEvents = [];
        const seenIds = new Set();
        
        data.forEach(event => {
            if (!seenIds.has(event.id)) {
                seenIds.add(event.id);
                uniqueEvents.push(event);
            }
        });
        
        console.log(`After deduplication: ${uniqueEvents.length} unique events`);
        
        // Sort events by date (newest first)
        uniqueEvents.sort((a, b) => {
            const dateA = new Date(`${a.event_date}T${a.event_time}`);
            const dateB = new Date(`${b.event_date}T${b.event_time}`);
            return dateA - dateB; // Ascending order (oldest first)
        });
        
        // Display events in the tab
        displayEventsInTab(uniqueEvents, tabId);
    })
    .catch(error => {
        console.error('Error fetching events:', error);
        tabContainer.innerHTML = `<div class="alert alert-danger">Failed to load events: ${error.message}</div>`;
    });
}

// Display events in the specified tab
function displayEventsInTab(events, tabId) {
    const tabContent = document.getElementById(tabId);
    if (!tabContent) {
        console.error(`Tab content not found for ID: ${tabId}`);
        return;
    }
    
    // Clear the tab content completely
    tabContent.innerHTML = '';
    
    // Check if we have any events
    if (!events || events.length === 0) {
        tabContent.innerHTML = '<div class="alert alert-info">No events found</div>';
        return;
    }
    
    // Create container for the events
    const eventsContainer = document.createElement('div');
    eventsContainer.className = 'events-container';
    
    // Add each event card
    events.forEach(event => {
        const eventCard = createEventCard(event);
        eventsContainer.appendChild(eventCard);
    });
    
    // Add the events container to the tab
    tabContent.appendChild(eventsContainer);
    
    // Add event listeners to buttons after rendering
    attachEventHandlers(tabContent);
}

// Attach event handlers to event cards
function attachEventHandlers(container) {
    // Register event buttons
    container.querySelectorAll('.register-event').forEach(button => {
        button.addEventListener('click', function() {
            const eventId = this.getAttribute('data-event-id');
            registerForEvent(eventId);
        });
    });
    
    // Details buttons
    container.querySelectorAll('.view-event-details').forEach(button => {
        button.addEventListener('click', function() {
            const eventId = this.getAttribute('data-event-id');
            viewEventDetails(eventId);
        });
    });
}

// Create an event card element
function createEventCard(event) {
    // Validate event data
    if (!event || !event.event_date) {
        console.error('Invalid event data:', event);
        return document.createElement('div'); // Return empty div to avoid errors
    }

    const eventDate = new Date(event.event_date);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const cardElement = document.createElement('div');
    cardElement.className = 'card mb-3';
    cardElement.dataset.eventId = event.id; // Add data attribute for easier identification
    
    // Format domains as badges
    const domainBadges = event.domains && event.domains.length > 0 
        ? event.domains.map(domain => `<span class="badge badge-${getBadgeClass(domain)}">${formatDomain(domain)}</span>`).join('') 
        : '<span class="badge badge-secondary">General</span>';
    
    cardElement.innerHTML = `
        <div class="card-body">
          <div class="event-card-content">
            <div class="event-date">
                    <div class="month">${monthNames[eventDate.getMonth()]}</div>
                    <div class="day">${eventDate.getDate()}</div>
            </div>
            <div class="event-details">
              <h4 class="event-title">${event.title}</h4>
              <p class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
              <p class="event-description">${event.description}</p>
              <div class="domain-badges">
                        ${domainBadges}
              </div>
            </div>
          </div>
        </div>
        <div class="card-footer d-flex justify-content-between">
            <div><strong>Volunteers:</strong> ${event.participants_count || 0}/${event.capacity || 0}</div>
            <div>
                <button class="btn btn-info btn-sm view-event-details" data-event-id="${event.id}">
                    <i class="fas fa-eye"></i> Details
                </button>
                ${event.is_registered 
                    ? `<button class="btn btn-success btn-sm" disabled><i class="fas fa-check"></i> Registered</button>` 
                    : `<button class="btn btn-primary btn-sm register-event" data-event-id="${event.id}">
                        <i class="fas fa-user-plus"></i> Sign Up
                       </button>`
                }
            </div>
        </div>
      `;
    
    return cardElement;
}

// Get badge class based on domain
function getBadgeClass(domain) {
    const domainClasses = {
        'marketing': 'primary',
        'social_media': 'secondary',
        'on_ground': 'success',
        'technical': 'info',
        'event_planning': 'warning',
        'education': 'danger',
        'fundraising': 'primary',
        'community_service': 'success',
        'environment': 'info'
    };
    
    return domainClasses[domain] || 'secondary';
}

// View event details
function viewEventDetails(eventId) {
    console.log('Viewing details for event:', eventId);
    // This would typically open a modal with detailed event info
    // For now, just show a notification
    showToast(`Viewing details for event #${eventId}`, 'info');
}

// Load ideation data
function loadIdeationData() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    console.log('Loading ideation data...');
    
    fetch('/api/ideas', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(ideas => {
        // Update ideas UI
        displayIdeas(ideas);
    })
    .catch(err => {
        console.error('Error loading ideas data:', err);
        showNotification('Error loading ideas data', 'error');
    });
}

// Save a new task
function saveNewTask() {
    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('Please log in to create a task', 'warning');
        return;
    }
    
    const taskForm = document.getElementById('taskForm');
    if (!taskForm) {
        console.error('Task form not found');
        showNotification('Error: Form not found', 'error');
        return;
    }
    
    const taskData = {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        domain: document.getElementById('taskDomain').value,
        priority: document.getElementById('taskPriority').value,
        start_date: document.getElementById('taskStartDate').value,
        due_date: document.getElementById('taskDueDate').value,
        assignee_id: document.getElementById('taskAssignee').value || 'auto'
    };
    
    console.log('Creating task with data:', taskData);
    
    // Validate required fields
    if (!taskData.title || !taskData.description || !taskData.domain || !taskData.priority || 
        !taskData.start_date || !taskData.due_date) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    fetch('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
    })
    .then(res => {
        if (!res.ok) {
            return res.json().then(data => {
                throw new Error(data.message || `Server error: ${res.status}`);
            });
        }
        return res.json();
    })
    .then(data => {
        if (data.id) {
            showNotification('Task created successfully', 'success');
            
            // Close modal
            try {
                const modalElement = document.getElementById('createTaskModal');
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) {
                    modal.hide();
                } else {
                    // If instance not found, try creating new one
                    const newModal = new bootstrap.Modal(modalElement);
                    newModal.hide();
                }
  } catch (err) {
                console.error('Error closing modal:', err);
                // Just hide manually if Bootstrap modal methods fail
                const modalElement = document.getElementById('createTaskModal');
                if (modalElement) {
                    modalElement.style.display = 'none';
                    document.body.classList.remove('modal-open');
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) backdrop.remove();
                }
            }
            
            // Reset form
            if (taskForm) taskForm.reset();
            
            // Reload tasks
            loadTasksData();
        } else {
            showNotification(data.message || 'Error creating task', 'error');
        }
    })
    .catch(err => {
        console.error('Error creating task:', err);
        showNotification('Error creating task: ' + (err.message || 'Server error'), 'error');
    });
}

// Save a new event from the form
function saveNewEvent() {
    console.log('Attempting to save new event');
    
    // Check if already submitting to prevent double submissions
    if (window.isSubmittingEvent) {
        console.log('Already submitting an event, preventing duplicate submission');
        return;
    }
    
    // Set submission flag
    window.isSubmittingEvent = true;
    
    // Get the save button and disable it
    const saveButton = document.getElementById('saveEventBtn');
    if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = 'Creating...';
    }
    
    // Get form values
    const title = document.getElementById('eventTitle').value.trim();
    const description = document.getElementById('eventDescription').value.trim();
    const location = document.getElementById('eventLocation').value.trim();
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const type = document.getElementById('eventType').value;
    const capacity = document.getElementById('eventCapacity').value;
    
    // Get selected domains
    const domainCheckboxes = document.querySelectorAll('input[name="eventDomain"]:checked');
    const domains = Array.from(domainCheckboxes).map(checkbox => checkbox.value);
    
    // Validate required fields
    if (!title || !description || !location || !date || !time || !type || !capacity) {
        showToast('Please fill in all required fields', 'error');
        console.error('Missing required fields for event creation');
        // Reset submission flag and button
        window.isSubmittingEvent = false;
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.textContent = 'Create Event';
        }
        return;
    }
    
    const eventData = {
        title,
        description,
        location,
        event_date: date,
        event_time: time,
        event_type: type,
        capacity,
        domains
    };
    
    console.log('Submitting event data:', eventData);
    
    fetch('/api/events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(eventData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Event created successfully:', data);
        
        // Close the modal
        hideCustomModal('createEventModal');
        
        // Show success message
        showToast('Event created successfully!', 'success');
        
        // Refresh events data
        const activeTab = document.querySelector('#eventsSection .tab-link.active');
        if (activeTab) {
            const tabId = activeTab.getAttribute('data-tab');
            loadEventsData(tabId);
        } else {
            loadEventsData('allEvents');
        }
    })
    .catch(error => {
        console.error('Error creating event:', error);
        showToast('Failed to create event. Please try again.', 'error');
    })
    .finally(() => {
        // Reset submission flag and button regardless of success/failure
        window.isSubmittingEvent = false;
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.textContent = 'Create Event';
        }
    });
}

// Save a new idea
function saveNewIdea() {
    // Prevent duplicate submissions
    if (window.isSubmittingIdea) {
        console.log('Already submitting an idea, preventing duplicate submission');
        return;
    }
    
    window.isSubmittingIdea = true;
    console.log('Saving new idea...');
    
    // Get form values
    const title = document.getElementById('ideaTitle').value.trim();
    const description = document.getElementById('ideaDescription').value.trim();
    
    // Get selected domains
    const selectedDomains = [];
    document.querySelectorAll('input[name="ideaDomains"]:checked').forEach(function(checkbox) {
        selectedDomains.push(checkbox.value);
    });
    
    // Validation
    if (!title || !description || selectedDomains.length === 0) {
        showToast('Please fill in all required fields and select at least one domain', 'error');
        window.isSubmittingIdea = false;
        return;
    }
    
    // Disable the save button to prevent multiple submissions
    const saveIdeaBtn = document.getElementById('saveIdeaBtn');
    if (saveIdeaBtn) {
        saveIdeaBtn.disabled = true;
        saveIdeaBtn.textContent = 'Submitting...';
    }
    
    // Create idea object
    const ideaData = {
        title,
        description,
        domains: selectedDomains
    };
    
    console.log('Idea data:', ideaData);
    
    // Send request
    fetch('/api/ideas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(ideaData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Idea created successfully:', data);
        
        // Reset form
        document.getElementById('submitIdeaForm').reset();
        
        // Close modal
        hideCustomModal('submitIdeaModal');
        
        // Show success message
        showToast('Idea submitted successfully!', 'success');
        
        // Reload ideas
        loadIdeationData();
    })
    .catch(error => {
        console.error('Error submitting idea:', error);
        showToast('Failed to submit idea: ' + error.message, 'error');
    })
    .finally(() => {
        // Re-enable the save button
        if (saveIdeaBtn) {
            saveIdeaBtn.disabled = false;
            saveIdeaBtn.textContent = 'Submit Idea';
        }
        
        // Reset submission flag
        window.isSubmittingIdea = false;
    });
}

// Display events in the events section
function displayEvents(events) {
    const eventsContainer = document.querySelector('#eventsSection .events-container');
    if (!eventsContainer) return;
    
    eventsContainer.innerHTML = '';
    
    if (!events || events.length === 0) {
        eventsContainer.innerHTML = '<div class="alert alert-info">No events found</div>';
        return;
    }
    
    events.forEach(event => {
        const eventEl = document.createElement('div');
        eventEl.className = 'card event-card mb-3';
        
        // Format domains as badges
        const domainBadges = event.domains ? event.domains.map(domain => 
            `<span class="badge bg-secondary me-1">${formatDomain(domain)}</span>`
        ).join('') : '';
        
        eventEl.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${event.title}</h5>
                <p class="card-text">${event.description}</p>
                <div class="event-details">
                    <div><strong>Date:</strong> ${formatDate(event.event_date)}</div>
                    <div><strong>Time:</strong> ${formatTime(event.event_time)}</div>
                    <div><strong>Location:</strong> ${event.location}</div>
                    <div><strong>Capacity:</strong> ${event.participants_count || 0}/${event.capacity}</div>
                    <div><strong>Type:</strong> ${event.event_type}</div>
                    <div><strong>Domains:</strong> ${domainBadges}</div>
                </div>
                <div class="event-actions mt-3">
                    <button class="btn btn-sm btn-primary register-event" data-event-id="${event.id}">Register</button>
                </div>
            </div>
        `;
        
        eventsContainer.appendChild(eventEl);
    });
    
    // Add event listeners for event actions
    document.querySelectorAll('.register-event').forEach(button => {
        button.addEventListener('click', function() {
            const eventId = this.getAttribute('data-event-id');
            registerForEvent(eventId);
        });
    });
}

// Display ideas in the ideation section
function displayIdeas(ideas) {
    const ideasContainer = document.querySelector('#ideationSection .ideas-container');
    if (!ideasContainer) return;
    
    ideasContainer.innerHTML = '';
    
    if (!ideas || ideas.length === 0) {
        ideasContainer.innerHTML = '<div class="alert alert-info">No ideas found</div>';
        return;
    }
    
    ideas.forEach(idea => {
        const ideaEl = document.createElement('div');
        ideaEl.className = 'card idea-card mb-3';
        ideaEl.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${idea.title}</h5>
                <h6 class="card-subtitle mb-2 text-muted">By ${idea.submitter_name}</h6>
                <p class="card-text">${idea.description}</p>
                <div class="idea-details">
                    <div><strong>Type:</strong> ${idea.type || 'General'}</div>
                    <div><strong>Status:</strong> <span class="badge bg-${getIdeaStatusClass(idea.status)}">${formatStatus(idea.status)}</span></div>
                    <div><strong>Upvotes:</strong> ${idea.upvotes || 0}</div>
                    <div><strong>Comments:</strong> ${idea.comments_count || 0}</div>
                </div>
                <div class="idea-actions mt-3">
                    <button class="btn btn-sm btn-primary upvote-idea" data-idea-id="${idea.id}">
                        <i class="fas fa-thumbs-up"></i> Upvote
                    </button>
                    <button class="btn btn-sm btn-outline-primary view-comments" data-idea-id="${idea.id}">
                        <i class="fas fa-comments"></i> View Comments
                    </button>
                </div>
            </div>
        `;
        
        ideasContainer.appendChild(ideaEl);
    });
    
    // Add event listeners for idea actions
    document.querySelectorAll('.upvote-idea').forEach(button => {
        button.addEventListener('click', function() {
            const ideaId = this.getAttribute('data-idea-id');
            upvoteIdea(ideaId);
        });
    });
}

// Register for an event
function registerForEvent(eventId) {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    fetch(`http://localhost:3000/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        showNotification(data.message || 'Registration successful', 'success');
        loadEventsData(); // Refresh events
    })
    .catch(err => {
        console.error('Error registering for event:', err);
        showNotification('Error registering for event', 'error');
    });
}

// Upvote an idea
function upvoteIdea(ideaId) {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    fetch(`http://localhost:3000/api/ideas/${ideaId}/upvote`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        showNotification(data.message || 'Idea upvoted', 'success');
        loadIdeationData(); // Refresh ideas
    })
    .catch(err => {
        console.error('Error upvoting idea:', err);
        showNotification('Error upvoting idea', 'error');
    });
}

// Update dashboard UI with data
function updateDashboardUI(data) {
    if (!data) return;
    
    // Update dashboard cards
    const totalVolunteersEl = document.getElementById('totalVolunteers');
    const activeVolunteersEl = document.getElementById('activeVolunteers');
    const upcomingEventsEl = document.getElementById('upcomingEvents');
    const pendingTasksEl = document.getElementById('pendingTasks');
    
    if (totalVolunteersEl) totalVolunteersEl.textContent = data.totalVolunteers || 0;
    if (activeVolunteersEl) activeVolunteersEl.textContent = data.activeVolunteers || 0;
    if (upcomingEventsEl) upcomingEventsEl.textContent = data.upcomingEvents || 0;
    if (pendingTasksEl) pendingTasksEl.textContent = data.pendingTasks || 0;
    
    // Update charts if Chart.js is available
    if (window.Chart && data.activityData) {
        // Update domains chart
        updateDomainsChart(data.activityData.domains);
        
        // Update events chart
        updateEventsChart(data.activityData.events);
    }
}

// Update profile UI with user data
function updateProfileUI(userData) {
    if (!userData) {
        console.error('No user data provided to updateProfileUI');
        return;
    }
    
    console.log('Updating profile UI with user data:', userData);
    
    // Check if profile section elements exist before updating
    const profileSection = document.getElementById('profileSection');
    if (!profileSection) {
        console.error('Profile section not found in DOM');
        return;
    }
    
    try {
        // Update profile header information
        const profileName = document.getElementById('profileName');
        if (profileName) profileName.textContent = userData.name || 'N/A';
        
        const profileRole = document.getElementById('profileRole');
        if (profileRole) {
            const role = formatRole(userData.role) || 'Volunteer';
            const domains = userData.domains && userData.domains.length > 0 
                ? userData.domains.map(d => formatDomain(d)).join(', ') 
                : '';
            profileRole.textContent = role + (domains ? ' | ' + domains : '');
        }
        
        // Joined date (using a placeholder since we might not have this data)
        const profileJoinDate = document.getElementById('profileJoinDate');
        if (profileJoinDate) {
            const joinedDate = userData.created_at 
                ? `Member since ${formatDate(userData.created_at)}` 
                : 'New member';
            profileJoinDate.textContent = joinedDate;
        }
        
        // Update personal information fields if they exist
        safeUpdateElement('profileFullName', userData.name || 'N/A');
        safeUpdateElement('profileEmail', userData.email || 'N/A');
        safeUpdateElement('profilePhone', userData.phone || 'N/A');
        safeUpdateElement('profileDob', userData.date_of_birth ? formatDate(userData.date_of_birth) : 'N/A');
        
        // Update verification status
        const verificationStatus = document.getElementById('profileVerification');
        if (verificationStatus) {
            const isVerified = userData.aadhaar_verified === true || userData.aadhaar_number;
            verificationStatus.innerHTML = `<span class="badge badge-${isVerified ? 'success' : 'warning'}">${isVerified ? 'Verified' : 'Pending'}</span>`;
        }
        
        // Update domains
        updateDomainBadges(userData.domains || []);
        
        // Update profile image if available
        const profileImgEl = document.getElementById('profileAvatar');
        if (profileImgEl) {
            if (userData.profile_image) {
                profileImgEl.src = userData.profile_image.startsWith('/') 
                    ? userData.profile_image 
                    : '/' + userData.profile_image;
            } else {
                // If no profile image, use initials
                profileImgEl.src = `https://placehold.co/100x100?text=${getInitials(userData.name)}`;
            }
        }
        
        console.log('Profile UI updated successfully');
    } catch (error) {
        console.error('Error updating profile UI:', error);
        showNotification('Error displaying profile data', 'error');
    }
}

// Safely update an element if it exists
function safeUpdateElement(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
        return true;
    }
    console.warn(`Element with id '${elementId}' not found`);
    return false;
}

// Update domain badges safely
function updateDomainBadges(domains) {
    const domainsContainer = document.getElementById('profileDomains');
    if (!domainsContainer) {
        console.warn('Domains container not found');
        return;
    }
    
    // Clear existing badges
    domainsContainer.innerHTML = '';
    
    if (!Array.isArray(domains)) {
        console.warn('Domains is not an array:', domains);
        domains = [];
    }
    
    // Add new badges
    domains.forEach(domain => {
      const badge = document.createElement('span');
      badge.className = 'badge badge-primary';
        badge.style.marginRight = '5px';
        badge.textContent = formatDomain(domain);
        domainsContainer.appendChild(badge);
    });
    
    // If no domains, add a message
    if (domains.length === 0) {
        const noDomains = document.createElement('p');
        noDomains.className = 'text-muted';
        noDomains.textContent = 'No domains selected';
        domainsContainer.appendChild(noDomains);
    }
}

// Helper function to get initials from name
function getInitials(name) {
    if (!name) return '?';
    return name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase();
}

// Update sidebar with user info
function updateSidebarWithUserInfo(userData) {
    if (!userData) return;
    
    // Update username in sidebar
    const sidebarNameEl = document.querySelector('.sidebar-header h3');
    if (sidebarNameEl) {
        sidebarNameEl.textContent = userData.name || 'User';
    }
    
    // Show/hide admin-only elements based on user role
    const isAdmin = userData.role === 'admin';
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = isAdmin ? 'block' : 'none';
    });
}

// Helper functions
function showSection(sectionId) {
    // Hide all sections
    hideAllSections();
    
    // Show requested section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
        
        // Update active nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        document.querySelector(`.nav-link[data-section="${sectionId}"]`)?.classList.add('active');
    }
}

function hideAllSections() {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    container.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Format helper functions
function formatRole(role) {
    if (!role) return 'Volunteer';
    return role.charAt(0).toUpperCase() + role.slice(1);
}

function formatDomain(domain) {
    if (!domain) return '';
    const parts = domain.split('_');
    return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function formatStatus(status) {
    if (!status) return '';
    const parts = status.split('_');
    return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
}

function formatTime(timeStr) {
    if (!timeStr) return 'N/A';
    return timeStr;
}

// Style helper functions
function getPriorityClass(priority) {
    switch(priority) {
        case 'high': return 'danger';
        case 'medium': return 'warning';
        case 'low': return 'info';
        default: return 'secondary';
    }
}

function getStatusClass(status) {
    switch(status) {
        case 'pending': return 'warning';
        case 'in_progress': return 'info';
        case 'completed': return 'success';
        case 'cancelled': return 'danger';
        default: return 'secondary';
    }
}

function getIdeaStatusClass(status) {
    switch(status) {
        case 'pending': return 'warning';
        case 'approved': return 'success';
        case 'rejected': return 'danger';
        case 'implemented': return 'primary';
        default: return 'secondary';
    }
}

// Chart functions (if Chart.js is available)
function updateDomainsChart(domainsData) {
    if (!window.Chart || !domainsData) return;
    
    const ctx = document.getElementById('domainsChart')?.getContext('2d');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'pie',
    data: {
            labels: domainsData.map(d => formatDomain(d.name)),
      datasets: [{
                data: domainsData.map(d => d.count),
                backgroundColor: [
                    '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'
                ]
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
                legend: {
                    position: 'bottom'
        }
      }
    }
  });
}

function updateEventsChart(eventsData) {
    if (!window.Chart || !eventsData) return;
    
    const ctx = document.getElementById('eventsChart')?.getContext('2d');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
    data: {
            labels: eventsData.map(e => e.month),
      datasets: [{
                label: 'Events',
                data: eventsData.map(e => e.count),
                backgroundColor: '#4e73df'
      }]
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function createTask() {
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const domain = document.getElementById('taskDomain').value;
    const priority = document.getElementById('taskPriority').value;
    const startDate = document.getElementById('taskStartDate').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const assigneeId = document.getElementById('taskAssignee').value;

    if (!title || !description || !domain || !priority || !startDate || !dueDate) {
        showNotification('Please fill all required fields', 'error');
        return;
    }

    const taskData = {
        title,
        description,
        domain,
        priority,
        start_date: startDate,
        due_date: dueDate,
        assignee_id: assigneeId
    };

    console.log('Submitting task:', taskData);

    fetch('/api/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(taskData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.message || 'Error creating task');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Task created successfully:', data);
        showNotification('Task created successfully!', 'success');
        document.getElementById('closeTaskModalBtn').click();
        loadTasks(); // Reload tasks list
        
        // Reset form fields
        document.getElementById('taskForm').reset();
    })
    .catch(error => {
        console.error('Error creating task:', error);
        showNotification(`Failed to create task: ${error.message}`, 'error');
    });
}

// Show toast notification
function showToast(message, type = 'success') {
    // Check if toast container exists, if not create it
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
        `;
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.cssText = `
        min-width: 250px;
        margin-bottom: 10px;
        background-color: ${type === 'success' ? '#51a351' : type === 'error' ? '#bd362f' : '#f89406'};
        color: white;
        padding: 15px;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    // Add message
    toast.textContent = message;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Force reflow
    void toast.offsetWidth;
    
    // Show toast
    toast.style.opacity = '1';
    
    // Auto remove after 3 seconds
  setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, 3000);
}

// Set up the modals for ideas section
function setupIdeasSection() {
    console.log('Setting up ideas section');
    
    // Check if already initialized
    if (window.ideasSectionInitialized) {
        console.log('Ideas section already initialized, skipping setup');
        return;
    }
    
    // Set up the Submit Idea button
    const submitIdeaBtn = document.getElementById('submitIdeaBtn');
    if (submitIdeaBtn) {
        console.log('Found Submit Idea button, attaching handler');
        submitIdeaBtn.addEventListener('click', function(e) {
    e.preventDefault();
            console.log('Submit Idea button clicked');
            
            // Reset form
            const form = document.getElementById('submitIdeaForm');
            if (form) {
                console.log('Resetting idea submission form');
                form.reset();
            }
            
            // Show the modal
            showCustomModal('submitIdeaModal');
        });
    } else {
        console.warn('Submit Idea button not found');
    }
    
    // Set up the Save Idea button
    const saveIdeaBtn = document.getElementById('saveIdeaBtn');
    if (saveIdeaBtn) {
        console.log('Found Save Idea button, attaching handler');
        saveIdeaBtn.addEventListener('click', function(e) {
    e.preventDefault();
            console.log('Save Idea button clicked');
            saveNewIdea();
        });
    } else {
        console.warn('Save Idea button not found');
    }
    
    // Load ideas data
    loadIdeationData();
    
    // Mark as initialized
    window.ideasSectionInitialized = true;
}

// Ensure all modal styles are properly applied
function ensureModalStyles() {
    console.log('Ensuring modal styles are applied');
    
    // Add essential modal styles if missing
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    
    modalOverlays.forEach(modal => {
        // Set essential display properties
        if (modal.classList.contains('visible')) {
            modal.style.display = 'flex';
            modal.style.opacity = '1';
        }
        
        // Fix modal container styles
        const container = modal.querySelector('.modal-container');
        if (container) {
            container.style.backgroundColor = '#fff';
            container.style.borderRadius = '8px';
            container.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            container.style.width = '90%';
            container.style.maxWidth = '600px';
            container.style.maxHeight = '90vh';
            container.style.overflow = 'auto';
        }
    });
    
    // Also apply styles to Bootstrap modals if they exist
    const bootstrapModals = document.querySelectorAll('.modal.fade');
    bootstrapModals.forEach(modal => {
        // Ensure proper z-index and visibility
        modal.style.zIndex = '9999';
    });
    
    console.log(`Styled ${modalOverlays.length} custom modals and ${bootstrapModals.length} Bootstrap modals`);
}

// Direct handler for modal opening buttons
function createDirectModalHandler(buttonId, modalId) {
    console.log(`Setting up direct modal handler: ${buttonId} -> ${modalId}`);
    
    const button = document.getElementById(buttonId);
    if (!button) {
        console.error(`Button not found: ${buttonId}`);
        return;
    }
    
    // Remove any existing click handlers and replace with a new direct one
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    newButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log(`Button clicked: ${buttonId}, opening modal: ${modalId}`);
        
        // Special case for Edit Profile button
        if (buttonId === 'editProfileBtn') {
            console.log('Calling openEditProfileModal for Edit Profile button');
            openEditProfileModal();
            return;
        }
        
        // Special case for Create Task button
        if (buttonId === 'createTaskBtn') {
            console.log('Preparing create task form');
            const form = document.getElementById('taskForm');
            if (form) {
                console.log('Resetting task form');
                form.reset();
                
                // Set default dates
                const today = new Date();
                const nextWeek = new Date(today);
                nextWeek.setDate(today.getDate() + 7);
                
                const startDateField = document.getElementById('taskStartDate');
                const dueDateField = document.getElementById('taskDueDate');
                
                if (startDateField) startDateField.value = formatDateForInput(today);
                if (dueDateField) dueDateField.value = formatDateForInput(nextWeek);
            } else {
                console.error('Task form not found');
            }
        }
        
        // Special case for Create Event button
        if (buttonId === 'createEventBtn') {
            console.log('Preparing create event form');
            const form = document.getElementById('createEventForm');
            if (form) {
                console.log('Resetting event form');
                form.reset();
                
                // Set default date to tomorrow
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                
                const dateField = document.getElementById('eventDate');
                if (dateField) dateField.value = formatDateForInput(tomorrow);
            } else {
                console.error('Event form not found');
            }
        }
        
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal not found: ${modalId}`);
            return;
        }
        
        // Check if it's a Bootstrap modal or a custom modal
        if (modal.classList.contains('modal-overlay')) {
            // Custom modal
            console.log(`Opening custom modal: ${modalId}`);
            showCustomModal(modalId);
        } else if (modal.classList.contains('modal')) {
            // Bootstrap modal
            console.log(`Opening Bootstrap modal: ${modalId}`);
            try {
                const bootstrapModal = new bootstrap.Modal(modal);
                bootstrapModal.show();
            } catch (error) {
                console.error(`Error showing Bootstrap modal: ${error.message}`);
                // Fallback to manual display
                modal.classList.add('show');
                modal.style.display = 'block';
                document.body.classList.add('modal-open');
                
                // Add backdrop
                const backdrop = document.createElement('div');
                backdrop.className = 'modal-backdrop fade show';
                document.body.appendChild(backdrop);
            }
        } else {
            console.error(`Unknown modal type for ${modalId}`);
        }
    });
}
