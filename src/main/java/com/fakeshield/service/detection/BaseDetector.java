package com.fakeshield.service.detection;

import com.fakeshield.model.News;

// OOP: Abstract Class
// Implements Interface = Abstraction
// Child classes will Inherit this = Inheritance
public abstract class BaseDetector implements DetectionStrategy {

    protected double weight;
    protected String name;
    protected String lastExplanation;

    // ================================
    // Constructor
    // ================================
    public BaseDetector(String name, double weight) {
        this.name = name;
        this.weight = weight;
        this.lastExplanation = "";
    }

    // ================================
    // Template Method Pattern
    // OOP - Design Pattern
    // final = cannot be overridden by child classes
    // ================================
    @Override
    public final double analyze(News news) {
        preProcess(news);
        double score = performAnalysis(news);
        score = normalizeScore(score);
        postProcess(news, score);
        return score;
    }

    // ================================
    // Can be overridden by child classes
    // ================================
    protected void preProcess(News news) {
        if (news.getContent() != null) {
            news.setContent(news.getContent().trim());
        }
    }

    // ================================
    // MUST be implemented by child classes
    // OOP - Abstraction
    // ================================
    protected abstract double performAnalysis(News news);

    // ================================
    // Keeps score between 0 and 100
    // ================================
    protected double normalizeScore(double score) {
        return Math.min(100.0, Math.max(0.0, score));
    }

    // ================================
    // Can be overridden by child classes
    // ================================
    protected void postProcess(News news, double score) {
        // Default: do nothing
    }

    // ================================
    // Getters
    // ================================
    @Override
    public String getStrategyName() {
        return name;
    }

    @Override
    public String getExplanation() {
        return lastExplanation;
    }

    public double getWeight() {
        return weight;
    }
}