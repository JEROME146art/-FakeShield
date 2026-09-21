package com.fakeshield.service.detection;

import com.fakeshield.model.News;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

// OOP: Inheritance - extends BaseDetector
// OOP: Polymorphism - overrides performAnalysis()
public class ClickbaitDetector extends BaseDetector {

    // List of clickbait phrases to detect
    private static final List<String> CLICKBAIT_PHRASES = Arrays.asList(
            "you won't believe",
            "shocking",
            "mind blowing",
            "jaw dropping",
            "what happened next",
            "the truth about",
            "doctors hate him",
            "this one trick",
            "will blow your mind",
            "unbelievable",
            "number 5 will shock",
            "breaking:",
            "exclusive:",
            "secret revealed",
            "they don't want you to know",
            "exposed",
            "must read",
            "urgent",
            "alert",
            "gone viral"
    );

    // Pattern to detect excessive capital letters
    private static final Pattern EXCESSIVE_CAPS =
            Pattern.compile("[A-Z]{4,}");

    // Pattern to detect excessive punctuation
    private static final Pattern EXCESSIVE_PUNCTUATION =
            Pattern.compile("[!?]{2,}");

    // ================================
    // Constructor
    // ================================
    public ClickbaitDetector() {
        super("Clickbait Detector", 0.15);
    }

    // ================================
    // OOP: Polymorphism
    // Overriding abstract method from BaseDetector
    // ================================
    @Override
    protected double performAnalysis(News news) {
        double score = 100.0;
        StringBuilder explanation = new StringBuilder();

        // If no title return 50
        if (news.getTitle() == null) {
            lastExplanation = "No title to analyze.";
            return 50.0;
        }

        String titleLower = news.getTitle().toLowerCase();
        List<String> foundPhrases = new ArrayList<>();

        // Check each clickbait phrase
        for (String phrase : CLICKBAIT_PHRASES) {
            if (titleLower.contains(phrase)) {
                foundPhrases.add(phrase);
                score -= 15;
            }
        }

        // Check excessive capitals
        Matcher capsMatcher = EXCESSIVE_CAPS.matcher(news.getTitle());
        if (capsMatcher.find()) {
            score -= 10;
            explanation.append("Excessive capital letters detected. ");
        }

        // Check excessive punctuation
        Matcher punctMatcher = EXCESSIVE_PUNCTUATION.matcher(news.getTitle());
        if (punctMatcher.find()) {
            score -= 10;
            explanation.append("Excessive punctuation detected. ");
        }

        // Check title length
        int titleLen = news.getTitle().length();
        if (titleLen < 10 || titleLen > 200) {
            score -= 5;
            explanation.append("Unusual title length (")
                    .append(titleLen)
                    .append(" chars). ");
        }

        // Add found phrases to explanation
        if (!foundPhrases.isEmpty()) {
            explanation.append("Clickbait phrases found: ")
                    .append(String.join(", ", foundPhrases))
                    .append(".");
        } else {
            explanation.append("No clickbait phrases detected.");
        }

        lastExplanation = explanation.toString();
        return score;
    }
}