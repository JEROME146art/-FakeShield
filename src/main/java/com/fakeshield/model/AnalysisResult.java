package com.fakeshield.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "analysis_results")
public class AnalysisResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ml_score")
    private double mlScore;

    @Column(name = "nlp_score")
    private double nlpScore;

    @Column(name = "source_credibility_score")
    private double sourceCredibilityScore;

    @Column(name = "sentiment_score")
    private double sentimentScore;

    @Column(name = "clickbait_score")
    private double clickbaitScore;

    @Column(name = "grammar_score")
    private double grammarScore;

    @Column(name = "fact_check_score")
    private double factCheckScore;

    @Column(name = "overall_score")
    private double overallScore;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "detected_keywords", columnDefinition = "TEXT")
    private String detectedKeywords;

    @Column(name = "analysis_time")
    private LocalDateTime analysisTime;

    @Column(name = "processing_ms")
    private long processingTimeMs;

    // ================================
    // Constructor
    // ================================
    public AnalysisResult() {
        this.analysisTime = LocalDateTime.now();
    }

    // ================================
    // Calculate overall weighted score
    // ================================
    public double calculateOverallScore() {
        this.overallScore = (mlScore * 0.35)
                + (nlpScore * 0.20)
                + (sourceCredibilityScore * 0.20)
                + (factCheckScore * 0.15)
                + (clickbaitScore * 0.05)
                + (grammarScore * 0.05);
        return this.overallScore;
    }

    // ================================
    // Get Score Breakdown as Map
    // ================================
    public Map<String, Double> getScoreBreakdown() {
        Map<String, Double> breakdown = new HashMap<>();
        breakdown.put("ML Analysis", mlScore);
        breakdown.put("NLP Analysis", nlpScore);
        breakdown.put("Source Credibility", sourceCredibilityScore);
        breakdown.put("Fact Check", factCheckScore);
        breakdown.put("Clickbait Detection", clickbaitScore);
        breakdown.put("Grammar Check", grammarScore);
        return breakdown;
    }

    // ================================
    // Getters and Setters
    // ================================
    public Long getId() { return id; }

    public double getMlScore() { return mlScore; }
    public void setMlScore(double mlScore) { this.mlScore = mlScore; }

    public double getNlpScore() { return nlpScore; }
    public void setNlpScore(double nlpScore) { this.nlpScore = nlpScore; }

    public double getSourceCredibilityScore() { return sourceCredibilityScore; }
    public void setSourceCredibilityScore(double score) {
        this.sourceCredibilityScore = score;
    }

    public double getSentimentScore() { return sentimentScore; }
    public void setSentimentScore(double score) { this.sentimentScore = score; }

    public double getClickbaitScore() { return clickbaitScore; }
    public void setClickbaitScore(double score) { this.clickbaitScore = score; }

    public double getGrammarScore() { return grammarScore; }
    public void setGrammarScore(double score) { this.grammarScore = score; }

    public double getFactCheckScore() { return factCheckScore; }
    public void setFactCheckScore(double score) { this.factCheckScore = score; }

    public double getOverallScore() { return overallScore; }
    public void setOverallScore(double score) { this.overallScore = score; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public String getDetectedKeywords() { return detectedKeywords; }
    public void setDetectedKeywords(String keywords) {
        this.detectedKeywords = keywords;
    }

    public LocalDateTime getAnalysisTime() { return analysisTime; }

    public long getProcessingTimeMs() { return processingTimeMs; }
    public void setProcessingTimeMs(long ms) { this.processingTimeMs = ms; }
}