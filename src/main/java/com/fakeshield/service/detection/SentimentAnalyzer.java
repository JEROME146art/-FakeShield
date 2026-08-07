package com.fakeshield.service.detection;

import com.fakeshield.model.News;
import java.util.HashMap;
import java.util.Map;

// OOP: Inheritance - extends BaseDetector
// OOP: Polymorphism - overrides performAnalysis()
public class SentimentAnalyzer extends BaseDetector {

    // Emotional words with intensity score
    private static final Map<String, Integer> EMOTIONAL_WORDS = new HashMap<>();

    // Bias and misinformation words
    private static final Map<String, Integer> BIAS_WORDS = new HashMap<>();

    // ================================
    // Static block to fill the maps
    // Runs once when class is loaded
    // ================================
    static {
        // Extreme emotional words
        EMOTIONAL_WORDS.put("horrifying", 3);
        EMOTIONAL_WORDS.put("outrageous", 3);
        EMOTIONAL_WORDS.put("catastrophic", 3);
        EMOTIONAL_WORDS.put("disgusting", 3);
        EMOTIONAL_WORDS.put("terrifying", 3);
        EMOTIONAL_WORDS.put("alarming", 2);
        EMOTIONAL_WORDS.put("shocking", 2);
        EMOTIONAL_WORDS.put("devastating", 2);
        EMOTIONAL_WORDS.put("horrific", 2);
        EMOTIONAL_WORDS.put("outrage", 2);
        EMOTIONAL_WORDS.put("enraged", 2);
        EMOTIONAL_WORDS.put("disgusted", 1);
        EMOTIONAL_WORDS.put("angry", 1);
        EMOTIONAL_WORDS.put("furious", 1);

        // Bias and misinformation words
        BIAS_WORDS.put("deep state", 5);
        BIAS_WORDS.put("conspiracy", 4);
        BIAS_WORDS.put("cover up", 4);
        BIAS_WORDS.put("fake media", 4);
        BIAS_WORDS.put("hoax", 3);
        BIAS_WORDS.put("plandemic", 5);
        BIAS_WORDS.put("they are hiding", 4);
        BIAS_WORDS.put("mainstream media lies", 5);
        BIAS_WORDS.put("wake up people", 4);
        BIAS_WORDS.put("share before deleted", 5);
        BIAS_WORDS.put("banned video", 4);
        BIAS_WORDS.put("secret cure", 4);
    }

    // ================================
    // Constructor
    // ================================
    public SentimentAnalyzer() {
        super("Sentiment Analyzer", 0.20);
    }

    // ================================
    // OOP: Polymorphism
    // Overriding abstract method from BaseDetector
    // ================================
    @Override
    protected double performAnalysis(News news) {
        double score = 100.0;
        StringBuilder explanation = new StringBuilder();

        // Combine title and content for analysis
        String text = ((news.getTitle() != null ? news.getTitle() : "")
                + " "
                + (news.getContent() != null ? news.getContent() : ""))
                .toLowerCase();

        int emotionalScore = 0;
        int biasScore = 0;

        // Check emotional words
        for (Map.Entry<String, Integer> entry : EMOTIONAL_WORDS.entrySet()) {
            if (text.contains(entry.getKey())) {
                emotionalScore += entry.getValue();
            }
        }

        // Check bias words
        for (Map.Entry<String, Integer> entry : BIAS_WORDS.entrySet()) {
            if (text.contains(entry.getKey())) {
                biasScore += entry.getValue();
            }
        }

        // Reduce score based on emotional and bias scores
        score -= (emotionalScore * 5);
        score -= (biasScore * 8);

        // Build explanation
        if (emotionalScore > 0) {
            explanation.append("Emotional language detected (score: ")
                    .append(emotionalScore)
                    .append("). ");
        }

        if (biasScore > 0) {
            explanation.append("Bias indicators detected (score: ")
                    .append(biasScore)
                    .append("). ");
        }

        if (emotionalScore == 0 && biasScore == 0) {
            explanation.append("No strong emotional or biased language detected.");
        }

        lastExplanation = explanation.toString();
        return score;
    }
}