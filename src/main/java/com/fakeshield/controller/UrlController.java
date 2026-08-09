package com.fakeshield.controller;

import com.fakeshield.model.News;
import com.fakeshield.service.UrlAnalyzerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/url")
@CrossOrigin(origins = "*")
public class UrlController {

    @Autowired
    private UrlAnalyzerService urlAnalyzerService;

    // POST: Analyze URL
    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeUrl(@RequestBody Map<String, String> request) {
        try {
            String url = request.get("url");

            if (url == null || url.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "URL is required"));
            }

            // Validate URL format
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                url = "https://" + url;
            }

            News analyzed = urlAnalyzerService.analyzeUrl(url);
            return ResponseEntity.ok(buildResponse(analyzed));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Failed to analyze URL",
                            "details", e.getMessage()
                    ));
        }
    }

    private Map<String, Object> buildResponse(News news) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", news.getId());
        response.put("title", news.getTitle());
        response.put("content", news.getContent());
        response.put("sourceUrl", news.getSourceUrl());
        response.put("author", news.getAuthor());
        response.put("platform", news.getPlatform());
        response.put("credibilityScore",
                Math.round(news.getCredibilityScore() * 10.0) / 10.0);
        response.put("status", news.getStatus().name());
        response.put("statusDisplay", news.getStatus().getDisplayName());
        response.put("statusColor", news.getStatus().getColorCode());
        response.put("submittedAt", news.getSubmittedAt().toString());

        if (news.getAnalysisResult() != null) {
            var ar = news.getAnalysisResult();
            Map<String, Object> details = new HashMap<>();
            details.put("mlScore", ar.getMlScore());
            details.put("nlpScore", ar.getNlpScore());
            details.put("sourceScore", ar.getSourceCredibilityScore());
            details.put("clickbaitScore", ar.getClickbaitScore());
            details.put("grammarScore", ar.getGrammarScore());
            details.put("sentimentScore", ar.getSentimentScore());
            details.put("factCheckScore", ar.getFactCheckScore());
            details.put("explanation",
                    ar.getExplanation() != null ? ar.getExplanation() : "");
            response.put("analysisDetails", details);
        }

        return response;
    }
}