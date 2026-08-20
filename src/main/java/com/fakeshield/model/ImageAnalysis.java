package com.fakeshield.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "image_analyses")
public class ImageAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String filename;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "image_type")
    private String imageType;

    @Column(columnDefinition = "TEXT")
    private String extractedText;

    @Column(name = "visual_score")
    private Double visualScore;

    @Column(name = "metadata_score")
    private Double metadataScore;

    @Column(name = "text_analysis_score")
    private Double textAnalysisScore;

    @Column(name = "ocr_score")
    private Double ocrScore;

    @Column(name = "credibility_score")
    private Double credibilityScore;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NewsStatus status;

    @Column(name = "processing_time_ms")
    private Long processingTimeMs;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // ✅ Link to User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore  // Prevent circular JSON reference
    private User user;

    // ================================
    // Constructors
    // ================================
    public ImageAnalysis() {
        this.createdAt = LocalDateTime.now();
    }

    public ImageAnalysis(String filename, Long fileSize, String imageType) {
        this();
        this.filename = filename;
        this.fileSize = fileSize;
        this.imageType = imageType;
    }

    // ================================
    // Lifecycle Callbacks
    // ================================
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    // ================================
    // Getters and Setters
    // ================================
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getImageType() {
        return imageType;
    }

    public void setImageType(String imageType) {
        this.imageType = imageType;
    }

    public String getExtractedText() {
        return extractedText;
    }

    public void setExtractedText(String extractedText) {
        this.extractedText = extractedText;
    }

    public Double getVisualScore() {
        return visualScore;
    }

    public void setVisualScore(Double visualScore) {
        this.visualScore = visualScore;
    }

    public Double getMetadataScore() {
        return metadataScore;
    }

    public void setMetadataScore(Double metadataScore) {
        this.metadataScore = metadataScore;
    }

    public Double getTextAnalysisScore() {
        return textAnalysisScore;
    }

    public void setTextAnalysisScore(Double textAnalysisScore) {
        this.textAnalysisScore = textAnalysisScore;
    }

    public Double getOcrScore() {
        return ocrScore;
    }

    public void setOcrScore(Double ocrScore) {
        this.ocrScore = ocrScore;
    }

    public Double getCredibilityScore() {
        return credibilityScore;
    }

    public void setCredibilityScore(Double credibilityScore) {
        this.credibilityScore = credibilityScore;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public NewsStatus getStatus() {
        return status;
    }

    public void setStatus(NewsStatus status) {
        this.status = status;
    }

    public Long getProcessingTimeMs() {
        return processingTimeMs;
    }

    public void setProcessingTimeMs(Long processingTimeMs) {
        this.processingTimeMs = processingTimeMs;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // ✅ Added for Backward Compatibility
    public LocalDateTime getUploadedAt() {
        return this.createdAt != null ? this.createdAt : LocalDateTime.now();
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.createdAt = uploadedAt;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    // ================================
    // Convenience Methods
    // ================================

    /**
     * Get user ID safely (for JSON responses)
     */
    public Long getUserId() {
        return user != null ? user.getId() : null;
    }

    /**
     * Get username safely (for JSON responses)
     */
    public String getUsername() {
        return user != null ? user.getUsername() : "Guest";
    }

    @Override
    public String toString() {
        return "ImageAnalysis{" +
                "id=" + id +
                ", filename='" + filename + '\'' +
                ", status=" + status +
                ", credibilityScore=" + credibilityScore +
                ", user=" + (user != null ? user.getUsername() : "Guest") +
                '}';
    }
}