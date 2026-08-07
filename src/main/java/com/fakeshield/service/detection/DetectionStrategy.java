package com.fakeshield.service.detection;

import com.fakeshield.model.News;

// OOP: Interface - Abstraction
public interface DetectionStrategy {

    // Every detector MUST implement these 3 methods
    double analyze(News news);

    String getStrategyName();

    String getExplanation();
}