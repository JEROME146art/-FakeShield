package com.fakeshield.controller;

import com.fakeshield.model.News;
import com.fakeshield.model.NewsStatus;
import com.fakeshield.service.NewsAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = "*")
public class NewsController {

    @Autowired
    private NewsAnalysisService newsAnalysisService;

    // ================================
    // POST: Analyze News (WITH LANGUAGE SUPPORT!)
    // ================================
    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeNews(@RequestBody NewsRequest request) {
        try {
            if (request.getTitle() == null || request.getTitle().isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of("error", "Title is required"));
            }

            // Builder Pattern (OOP)
            News news = new News.Builder()
                    .title(request.getTitle())
                    .content(request.getContent())
                    .sourceUrl(request.getSourceUrl())
                    .platform(request.getPlatform())
                    .author(request.getAuthor())
                    .build();

            // Use language-aware analysis!
            News analyzedNews = newsAnalysisService.analyzeNewsWithLanguage(news);
            return ResponseEntity.ok(buildResponse(analyzedNews));

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Analysis failed: " + e.getMessage()));
        }
    }

    // ================================
    // GET: Get News by ID
    // ================================
    @GetMapping("/{id}")
    public ResponseEntity<?> getNewsById(@PathVariable Long id) {
        Optional<News> news = newsAnalysisService.getNewsById(id);

        if (news.isPresent()) {
            return ResponseEntity.ok(buildResponse(news.get()));
        }

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "News not found with id: " + id));
    }

    // ================================
    // GET: Get All News
    // ================================
    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllNews() {
        List<News> newsList = newsAnalysisService.getAllNews();
        List<Map<String, Object>> response = new ArrayList<>();

        for (News news : newsList) {
            response.add(buildResponse(news));
        }

        return ResponseEntity.ok(response);
    }

    // ================================
    // GET: Get News by Status
    // ================================
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getNewsByStatus(@PathVariable String status) {
        try {
            NewsStatus newsStatus = NewsStatus.valueOf(status.toUpperCase());
            List<News> newsList = newsAnalysisService.getNewsByStatus(newsStatus);

            List<Map<String, Object>> response = new ArrayList<>();
            for (News news : newsList) {
                response.add(buildResponse(news));
            }

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error",
                            "Invalid status. Use: REAL, FAKE, SUSPICIOUS, UNVERIFIED"));
        }
    }

    // ================================
    // GET: Search News
    // ================================
    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> searchNews(
            @RequestParam String keyword) {

        List<News> newsList = newsAnalysisService.searchNews(keyword);
        List<Map<String, Object>> response = new ArrayList<>();

        for (News news : newsList) {
            response.add(buildResponse(news));
        }

        return ResponseEntity.ok(response);
    }

    // ================================
    // GET: Statistics
    // ================================
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Long>> getStatistics() {
        return ResponseEntity.ok(newsAnalysisService.getStatistics());
    }

    // ================================
    // DELETE: Delete News
    // ================================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNews(@PathVariable Long id) {
        Optional<News> news = newsAnalysisService.getNewsById(id);

        if (news.isPresent()) {
            newsAnalysisService.deleteNews(id);
            return ResponseEntity.ok(Map.of(
                    "message", "News deleted successfully"));
        }

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "News not found with id: " + id));
    }

    // ================================
    // Build Response Map
    // ================================
    private Map<String, Object> buildResponse(News news) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", news.getId());
        response.put("title", news.getTitle());
        response.put("content", news.getContent());
        response.put("sourceUrl", news.getSourceUrl());
        response.put("platform", news.getPlatform() != null ?
                news.getPlatform() : "Unknown");
        response.put("author", news.getAuthor());
        response.put("credibilityScore",
                Math.round(news.getCredibilityScore() * 10.0) / 10.0);
        response.put("status", news.getStatus().name());
        response.put("statusDisplay", news.getStatus().getDisplayName());
        response.put("statusColor", news.getStatus().getColorCode());
        response.put("submittedAt", news.getSubmittedAt().toString());
        response.put("viralCount", news.getViralCount());

        if (news.getAnalysisResult() != null) {
            var ar = news.getAnalysisResult();
            Map<String, Object> analysisDetails = new HashMap<>();
            analysisDetails.put("mlScore", ar.getMlScore());
            analysisDetails.put("nlpScore", ar.getNlpScore());
            analysisDetails.put("sourceScore", ar.getSourceCredibilityScore());
            analysisDetails.put("clickbaitScore", ar.getClickbaitScore());
            analysisDetails.put("grammarScore", ar.getGrammarScore());
            analysisDetails.put("sentimentScore", ar.getSentimentScore());
            analysisDetails.put("factCheckScore", ar.getFactCheckScore());
            analysisDetails.put("overallScore", ar.getOverallScore());
            analysisDetails.put("scoreBreakdown", ar.getScoreBreakdown());
            analysisDetails.put("explanation",
                    ar.getExplanation() != null ? ar.getExplanation() : "");
            analysisDetails.put("processingMs", ar.getProcessingTimeMs());
            response.put("analysisDetails", analysisDetails);
        }

        return response;
    }

    // ================================
    // Inner Request Class
    // ================================
    public static class NewsRequest {
        private String title;
        private String content;
        private String sourceUrl;
        private String platform;
        private String author;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }

        public String getSourceUrl() { return sourceUrl; }
        public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }

        public String getPlatform() { return platform; }
        public void setPlatform(String platform) { this.platform = platform; }

        public String getAuthor() { return author; }
        public void setAuthor(String author) { this.author = author; }
    }
}