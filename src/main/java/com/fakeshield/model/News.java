package com.fakeshield.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "news")
public class News {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "source_url")
    private String sourceUrl;

    @Column(name = "author")
    private String author;

    @Column(name = "platform")
    private String platform;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "credibility_score")
    private double credibilityScore;

    @Enumerated(EnumType.STRING)
    private NewsStatus status;

    @Column(name = "viral_count")
    private int viralCount;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "analysis_id")
    private AnalysisResult analysisResult;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User submittedBy;

    // ================================
    // Constructors
    // ================================
    public News() {
        this.submittedAt = LocalDateTime.now();
        this.status = NewsStatus.UNVERIFIED;
        this.viralCount = 0;
    }

    public News(String title, String content, String sourceUrl) {
        this();
        this.title = title;
        this.content = content;
        this.sourceUrl = sourceUrl;
    }

    // ================================
    // Builder Pattern
    // OOP - Creational Design Pattern
    // ================================
    public static class Builder {

        private String title;
        private String content;
        private String sourceUrl;
        private String platform;
        private String author;

        public Builder title(String title) {
            this.title = title;
            return this;
        }

        public Builder content(String content) {
            this.content = content;
            return this;
        }

        public Builder sourceUrl(String url) {
            this.sourceUrl = url;
            return this;
        }

        public Builder platform(String platform) {
            this.platform = platform;
            return this;
        }

        public Builder author(String author) {
            this.author = author;
            return this;
        }

        public News build() {
            News news = new News();
            news.title = this.title;
            news.content = this.content;
            news.sourceUrl = this.sourceUrl;
            news.platform = this.platform;
            news.author = this.author;
            return news;
        }
    }

    // ================================
    // Getters and Setters
    // ================================
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public double getCredibilityScore() { return credibilityScore; }
    public void setCredibilityScore(double credibilityScore) {
        this.credibilityScore = credibilityScore;
    }

    public NewsStatus getStatus() { return status; }
    public void setStatus(NewsStatus status) { this.status = status; }

    public int getViralCount() { return viralCount; }
    public void setViralCount(int viralCount) { this.viralCount = viralCount; }

    public AnalysisResult getAnalysisResult() { return analysisResult; }
    public void setAnalysisResult(AnalysisResult analysisResult) {
        this.analysisResult = analysisResult;
    }

    public User getSubmittedBy() { return submittedBy; }
    public void setSubmittedBy(User submittedBy) {
        this.submittedBy = submittedBy;
    }

    @Override
    public String toString() {
        return "News{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", status=" + status +
                ", credibilityScore=" + credibilityScore +
                '}';
    }
}