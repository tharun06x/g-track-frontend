// settings.js - Settings Page API Integration
// ==================================================

// Tab switching functionality
function switchTab(tabId) {
  // Reset nav items
  document.querySelectorAll('.settings-nav-item').forEach(item => item.classList.remove('active'));

  // Hide all view sections
  document.getElementById('section-appearance').style.display = 'none';
  document.getElementById('section-account').style.display = 'none';
  document.getElementById('section-notifications').style.display = 'none';

  // Activate requested
  const navItem = document.getElementById(`nav-${tabId}`);
  if (navItem) navItem.classList.add('active');

  const section = document.getElementById(`section-${tabId}`);
  if (section) {
    section.style.display = 'flex';

    // Trigger subtle transition animation
    section.style.opacity = '0';
    section.style.transform = 'translateY(10px)';
    section.style.transition = 'none';

    // small delay to allow DOM to apply block display before transitioning visually
    setTimeout(() => {
      section.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      section.style.opacity = '1';
      section.style.transform = 'translateY(0)';
    }, 10);
  }
}

// Expose function globally
window.switchTab = switchTab;

// Global state
let currentUserData = null;
let currentSettings = null;

// Initialize settings page with authentication and data loading
async function initializeSettings() {
  try {
    // Check authentication
    const auth = localStorage.getItem('gtrack_auth');
    if (!auth) {
      window.location.href = 'index.html';
      return;
    }

    const { token, user_id } = JSON.parse(auth);
    if (!token || !user_id) {
      window.location.href = 'index.html';
      return;
    }

    console.log('Loading settings for user:', user_id);

    // Load user data
    await loadUserData(user_id, token);

    // Load user settings
    await loadUserSettings(user_id, token);

    // Set up theme switching
    setupThemeSwitcher();

    // Set up form submission
    setupAccountFormSubmission(user_id, token);

    // Set up notification toggles
    setupNotificationToggles();

    // Set up auto-delivery toggle
    setupAutoDeliveryToggle(user_id, token);

    // Check for tab parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const tabToOpen = urlParams.get('tab');
    if (tabToOpen) {
      switchTab(tabToOpen);
    }

    console.log('Settings page initialized successfully');
  } catch (error) {
    console.error('Error initializing settings page:', error);
    showErrorToast('Failed to load settings page');
  }
}

// Safe API request wrapper with error handling
async function safeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`API Error: ${response.status}`, errorData);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Request failed:', error);
    return null;
  }
}

