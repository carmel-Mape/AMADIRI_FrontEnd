// Remove ES6 imports and use global utils object
const utils = window.utils;
const { API_URL, apiRequest, showToast, toastTypes, getUrlParams, validateField } = utils;

/**
 * Task form functionality for creating and editing tasks
 */

// API endpoints
const TASKS_ENDPOINT = `${API_URL}/tasks`;

// DOM Elements
const taskForm = document.getElementById('taskForm');
const taskIdInput = document.getElementById('taskId');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const locationInput = document.getElementById('location');
const dateInput = document.getElementById('date');
const paymentInput = document.getElementById('payment');
const skillsInput = document.getElementById('skills');
const titleError = document.getElementById('titleError');
const descriptionError = document.getElementById('descriptionError');
const locationError = document.getElementById('locationError');
const dateError = document.getElementById('dateError');
const paymentError = document.getElementById('paymentError');
const cancelBtn = document.getElementById('cancelBtn');
const submitBtn = document.getElementById('submitBtn');
const formTitle = document.getElementById('formTitle');
const cardTitle = document.getElementById('cardTitle');

// State
let isEditMode = false;
let currentTask = null;

/**
 * Initialize task form
 */
function initTaskForm() {
  // Check if we're in edit mode
  const params = utils.getUrlParams();
  isEditMode = params.id ? true : false;
  
  // Update form titles if in edit mode
  if (isEditMode) {
    if (formTitle) formTitle.textContent = 'Modifier la tâche';
    if (cardTitle) cardTitle.textContent = 'Modifier une tâche existante';
    
    // Load task data
    loadTaskData(params.id);
  }
  
  // Setup event listeners
  if (taskForm) {
    setupFormValidation();
    
    taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleFormSubmit();
    });
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      window.location.href = 'dashboard.html';
    });
  }
}

/**
 * Load task data for editing
 * @param {string} taskId - ID of the task to edit
 */
async function loadTaskData(taskId) {
  try {
    const task = await utils.apiRequest(`${TASKS_ENDPOINT}/${taskId}`, {
      method: 'GET'
    });
    
    currentTask = task;
    populateForm(task);
  } catch (error) {
    console.error('Error loading task data:', error);
    utils.showToast('Erreur lors du chargement des données de la tâche', utils.toastTypes.ERROR);
  }
}

/**
 * Populate form with task data
 * @param {Object} task - Task data
 */
function populateForm(task) {
  if (!task) return;
  
  taskIdInput.value = task.id;
  titleInput.value = task.title || '';
  descriptionInput.value = task.description || '';
  locationInput.value = task.location || '';
  
  if (task.date) {
    const date = new Date(task.date);
    const formattedDate = date.toISOString().split('T')[0];
    dateInput.value = formattedDate;
  }
  
  paymentInput.value = task.payment || '';
  
  if (task.skills && Array.isArray(task.skills)) {
    skillsInput.value = task.skills.join(', ');
  }
}

/**
 * Setup form validation
 */
function setupFormValidation() {
  // Title validation
  if (titleInput) {
    titleInput.addEventListener('blur', () => {
      validateTitle();
    });
  }
  
  // Description validation
  if (descriptionInput) {
    descriptionInput.addEventListener('blur', () => {
      validateDescription();
    });
  }
  
  // Location validation
  if (locationInput) {
    locationInput.addEventListener('blur', () => {
      validateLocation();
    });
  }
  
  // Date validation
  if (dateInput) {
    dateInput.addEventListener('blur', () => {
      validateDate();
    });
  }
  
  // Payment validation
  if (paymentInput) {
    paymentInput.addEventListener('blur', () => {
      validatePayment();
    });
  }
}

/**
 * Validate title field
 * @returns {boolean} True if valid
 */
function validateTitle() {
  return utils.validateField(
    titleInput,
    (value) => {
      if (!value.trim()) return 'Le titre est requis';
      if (value.length < 3) return 'Le titre doit contenir au moins 3 caractères';
      if (value.length > 100) return 'Le titre ne doit pas dépasser 100 caractères';
      return true;
    },
    titleError
  );
}

/**
 * Validate description field
 * @returns {boolean} True if valid
 */
function validateDescription() {
  return utils.validateField(
    descriptionInput,
    (value) => {
      if (!value.trim()) return 'La description est requise';
      if (value.length < 10) return 'La description doit contenir au moins 10 caractères';
      return true;
    },
    descriptionError
  );
}

/**
 * Validate location field
 * @returns {boolean} True if valid
 */
function validateLocation() {
  return utils.validateField(
    locationInput,
    (value) => {
      if (!value.trim()) return 'Le lieu est requis';
      return true;
    },
    locationError
  );
}

/**
 * Validate date field
 * @returns {boolean} True if valid
 */
function validateDate() {
  return utils.validateField(
    dateInput,
    (value) => {
      if (!value) return 'La date est requise';
      
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) return 'La date ne peut pas être dans le passé';
      
      return true;
    },
    dateError
  );
}

/**
 * Validate payment field
 * @returns {boolean} True if valid
 */
function validatePayment() {
  return utils.validateField(
    paymentInput,
    (value) => {
      if (!value) return 'La rémunération est requise';
      if (isNaN(value) || parseFloat(value) < 0) return 'La rémunération doit être un nombre positif';
      return true;
    },
    paymentError
  );
}

/**
 * Handle form submission
 */
async function handleFormSubmit() {
  // Validate all fields
  const isValid = 
    validateTitle() &&
    validateDescription() &&
    validateLocation() &&
    validatePayment();
  
  if (!isValid) {
    utils.showToast('Veuillez corriger les erreurs dans le formulaire', utils.toastTypes.ERROR);
    return;
  }
  
  // Prepare task data
  const taskData = {
    title: titleInput.value,
    description: descriptionInput.value,
    location: locationInput.value,
    salaire: parseFloat(paymentInput.value),
    status: 'EN_ATTENTE'
  };
  
  try {
    if (isEditMode) {
      // Update existing task
      await utils.apiRequest(`${TASKS_ENDPOINT}/${taskIdInput.value}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.utils.getToken()}`
        },
        body: JSON.stringify(taskData)
      });
      
      utils.showToast('Tâche mise à jour avec succès', utils.toastTypes.SUCCESS);
    } else {
      // Create new task
      await utils.apiRequest(TASKS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.utils.getToken()}`
        },
        body: JSON.stringify(taskData)
      });
      
      utils.showToast('Tâche créée avec succès', utils.toastTypes.SUCCESS);
    }
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
  } catch (error) {
    console.error('Error saving task:', error);
    utils.showToast('Erreur lors de l\'enregistrement de la tâche', utils.toastTypes.ERROR);
  }
}

// Initialize task form when the DOM is loaded
document.addEventListener('DOMContentLoaded', initTaskForm);