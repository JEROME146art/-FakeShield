package com.fakeshield.service;

import com.fakeshield.model.AnalysisResult;
import com.fakeshield.model.News;
import com.fakeshield.model.NewsStatus;
import com.fakeshield.repository.NewsRepository;
import com.fakeshield.service.detection.BaseDetector;
import com.fakeshield.service.detection.ClickbaitDetector;
import com.fakeshield.service.detection.GrammarChecker;
import com.fakeshield.service.detection.SentimentAnalyzer;
import com.fakeshield.service.detection.SourceCredibilityChecker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class NewsAnalysisService {

    @Autowired
    private NewsRepository newsRepository;

    // OOP: Polymorphism
    // List of BaseDetector (parent type)
    // holds all different detector objects
    private List<BaseDetector> detectors;

    // ================================
    // Initialize all detectors
    // ================================
    @Autowired
    public void initDetectors() {
        detectors = new ArrayList<>();
        detectors.add(new ClickbaitDetector());
        detectors.add(new SentimentAnalyzer());
        detectors.add(new SourceCredibilityChecker());
        detectors.add(new GrammarChecker());
    }

    // ================================
    // MAIN METHOD - Analyze News
    // ================================
    public News analyzeNews(News news) {
        long startTime = System.currentTimeMillis();

        AnalysisResult result = new AnalysisResult();
        Map<String, Double> scores = new HashMap<>();
        StringBuilder explanations = new StringBuilder();

        // OOP: Polymorphism
        // Each detector has DIFFERENT implementation
        // but we call the SAME method analyze()
        for (BaseDetector detector : detectors) {
            double score = detector.analyze(news);
            scores.put(detector.getStrategyName(), score);

            String explanation = detector.getExplanation();
            if (explanation != null && !explanation.isEmpty()) {
                explanations.append("• ")
                        .append(detector.getStrategyName())
                        .append(": ")
                        .append(explanation)
                        .append("\n");
            }
        }

        // Set individual scores into result
        result.setClickbaitScore(
                scores.getOrDefault("Clickbait Detector", 50.0));
        result.setSentimentScore(
                scores.getOrDefault("Sentiment Analyzer", 50.0));
        result.setSourceCredibilityScore(
                scores.getOrDefault("Source Credibility Checker", 50.0));
        result.setGrammarScore(
                scores.getOrDefault("Grammar Checker", 50.0));

        // Calculate additional scores
        result.setNlpScore(calculateNLPScore(news));
        result.setMlScore(calculateMLFallbackScore(news));
        result.setFactCheckScore(calculateFactCheckScore(news));

        // Calculate overall weighted score
        double overallScore = result.calculateOverallScore();

        // Set explanation
        result.setExplanation(explanations.toString());

        // Set processing time
        long processingTime = System.currentTimeMillis() - startTime;
        result.setProcessingTimeMs(processingTime);

        // Determine status based on score
        NewsStatus status = determineStatus(overallScore);

        // Set everything into news object
        news.setStatus(status);
        news.setCredibilityScore(overallScore);
        news.setAnalysisResult(result);

        // Save to database
        News savedNews = newsRepository.save(news);

        // Print to console
        System.out.println("================================");
        System.out.println("✅ News Analyzed!");
        System.out.println("Title  : " + savedNews.getTitle());
        System.out.println("Score  : " + overallScore);
        System.out.println("Status : " + status);
        System.out.println("Time   : " + processingTime + "ms");
        System.out.println("================================");

        return savedNews;
    }

    // ================================
    // Determine Status from Score
    // ================================
    private NewsStatus determineStatus(double score) {
        if (score >= 70) return NewsStatus.REAL;
        if (score >= 45) return NewsStatus.SUSPICIOUS;
        return NewsStatus.FAKE;
    }

    // ================================
    // NLP Score Calculation
    // ================================
    private double calculateNLPScore(News news) {
        double score = 70.0;

        String content = news.getContent();
        if (content == null || content.isEmpty()) return 30.0;

        String[] words = content.split("\\s+");

        // More words = more detailed = more credible
        if (words.length > 200) score += 15;
        else if (words.length > 100) score += 10;
        else if (words.length < 30) score -= 20;

        // Has quotes = journalism style
        if (content.contains("\"")) score += 5;

        // Has numbers or data
        if (content.matches(".*\\d+.*")) score += 5;

        return Math.min(100, Math.max(0, score));
    }

    // ================================
    // ML Fallback Score Calculation
    // ================================
    private double calculateMLFallbackScore(News news) {
        double score = 50.0;

        String text = ((news.getTitle() != null ? news.getTitle() : "")
                + " "
                + (news.getContent() != null ? news.getContent() : ""))
                .toLowerCase();

        // Real news indicators
        String[] realIndicators = {
                "according to",
                "study shows",
                "researchers found",
                "official statement",
                "confirmed",
                "verified",
                "reports indicate",
                "sources say",
                "announced",
                "published in",
                "data shows",
                "statistics"
        };

        // Fake news indicators
        String[] fakeIndicators = {
                "conspiracy",
                "hoax",
                "they are hiding",
                "wake up",
                "share before deleted",
                "banned video",
                "what they don't tell you",
                "secret cure",
                "miracle cure",
                "fake news media"
        };

        for (String indicator : realIndicators) {
            if (text.contains(indicator)) score += 6;
        }

        for (String indicator : fakeIndicators) {
            if (text.contains(indicator)) score -= 10;
        }

        return Math.min(100, Math.max(0, score));
    }

    // ================================
    // Fact Check Score Calculation
    // ================================
    private double calculateFactCheckScore(News news) {
        double score = 60.0;

        String text = ((news.getTitle() != null ? news.getTitle() : "")
                + " "
                + (news.getContent() != null ? news.getContent() : ""))
                .toLowerCase();

        if (text.matches(".*\\d+%.*")) score += 5;
        if (text.contains("according to")) score += 10;
        if (text.contains("study") && text.contains("shows")) score += 8;
        if (text.contains("reuters") || text.contains("associated press")) {
            score += 15;
        }

        return Math.min(100, score);
    }

    // ================================
    // CRUD Methods
    // ================================
    public List<News> getAllNews() {
        return newsRepository.findLatestNews();
    }

    public Optional<News> getNewsById(Long id) {
        return newsRepository.findById(id);
    }

    public List<News> getNewsByStatus(NewsStatus status) {
        return newsRepository.findByStatus(status);
    }

    public List<News> searchNews(String keyword) {
        return newsRepository.searchByKeyword(keyword);
    }

    public void deleteNews(Long id) {
        newsRepository.deleteById(id);
    }

    public Map<String, Long> getStatistics() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", newsRepository.count());
        stats.put("fake", newsRepository.countByStatus(NewsStatus.FAKE));
        stats.put("real", newsRepository.countByStatus(NewsStatus.REAL));
        stats.put("suspicious",
                newsRepository.countByStatus(NewsStatus.SUSPICIOUS));
        stats.put("unverified",
                newsRepository.countByStatus(NewsStatus.UNVERIFIED));
        return stats;
    }
}