// Load user data from /api/v1/users/me
async function loadUserData(userId, token) {
  const baseUrl = window.GTrackApi?.baseUrl || 'https://g-track-backend-94gv.onrender.com';

  const userData = await safeRequest(`${baseUrl}/api/v1/users/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!userData) {
    showErrorToast('Failed to load user data');
    return;
  }

  currentUserData = userData;
  console.log('User data loaded:', currentUserData);

  // Populate user info in Account Profile section
  populateUserProfile(currentUserData);
}

// Load settings from /api/v1/settings/{user_id}
async function loadUserSettings(userId, token) {
  const baseUrl = window.GTrackApi?.baseUrl || 'https://g-track-backend-94gv.onrender.com';

  const settings = await safeRequest(`${baseUrl}/api/v1/settings/${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!settings) {
    console.warn('Failed to load settings, will use defaults');
    return;
  }

  currentSettings = settings;
  console.log('Settings loaded:', currentSettings);

  // Update form fields with settings
  populateSettingsForm(currentSettings);

  // Apply theme preference if stored
  const storedTheme = localStorage.getItem('gtrack_theme');
  if (storedTheme) {
    applyTheme(storedTheme);
  }
}

// Populate user profile section with data
function populateUserProfile(userData) {
  // Name
  const nameInput = document.getElementById('user-name');
  if (nameInput && userData.name) {
    nameInput.value = userData.name;
  }

  // Email
  const emailInput = document.getElementById('user-email');
  if (emailInput && userData.email) {
    emailInput.value = userData.email;
  }

  // Phone
  const phoneInput = document.getElementById('user-phone');
  if (phoneInput && userData.phone_no) {
    phoneInput.value = userData.phone_no;
  }

  // Distributor/Gas Agency
  const agencyInput = document.getElementById('user-agency');
  if (agencyInput && userData.distributor_name) {
    agencyInput.value = userData.distributor_name;
  }

  // Address
  const addressInput = document.getElementById('user-address');
  if (addressInput && userData.address) {
    addressInput.value = userData.address;
  }

  // State
  const stateInput = document.getElementById('user-state');
  if (stateInput && userData.state) {
    stateInput.value = userData.state;
  }

  // District
  const districtInput = document.getElementById('user-district');
  if (districtInput && userData.district) {
    districtInput.value = userData.district;
  }

  // Profile name display
  const profileNameElement = document.getElementById('profile-name');
  if (profileNameElement && userData.name) {
    profileNameElement.textContent = userData.name;
  }
}

// Populate settings form with current settings
function populateSettingsForm(settings) {
  // Auto Delivery toggle
  const autoDeliveryToggle = document.getElementById('auto-delivery-toggle');
  if (autoDeliveryToggle && settings.auto_delivery !== undefined) {
    if (settings.auto_delivery) {
      autoDeliveryToggle.classList.remove('bg-grey');
      autoDeliveryToggle.classList.add('bg-lime');
      autoDeliveryToggle.innerHTML = 'Enabled <i class="ph-bold ph-check"></i>';
    } else {
      autoDeliveryToggle.classList.remove('bg-lime');
      autoDeliveryToggle.classList.add('bg-grey');
      autoDeliveryToggle.innerHTML = 'Disabled <i class="ph-bold ph-x"></i>';
    }
  }

  console.log('Settings form populated');
}

// Setup theme switcher
function setupThemeSwitcher() {
  const themeButtons = document.querySelectorAll('.theme-btn');

  themeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const theme = button.getAttribute('data-theme-value');
      console.log('Theme selected:', theme);

      // Store theme preference
      localStorage.setItem('gtrack_theme', theme);

      // Apply theme
      applyTheme(theme);

      // Update button styling
      updateThemeButtonStyles(theme);

      showSuccessToast(`Switched to ${theme} mode`);
    });
  });

  // Apply stored theme on load
  const storedTheme = localStorage.getItem('gtrack_theme');
  if (storedTheme) {
    updateThemeButtonStyles(storedTheme);
  }
}

// Apply theme to document
function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.classList.add('dark-mode');
  } else {
    document.documentElement.removeAttribute('data-theme');
    document.body.classList.remove('dark-mode');
  }
}

// Update theme button styling
function updateThemeButtonStyles(theme) {
  const themeButtons = document.querySelectorAll('.theme-btn');

  themeButtons.forEach(button => {
    const buttonTheme = button.getAttribute('data-theme-value');
    if (buttonTheme === theme) {
      button.style.borderColor = 'var(--lime)';
      button.style.background = 'rgba(34, 197, 94, 0.1)';
      button.style.color = 'var(--lime)';
    } else {
      button.style.borderColor = 'var(--grey)';
      button.style.background = 'transparent';
      button.style.color = 'var(--black)';
    }
  });
}

