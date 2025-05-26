// Constantes
const API_URL = window.utils.API_URL;
const APPLICATIONS_ENDPOINT = `${API_URL}/applications`;

// Éléments DOM
const applicationsTable = document.getElementById('applicationsTable');
const searchInput = document.getElementById('searchApplications');
const statusFilter = document.getElementById('statusFilter');
const modal = document.getElementById('applicationModal');
const closeModal = document.getElementById('closeModal');
const acceptButton = document.getElementById('acceptButton');
const rejectButton = document.getElementById('rejectButton');

// État global
let applications = [];
let currentApplication = null;

// Initialisation
document.addEventListener('DOMContentLoaded', init);

async function init() {
    setupEventListeners();
    await loadApplications();
}

function setupEventListeners() {
    if (closeModal) {
        closeModal.addEventListener('click', () => modal.style.display = 'none');
    }

    if (acceptButton) {
        acceptButton.addEventListener('click', () => updateApplicationStatus('ACCEPTE'));
    }

    if (rejectButton) {
        rejectButton.addEventListener('click', () => updateApplicationStatus('REFUSE'));
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterApplications);
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', filterApplications);
    }
}

async function loadApplications() {
    try {
        showLoading();
        const response = await window.utils.apiRequest(APPLICATIONS_ENDPOINT, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${window.utils.getToken()}`
            }
        });
        
        applications = Array.isArray(response) ? response : [];
        renderApplications(applications);
    } catch (error) {
        console.error('Error loading applications:', error);
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function renderApplications(applicationsToShow) {
    if (!applicationsTable) return;
    
    const tbody = applicationsTable.querySelector('tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!applicationsToShow.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">Aucune candidature trouvée</td>
            </tr>
        `;
        return;
    }
    
    applicationsToShow.forEach(app => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${app.userName || 'N/A'}</td>
            <td>${app.taskTitle || 'N/A'}</td>
            <td>${window.utils.formatDateTime(app.dateApplied)}</td>
            <td>
                <span class="status-badge status-${app.status?.toLowerCase() || 'en-attente'}">
                    ${app.status || 'EN_ATTENTE'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-success btn-sm" onclick="showUpdateModal('${app.id}', 'ACCEPTE')" 
                            ${app.status !== 'EN_ATTENTE' ? 'disabled' : ''}>
                        Accepter
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="showUpdateModal('${app.id}', 'REFUSE')"
                            ${app.status !== 'EN_ATTENTE' ? 'disabled' : ''}>
                        Refuser
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showUpdateModal(applicationId, newStatus) {
    currentApplication = { id: applicationId, newStatus };
    if (modal) {
        modal.style.display = 'block';
    }
}

async function updateApplicationStatus(status) {
    if (!currentApplication) return;
    
    try {
        await window.utils.apiRequest(`${APPLICATIONS_ENDPOINT}/${currentApplication.id}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${window.utils.getToken()}`
            },
            body: JSON.stringify({ 
                status,
                dateApplied: new Date().toISOString()
            })
        });
        
        await loadApplications();
        modal.style.display = 'none';
        window.utils.showToast('Statut de la candidature mis à jour avec succès', 'success');
    } catch (error) {
        console.error('Error updating application status:', error);
        window.utils.showToast(error.message, 'error');
    }
}

function filterApplications() {
    const searchTerm = searchInput?.value.toLowerCase() || '';
    const statusValue = statusFilter?.value || '';
    
    const filtered = applications.filter(app => {
        const matchesSearch = 
            app.userName?.toLowerCase().includes(searchTerm) ||
            app.taskTitle?.toLowerCase().includes(searchTerm);
            
        const matchesStatus = !statusValue || app.status === statusValue;
        
        return matchesSearch && matchesStatus;
    });
    
    renderApplications(filtered);
}

function showLoading() {
    if (!applicationsTable) return;
    const tbody = applicationsTable.querySelector('tbody');
    if (!tbody) return;
    
    tbody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Chargement...</span>
                </div>
            </td>
        </tr>
    `;
}

function hideLoading() {
    // Le contenu sera remplacé par renderApplications
}

function showError(message) {
    if (!applicationsTable) return;
    const tbody = applicationsTable.querySelector('tbody');
    if (!tbody) return;
    
    tbody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center text-danger">
                ${message}
            </td>
        </tr>
    `;
} 