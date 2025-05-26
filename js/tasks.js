// Remove ES6 imports and use global utils object
const utils = window.utils;
const { API_URL, apiRequest, showToast, toastTypes, initModal, getUrlParams, formatDate, truncateText } = utils;

/**
 * Tasks management functionality for the Amadiri admin dashboard
 */

// API endpoints
const TASKS_ENDPOINT = `${API_URL}/tasks`;

// DOM Elements
const tasksTableBody = document.getElementById('tasksTableBody');
const searchTasksInput = document.getElementById('searchTasks');
const deleteModal = document.getElementById('deleteModal');
const closeDeleteModalBtn = document.getElementById('closeDeleteModal');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// State
let tasks = [];
let taskToDelete = null;

/**
 * Initialize tasks dashboard
 */
function initTasks() {
  // Initialize delete modal
  const modal = initModal('deleteModal');
  
  // Setup event listeners for modal
  if (closeDeleteModalBtn) {
    closeDeleteModalBtn.addEventListener('click', () => modal.close());
  }
  
  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', () => modal.close());
  }
  
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', () => {
      deleteTask(taskToDelete);
      modal.close();
    });
  }
  
  // Setup search functionality
  if (searchTasksInput) {
    searchTasksInput.addEventListener('input', handleSearchTasks);
  }
  
  // Load tasks
  loadTasks();
}

/**
 * Load all tasks from the API
 */
