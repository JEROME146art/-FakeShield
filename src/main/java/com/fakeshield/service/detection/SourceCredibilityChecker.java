package com.fakeshield.service.detection;

import com.fakeshield.model.News;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

// OOP: Inheritance - extends BaseDetector
// OOP: Polymorphism - overrides performAnalysis()
public class SourceCredibilityChecker extends BaseDetector {

    // Known credible sources with their credibility score
    private static final Map<String, Integer> CREDIBLE_SOURCES = new HashMap<>();

    // Known fake or unreliable sources
    private static final Set<String> UNRELIABLE_SOURCES = new HashSet<>();

    // ================================
    // Static block to fill the maps
    // Runs once when class is loaded
    // ================================
    static {
        // Credible news sources
        CREDIBLE_SOURCES.put("reuters.com", 95);
        CREDIBLE_SOURCES.put("apnews.com", 95);
        CREDIBLE_SOURCES.put("bbc.com", 90);
        CREDIBLE_SOURCES.put("bbc.co.uk", 90);
        CREDIBLE_SOURCES.put("nytimes.com", 88);
        CREDIBLE_SOURCES.put("theguardian.com", 88);
        CREDIBLE_SOURCES.put("washingtonpost.com", 87);
        CREDIBLE_SOURCES.put("npr.org", 90);
        CREDIBLE_SOURCES.put("who.int", 95);
        CREDIBLE_SOURCES.put("cdc.gov", 95);
        CREDIBLE_SOURCES.put("nasa.gov", 98);
        CREDIBLE_SOURCES.put("nature.com", 97);
        CREDIBLE_SOURCES.put("thehindu.com", 88);
        CREDIBLE_SOURCES.put("ndtv.com", 80);
        CREDIBLE_SOURCES.put("indiatoday.in", 78);
        CREDIBLE_SOURCES.put("timesofindia.com", 78);
        CREDIBLE_SOURCES.put("hindustantimes.com", 78);

        // Unreliable or fake news sources
        UNRELIABLE_SOURCES.add("infowars.com");
        UNRELIABLE_SOURCES.add("naturalnews.com");
        UNRELIABLE_SOURCES.add("beforeitsnews.com");
        UNRELIABLE_SOURCES.add("worldnewsdailyreport.com");
        UNRELIABLE_SOURCES.add("empirenews.net");
        UNRELIABLE_SOURCES.add("huzlers.com");
        UNRELIABLE_SOURCES.add("nationalreport.net");
        UNRELIABLE_SOURCES.add("abcnews.com.co");
    }

    // ================================
    // Constructor
    // ================================
    public SourceCredibilityChecker() {
        super("Source Credibility Checker", 0.25);
    }

    // ================================
    // OOP: Polymorphism
    // Overriding abstract method from BaseDetector
    // ================================
    @Override
    protected double performAnalysis(News news) {

        // No source URL provided
        if (news.getSourceUrl() == null || news.getSourceUrl().isEmpty()) {
            lastExplanation = "No source URL provided. " +
                    "Credibility cannot be verified.";
            return 30.0;
        }

        String domain = extractDomain(news.getSourceUrl());

        // Check unreliable sources first
        for (String unreliable : UNRELIABLE_SOURCES) {
            if (domain.contains(unreliable)) {
                lastExplanation = "WARNING: '"
                        + domain
                        + "' is a known misinformation source.";
                return 5.0;
            }
        }

        // Check credible sources
        for (Map.Entry<String, Integer> entry : CREDIBLE_SOURCES.entrySet()) {
            if (domain.contains(entry.getKey())) {
                lastExplanation = "Source '"
                        + domain
                        + "' is a recognized credible news organization.";
                return entry.getValue();
            }
        }

        // Unknown source
        return analyzeUnknownSource(domain);
    }

    // ================================
    // Extract domain from URL
    // ================================
    private String extractDomain(String url) {
        try {
            url = url.toLowerCase()
                    .replace("https://", "")
                    .replace("http://", "")
                    .replace("www.", "");
            int slashIndex = url.indexOf('/');
            return slashIndex > 0 ? url.substring(0, slashIndex) : url;
        } catch (Exception e) {
            return url;
        }
    }

    // ================================
    // Analyze unknown source by URL pattern
    // ================================
    private double analyzeUnknownSource(String domain) {
        double score = 50.0;
        StringBuilder explanation = new StringBuilder("Unknown source. ");

        // Check domain extensions
        if (domain.endsWith(".gov")) {
            score = 90;
            explanation.append("Government domain detected.");
        } else if (domain.endsWith(".edu")) {
            score = 85;
            explanation.append("Educational domain detected.");
        } else if (domain.endsWith(".org")) {
            score += 10;
            explanation.append("Organization domain detected.");
        }

        // Check suspicious domain name patterns
        if (domain.contains("truth")
                || domain.contains("real-news")
                || domain.contains("patriot")
                || domain.contains("freedom-news")) {
            score -= 20;
            explanation.append(" Suspicious domain name pattern detected.");
        }

        lastExplanation = explanation.toString();
        return score;
    }
}