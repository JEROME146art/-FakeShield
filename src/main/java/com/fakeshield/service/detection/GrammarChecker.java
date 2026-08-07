package com.fakeshield.service.detection;

import com.fakeshield.model.News;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

// OOP: Inheritance - extends BaseDetector
// OOP: Polymorphism - overrides performAnalysis()
public class GrammarChecker extends BaseDetector {

    // Pattern to detect repeated characters (e.g. "OMG!!!!!!")
    private static final Pattern REPEATED_CHARS =
            Pattern.compile("(.)\\1{3,}");

    // Pattern to detect multiple spaces
    private static final Pattern MULTIPLE_SPACES =
            Pattern.compile("\\s{2,}");

    // Pattern to detect all caps words
    private static final Pattern ALL_CAPS_WORD =
            Pattern.compile("\\b[A-Z]{5,}\\b");

    // ================================
    // Constructor
    // ================================
    public GrammarChecker() {
        super("Grammar Checker", 0.10);
    }

    // ================================
    // OOP: Polymorphism
    // Overriding abstract method from BaseDetector
    // ================================
    @Override
    protected double performAnalysis(News news) {
        double score = 100.0;
        StringBuilder explanation = new StringBuilder();

        String content = news.getContent();

        // No content provided
        if (content == null || content.isEmpty()) {
            lastExplanation = "No content provided for grammar check.";
            return 40.0;
        }

        // Check repeated characters
        Matcher repeatedMatcher = REPEATED_CHARS.matcher(content);
        int repeatedCount = 0;
        while (repeatedMatcher.find()) {
            repeatedCount++;
        }
        if (repeatedCount > 3) {
            score -= 15;
            explanation.append("Repeated characters detected (")
                    .append(repeatedCount)
                    .append(" times). ");
        }

        // Check multiple spaces
        Matcher spacesMatcher = MULTIPLE_SPACES.matcher(content);
        if (spacesMatcher.find()) {
            score -= 10;
            explanation.append("Poor formatting detected. ");
        }

        // Check all caps words
        Matcher capsMatcher = ALL_CAPS_WORD.matcher(content);
        int capsCount = 0;
        while (capsMatcher.find()) {
            capsCount++;
        }
        if (capsCount > 3) {
            score -= 15;
            explanation.append("Excessive capitalization (")
                    .append(capsCount)
                    .append(" words). ");
        }

        // Check sentence count
        String[] sentences = content.split("[.!?]+");
        if (sentences.length < 3) {
            score -= 10;
            explanation.append("Very short content (")
                    .append(sentences.length)
                    .append(" sentences). ");
        }

        // Check word count
        String[] words = content.split("\\s+");
        if (words.length < 20) {
            score -= 15;
            explanation.append("Insufficient content (")
                    .append(words.length)
                    .append(" words). ");
        }

        // All checks passed
        if (explanation.length() == 0) {
            explanation.append("Grammar and formatting check passed.");
        }

        lastExplanation = explanation.toString();
        return score;
    }
}