async function loadTasks() {
  try {
    showLoadingIndicator();
    
    // Vérification de l'authentification via authService
    if (!window.authService.isAuthenticated()) {
      window.location.href = 'index.html';
      return;
    }
    
    const response = await window.utils.apiRequest(TASKS_ENDPOINT, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${window.authService.getToken()}`
      }
    });
    
    if (!Array.isArray(response)) {
      throw new Error('Format de réponse invalide');
    }
    
    tasks = response;
    renderTasks(tasks);
  } catch (error) {
    console.error('Error loading tasks:', error);
    showErrorMessage('Une erreur est survenue lors du chargement des tâches. Veuillez réessayer.');
  } finally {
    hideLoadingIndicator();
  }
}

function showLoadingIndicator() {
  if (tasksTableBody) {
    tasksTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Chargement en cours...</td></tr>';
  }
}

function hideLoadingIndicator() {
  // Will be replaced by the actual content
}

function showErrorMessage(message) {
  if (tasksTableBody) {
    tasksTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">${message}</td></tr>`;
  }
}

/**
 * Render tasks in the table
 * @param {Array} tasksToRender - Array of tasks to render
 */
function renderTasks(tasksToRender) {
  if (!tasksTableBody) return;
  
  if (!tasksToRender || tasksToRender.length === 0) {
    renderEmptyTable('Aucune tâche trouvée');
    return;
  }
  
  // Clear table
  tasksTableBody.innerHTML = '';
  
  // Add tasks to table
  tasksToRender.forEach(task => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${task.title}</td>
      <td class="task-description">${utils.truncateText(task.description || '', 100)}</td>
      <td>${utils.formatDate(task.datePosted)}</td>
      <td>${utils.formatCurrency(task.salaire)}</td>
      <td>
        <span class="status-badge status-${task.status?.toLowerCase() || 'en-attente'}">
          ${task.status || 'EN_ATTENTE'}
        </span>
      </td>
      <td>
        <div class="table-actions">
          <a href="new-task.html?id=${task.id}" class="edit-btn" title="Modifier">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
              <path fill="none" d="M0 0h24v24H0z"/>
              <path d="M15.728 9.686l-1.414-1.414L5 17.586V19h1.414l9.314-9.314zm1.414-1.414l1.414-1.414-1.414-1.414-1.414 1.414 1.414 1.414zM7.242 21H3v-4.243L16.435 3.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 21z" fill="currentColor"/>
            </svg>
          </a>
          <button class="delete-btn" data-id="${task.id}" title="Supprimer">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
              <path fill="none" d="M0 0h24v24H0z"/>
              <path d="M7 4V2h10v2h5v2h-2v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6H2V4h5zM6 6v14h12V6H6zm3 3h2v8H9V9zm4 0h2v8h-2V9z" fill="currentColor"/>
            </svg>
          </button>
          <a href="applications.html?taskId=${task.id}" class="view-btn" title="Voir les candidatures">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
              <path fill="none" d="M0 0h24v24H0z"/>
              <path d="M12 3c5.392 0 9.878 3.88 10.819 9-.94 5.12-5.427 9-10.819 9-5.392 0-9.878-3.88-10.819-9C2.121 6.88 6.608 3 12 3zm0 16a9.005 9.005 0 0 0 8.777-7 9.005 9.005 0 0 0-17.554 0A9.005 9.005 0 0 0 12 19zm0-2.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0-2a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" fill="currentColor"/>
            </svg>
          </a>
        </div>
      </td>
    `;
    
    tasksTableBody.appendChild(row);
  });
  
  // Add event listeners for delete buttons
  const deleteButtons = document.querySelectorAll('.delete-btn');
  deleteButtons.forEach(button => {
    button.addEventListener('click', () => {
      taskToDelete = button.getAttribute('data-id');
      const modal = initModal('deleteModal');
      modal.open();
    });
  });
}

/**
 * Render empty table with message
 * @param {string} message - Message to display
 */
function renderEmptyTable(message) {
  if (!tasksTableBody) return;
  
  tasksTableBody.innerHTML = `
    <tr>
      <td colspan="5" class="text-center">
        <p>${message}</p>
      </td>
    </tr>
  `;
}

/**
 * Delete a task
 * @param {string} taskId - ID of the task to delete
 */
async function deleteTask(taskId) {
  try {
    await apiRequest(`${TASKS_ENDPOINT}/${taskId}`, {
      method: 'DELETE'
    });
    
    // Update local tasks list
    tasks = tasks.filter(task => task.id !== taskId);
    
    // Re-render the table
    renderTasks(tasks);
    
    showToast('Tâche supprimée avec succès', toastTypes.SUCCESS);
  } catch (error) {
    console.error('Error deleting task:', error);
    showToast('Erreur lors de la suppression de la tâche', toastTypes.ERROR);
  }
}

/**
 * Handle search in tasks
 */
function handleSearchTasks() {
  const searchTerm = searchTasksInput.value.toLowerCase();
  
  if (searchTerm === '') {
    renderTasks(tasks);
    return;
  }
  
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm) || 
    task.description.toLowerCase().includes(searchTerm) ||
    (task.location && task.location.toLowerCase().includes(searchTerm))
  );
  
  renderTasks(filteredTasks);
}

// Initialize tasks functionality when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Navigation via la sidebar
  const navTasks = document.getElementById('navTasks');
  const navApplications = document.getElementById('navApplications');
  const tasksWindow = document.getElementById('tasksWindow');
  const applicationsWindow = document.getElementById('applicationsWindow');

  if (navTasks && navApplications && tasksWindow && applicationsWindow) {
    navTasks.addEventListener('click', () => {
      navTasks.classList.add('active');
      navApplications.classList.remove('active');
      tasksWindow.style.display = '';
      applicationsWindow.style.display = 'none';
    });
    navApplications.addEventListener('click', () => {
      navApplications.classList.add('active');
      navTasks.classList.remove('active');
      tasksWindow.style.display = 'none';
      applicationsWindow.style.display = '';
      loadAllApplications();
    });
  }
  // Initialisation normale
  initTasks();
});

// Fonction pour charger toutes les candidatures dans le dashboard
async function loadAllApplications() {
  const tbody = document.getElementById('applicationsTableBody');
  if (!tbody) return;
  tbody.innerHTML = `<tr class="loading-row"><td colspan="4"><div class="loading-spinner"></div><p>Chargement des candidatures...</p></td></tr>`;
  try {
    const response = await apiRequest(`${API_URL}/applications`, { 
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!Array.isArray(response) || response.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center"><p>Aucune candidature trouvée</p></td></tr>`;
      return;
    }

    tbody.innerHTML = '';
    response.forEach(app => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${app.userName || 'N/A'}</td>
        <td>${app.taskTitle || 'N/A'}</td>
        <td>${formatDateTime(app.dateApplied)}</td>
        <td><span class="status-badge status-${app.status?.toLowerCase() || 'en-attente'}">${app.status || 'EN_ATTENTE'}</span></td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading applications:', error);
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger"><p>Erreur lors du chargement des candidatures : ${error.message || error}</p></td></tr>`;
  }
}