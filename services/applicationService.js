import { authService } from './authService.js';
import { API_URL } from '../js/utils.js';

class ApplicationService {
    async apply(taskId) {
        try {
            const userId = authService.getUser().id;
            const response = await fetch(`${API_URL}/applications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`
                },
                body: JSON.stringify({ userId, taskId })
            });

            if (!response.ok) {
                throw new Error('Failed to apply for task');
            }

            return await response.json();
        } catch (error) {
            console.error('Error applying for task:', error);
            throw error;
        }
    }

    async getUserApplications() {
        try {
            const userId = authService.getUser().id;
            const response = await fetch(`${API_URL}/applications/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user applications');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching user applications:', error);
            throw error;
        }
    }

    async getTaskApplications(taskId) {
        try {
            const response = await fetch(`${API_URL}/applications/task/${taskId}`, {
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch task applications');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching task applications:', error);
            throw error;
        }
    }

    async updateApplicationStatus(applicationId, status) {
        try {
            const response = await fetch(`${API_URL}/applications/${applicationId}/status?status=${status}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to update application status');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating application status:', error);
            throw error;
        }
    }
}

export const applicationService = new ApplicationService(); 