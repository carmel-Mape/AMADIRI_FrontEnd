package com.example.amadiri.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
public class Application {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "task_id")
    private Long taskId;
    
    @Column(name = "date_applied")
    private LocalDateTime dateApplied;
    
    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private ApplicationStatus status;
    
    // Constructeurs
    public Application() {
    }
    
    public Application(Long userId, Long taskId) {
        this.userId = userId;
        this.taskId = taskId;
        this.dateApplied = LocalDateTime.now();
        this.status = ApplicationStatus.EN_ATTENTE;
    }
    
    // Getters et Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public Long getTaskId() {
        return taskId;
    }
    
    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }
    
    public LocalDateTime getDateApplied() {
        return dateApplied;
    }
    
    public void setDateApplied(LocalDateTime dateApplied) {
        this.dateApplied = dateApplied;
    }
    
    public ApplicationStatus getStatus() {
        return status;
    }
    
    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }
} 