// Setup account form submission
function setupAccountFormSubmission(userId, token) {
  const saveButton = document.querySelector('button.bg-black.text-white');

  if (!saveButton) {
    console.warn('Save button not found');
    return;
  }

  saveButton.addEventListener('click', async (e) => {
    e.preventDefault();

    // Get form values
    const nameInput = document.getElementById('user-name');
    const phoneInput = document.getElementById('user-phone');
    const addressInput = document.getElementById('user-address');
    const stateInput = document.getElementById('user-state');
    const districtInput = document.getElementById('user-district');

    if (!nameInput || !phoneInput || !addressInput) {
      showErrorToast('Form fields not found');
      return;
    }

    const name = nameInput.value?.trim();
    const phone = phoneInput.value?.trim();
    const address = addressInput.value?.trim();
    const state = stateInput?.value?.trim();
    const district = districtInput?.value?.trim();

    // Validation
    if (!name) {
      showErrorToast('Full name is required');
      return;
    }

    if (!phone) {
      showErrorToast('Phone number is required');
      return;
    }

    if (!address) {
      showErrorToast('Address is required');
      return;
    }

    // Disable button during submission
    saveButton.disabled = true;
    const originalText = saveButton.textContent;
    saveButton.textContent = 'Saving...';

    try {
      // Submit changes to API
      await updateUserSettings(userId, token, {
        name,
        phone_no: phone,
        address,
        state,
        district
      });

      // Update local data
      if (currentUserData) {
        currentUserData.name = name;
        currentUserData.phone_no = phone;
        currentUserData.address = address;
        currentUserData.state = state;
        currentUserData.district = district;
      }

      showSuccessToast('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      showErrorToast(`Failed to save settings: ${error.message}`);
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = originalText;
    }
  });
}

// Update user settings via API
async function updateUserSettings(userId, token, updates) {
  const baseUrl = window.GTrackApi?.baseUrl || 'https://g-track-backend-94gv.onrender.com';

  console.log('Updating settings:', updates);

  const response = await fetch(`${baseUrl}/api/v1/settings/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update settings');
  }

  const result = await response.json();
  console.log('Settings updated:', result);
  return result;
}

// Setup notification toggles
function setupNotificationToggles() {
  const notificationToggles = document.querySelectorAll('#section-notifications .pill');

  notificationToggles.forEach((toggle, index) => {
    toggle.addEventListener('click', () => {
      const isEnabled = toggle.classList.contains('bg-lime');

      if (isEnabled) {
        toggle.classList.remove('bg-lime');
        toggle.classList.add('bg-grey');
        toggle.innerHTML = 'Disabled <i class="ph-bold ph-x"></i>';
        console.log(`Notification ${index} disabled`);
      } else {
        toggle.classList.add('bg-lime');
        toggle.classList.remove('bg-grey');
        toggle.innerHTML = 'Enabled <i class="ph-bold ph-check"></i>';
        console.log(`Notification ${index} enabled`);
      }

      // Here you could call an API to save notification preferences
      // await saveNotificationPreferences(userId, token, preferences);
    });
  });
}

// Setup auto-delivery toggle
function setupAutoDeliveryToggle(userId, token) {
  const autoDeliveryToggle = document.getElementById('auto-delivery-toggle');

  if (!autoDeliveryToggle) {
    console.warn('Auto delivery toggle not found');
    return;
  }

  autoDeliveryToggle.addEventListener('click', async () => {
    const isEnabled = autoDeliveryToggle.classList.contains('bg-lime');
    const newState = !isEnabled;

    // Update UI immediately
    if (newState) {
      autoDeliveryToggle.classList.remove('bg-grey');
      autoDeliveryToggle.classList.add('bg-lime');
      autoDeliveryToggle.innerHTML = 'Enabled <i class="ph-bold ph-check"></i>';
    } else {
      autoDeliveryToggle.classList.remove('bg-lime');
      autoDeliveryToggle.classList.add('bg-grey');
      autoDeliveryToggle.innerHTML = 'Disabled <i class="ph-bold ph-x"></i>';
    }

    try {
      // Update in database
      await updateUserSettings(userId, token, {
        auto_delivery: newState
      });

      console.log('Auto delivery updated to:', newState);
      showSuccessToast(`Auto delivery ${newState ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating auto delivery:', error);
      // Revert UI on error
      if (newState) {
        autoDeliveryToggle.classList.remove('bg-lime');
        autoDeliveryToggle.classList.add('bg-grey');
        autoDeliveryToggle.innerHTML = 'Disabled <i class="ph-bold ph-x"></i>';
      } else {
        autoDeliveryToggle.classList.add('bg-lime');
        autoDeliveryToggle.classList.remove('bg-grey');
        autoDeliveryToggle.innerHTML = 'Enabled <i class="ph-bold ph-check"></i>';
      }
      showErrorToast(`Failed to update auto delivery: ${error.message}`);
    }
  });
}

// Toast notification utilities
function showErrorToast(message) {
  console.error('Error:', message);
  const toast = document.createElement('div');
  toast.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #ff4444; color: white; padding: 16px 24px; border-radius: 8px; font-weight: 500; z-index: 9999; max-width: 400px;';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function showSuccessToast(message) {
  console.log('Success:', message);
  const toast = document.createElement('div');
  toast.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #22c55e; color: white; padding: 16px 24px; border-radius: 8px; font-weight: 500; z-index: 9999; max-width: 400px;';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeSettings);

// Expose functions globally if needed
window.initializeSettings = initializeSettings;
