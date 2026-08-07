package com.fakeshield.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "image_analysis")
public class ImageAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "filename")
    private String filename;

    @Column(name = "file_size")
    private long fileSize;

    @Column(name = "image_type")
    private String imageType;

    @Column(name = "extracted_text", columnDefinition = "TEXT")
    private String extractedText;

    @Column(name = "credibility_score")
    private double credibilityScore;

    @Enumerated(EnumType.STRING)
    private NewsStatus status;

    @Column(name = "text_analysis_score")
    private double textAnalysisScore;

    @Column(name = "metadata_score")
    private double metadataScore;

    @Column(name = "visual_score")
    private double visualScore;

    @Column(name = "ocr_score")
    private double ocrScore;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    @Column(name = "processing_time_ms")
    private long processingTimeMs;

    // Constructor
    public ImageAnalysis() {
        this.uploadedAt = LocalDateTime.now();
        this.status = NewsStatus.UNVERIFIED;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }

    public long getFileSize() { return fileSize; }
    public void setFileSize(long fileSize) { this.fileSize = fileSize; }

    public String getImageType() { return imageType; }
    public void setImageType(String imageType) { this.imageType = imageType; }

    public String getExtractedText() { return extractedText; }
    public void setExtractedText(String extractedText) { this.extractedText = extractedText; }

    public double getCredibilityScore() { return credibilityScore; }
    public void setCredibilityScore(double credibilityScore) { this.credibilityScore = credibilityScore; }

    public NewsStatus getStatus() { return status; }
    public void setStatus(NewsStatus status) { this.status = status; }

    public double getTextAnalysisScore() { return textAnalysisScore; }
    public void setTextAnalysisScore(double textAnalysisScore) { this.textAnalysisScore = textAnalysisScore; }

    public double getMetadataScore() { return metadataScore; }
    public void setMetadataScore(double metadataScore) { this.metadataScore = metadataScore; }

    public double getVisualScore() { return visualScore; }
    public void setVisualScore(double visualScore) { this.visualScore = visualScore; }

    public double getOcrScore() { return ocrScore; }
    public void setOcrScore(double ocrScore) { this.ocrScore = ocrScore; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }

    public long getProcessingTimeMs() { return processingTimeMs; }
    public void setProcessingTimeMs(long processingTimeMs) { this.processingTimeMs = processingTimeMs; }
}