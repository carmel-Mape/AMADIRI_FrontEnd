package com.example.amadiri.service;

import com.example.amadiri.model.Application;
import com.example.amadiri.model.ApplicationStatus;
import com.example.amadiri.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    public Application getApplicationById(Long id) {
        return applicationRepository.findById(id).orElse(null);
    }

    public List<Application> getUserApplications(Long userId) {
        return applicationRepository.findByUserId(userId);
    }

    public List<Application> getTaskApplications(Long taskId) {
        return applicationRepository.findByTaskId(taskId);
    }

    public Application createApplication(Long userId, Long taskId) {
        Application application = new Application(userId, taskId);
        return applicationRepository.save(application);
    }

    public Application updateApplicationStatus(Long id, String status) {
        Application application = applicationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Application non trouvée"));
        
        try {
            ApplicationStatus newStatus = ApplicationStatus.valueOf(status.toUpperCase());
            application.setStatus(newStatus);
            return applicationRepository.save(application);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Statut invalide");
        }
    }

    public void deleteApplication(Long id) {
        applicationRepository.deleteById(id);
    }
} 