package com.example.amadiri.controller;

import com.example.amadiri.model.Application;
import com.example.amadiri.service.ApplicationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = {"http://localhost:8081", "http://127.0.0.1:8081"})
public class ApplicationController {

    private static final Logger logger = LoggerFactory.getLogger(ApplicationController.class);

    @Autowired
    private ApplicationService applicationService;

    @GetMapping
    public ResponseEntity<List<Application>> getAllApplications() {
        try {
            List<Application> applications = applicationService.getAllApplications();
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des candidatures: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Application> getApplicationById(@PathVariable Long id) {
        try {
            Application application = applicationService.getApplicationById(id);
            return application != null ? ResponseEntity.ok(application) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération de la candidature {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Application>> getUserApplications(@PathVariable Long userId) {
        try {
            List<Application> applications = applicationService.getUserApplications(userId);
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des candidatures de l'utilisateur {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<Application>> getTaskApplications(@PathVariable Long taskId) {
        try {
            List<Application> applications = applicationService.getTaskApplications(taskId);
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des candidatures pour la tâche {}: {}", taskId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<Application> createApplication(@RequestBody Map<String, Long> payload) {
        try {
            Long userId = payload.get("userId");
            Long taskId = payload.get("taskId");
            
            if (userId == null || taskId == null) {
                return ResponseEntity.badRequest().build();
            }

            Application application = applicationService.createApplication(userId, taskId);
            return ResponseEntity.status(HttpStatus.CREATED).body(application);
        } catch (Exception e) {
            logger.error("Erreur lors de la création de la candidature: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Application> updateApplicationStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            Application application = applicationService.updateApplicationStatus(id, status);
            return application != null ? ResponseEntity.ok(application) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Erreur lors de la mise à jour du statut de la candidature {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        try {
            applicationService.deleteApplication(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Erreur lors de la suppression de la candidature {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
} 