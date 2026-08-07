package com.fakeshield.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "total_submissions")
    private int totalSubmissions;

    @Column(name = "reputation_points")
    private int reputationPoints;

    @Column(name = "is_verified")
    private boolean isVerified;

    @OneToMany(mappedBy = "submittedBy", cascade = CascadeType.ALL)
    private List<News> submittedNews = new ArrayList<>();

    // ================================
    // Enum inside User class
    // OOP - Encapsulation
    // ================================
    public enum UserRole {
        ADMIN, MODERATOR, JOURNALIST, USER
    }

    // ================================
    // Constructor
    // ================================
    public User() {
        this.createdAt = LocalDateTime.now();
        this.role = UserRole.USER;
        this.reputationPoints = 0;
        this.isVerified = false;
        this.totalSubmissions = 0;
    }

    // ================================
    // Business Methods
    // ================================
    public void incrementSubmissions() {
        this.totalSubmissions++;
    }

    public void updateReputation(boolean correctSubmission) {
        if (correctSubmission) {
            this.reputationPoints += 10;
        } else {
            this.reputationPoints = Math.max(0, this.reputationPoints - 5);
        }
    }

    // ================================
    // Getters and Setters
    // ================================
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public int getTotalSubmissions() { return totalSubmissions; }
    public void setTotalSubmissions(int totalSubmissions) {
        this.totalSubmissions = totalSubmissions;
    }

    public int getReputationPoints() { return reputationPoints; }
    public void setReputationPoints(int reputationPoints) {
        this.reputationPoints = reputationPoints;
    }

    public boolean isVerified() { return isVerified; }
    public void setVerified(boolean verified) { isVerified = verified; }

    public List<News> getSubmittedNews() { return submittedNews; }
    public void setSubmittedNews(List<News> submittedNews) {
        this.submittedNews = submittedNews;
    }
}