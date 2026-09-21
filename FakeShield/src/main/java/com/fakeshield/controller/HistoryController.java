package com.fakeshield.controller;

import com.fakeshield.model.ImageAnalysis;
import com.fakeshield.model.News;
import com.fakeshield.model.NewsStatus;
import com.fakeshield.model.User;
import com.fakeshield.repository.ImageAnalysisRepository;
import com.fakeshield.repository.NewsRepository;
import com.fakeshield.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/history")
@CrossOrigin(origins = "*")
public class HistoryController {

    @Autowired
    private ImageAnalysisRepository imageAnalysisRepository;

    @Autowired
    private NewsRepository newsRepository;

    @Autowired
    private UserRepository userRepository;

    // Returns authenticated user or null if missing/invalid session
    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(String.valueOf(auth.getPrincipal()))) {
            return null;
        }
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username).orElse(null));
    }

    @GetMapping("/my-stats")
    public ResponseEntity<?> getMyStats() {
        try {
            User user = getAuthenticatedUser();
            if (user == null) {
                // Return guest / public summary if not logged in
                long totalImg = safeLong(imageAnalysisRepository.count());
                long totalNews = safeLong(newsRepository.count());
                long real = safeLong(imageAnalysisRepository.countByStatus(NewsStatus.REAL)) + safeLong(newsRepository.countByStatus(NewsStatus.REAL));
                long fake = safeLong(imageAnalysisRepository.countByStatus(NewsStatus.FAKE)) + safeLong(newsRepository.countByStatus(NewsStatus.FAKE));
                long suspicious = safeLong(imageAnalysisRepository.countByStatus(NewsStatus.SUSPICIOUS)) + safeLong(newsRepository.countByStatus(NewsStatus.SUSPICIOUS));

                Map<String, Object> stats = new LinkedHashMap<>();
                stats.put("total", totalImg + totalNews);
                stats.put("real", real);
                stats.put("fake", fake);
                stats.put("suspicious", suspicious);
                stats.put("username", "Guest");
                stats.put("isGuest", true);
                return ResponseEntity.ok(stats);
            }

            Long userId = user.getId();
            long imgTotal = safeLong(imageAnalysisRepository.countByUserId(userId));
            long newsTotal = safeLong(newsRepository.countByUserId(userId));

            long real = safeLong(imageAnalysisRepository.countByUserIdAndStatus(userId, NewsStatus.REAL))
                    + safeLong(newsRepository.countByUserIdAndStatus(userId, NewsStatus.REAL));
            long fake = safeLong(imageAnalysisRepository.countByUserIdAndStatus(userId, NewsStatus.FAKE))
                    + safeLong(newsRepository.countByUserIdAndStatus(userId, NewsStatus.FAKE));
            long suspicious = safeLong(imageAnalysisRepository.countByUserIdAndStatus(userId, NewsStatus.SUSPICIOUS))
                    + safeLong(newsRepository.countByUserIdAndStatus(userId, NewsStatus.SUSPICIOUS));

            Map<String, Object> stats = new LinkedHashMap<>();
            stats.put("total", imgTotal + newsTotal);
            stats.put("real", real);
            stats.put("fake", fake);
            stats.put("suspicious", suspicious);
            stats.put("username", user.getUsername());
            stats.put("isGuest", false);
            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage() != null ? e.getMessage() : "Error loading stats");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    @GetMapping("/my-analyses")
    public ResponseEntity<?> getMyAnalyses() {
        try {
            User user = getAuthenticatedUser();
            List<Map<String, Object>> result = new ArrayList<>();

            if (user == null) {
                // For guest users, return the latest public analyses (images + news)
                List<ImageAnalysis> imgList = imageAnalysisRepository.findLatestImages();
                List<News> newsList = newsRepository.findLatestNews();

                populateAnalyses(result, imgList, newsList);
                return ResponseEntity.ok(result);
            }

            Long userId = user.getId();
            List<ImageAnalysis> imgList = imageAnalysisRepository.findByUserIdOrderByIdDesc(userId);
            List<News> newsList = newsRepository.findByUserIdOrderByIdDesc(userId);

            populateAnalyses(result, imgList, newsList);

            // Sort all by timestamp descending
            result.sort((a, b) -> {
                String da = String.valueOf(a.get("createdAt"));
                String db = String.valueOf(b.get("createdAt"));
                return db.compareTo(da);
            });

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage() != null ? e.getMessage() : "Error loading history");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    private void populateAnalyses(List<Map<String, Object>> result, List<ImageAnalysis> imgList, List<News> newsList) {
        if (imgList != null) {
            for (ImageAnalysis a : imgList) {
                if (a != null) {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", a.getId());
                    m.put("type", "image");
                    m.put("title", a.getFilename() != null ? a.getFilename() : "Uploaded Image");
                    m.put("filename", a.getFilename() != null ? a.getFilename() : "Unknown");
                    m.put("fileSize", a.getFileSize() != null ? a.getFileSize() : 0L);
                    m.put("imageType", a.getImageType() != null ? a.getImageType() : "image/jpeg");
                    m.put("status", a.getStatus() != null ? a.getStatus().name() : "SUSPICIOUS");
                    m.put("credibilityScore", a.getCredibilityScore() != null ? a.getCredibilityScore() : 0.0);
                    m.put("visualScore", a.getVisualScore() != null ? a.getVisualScore() : 0.0);
                    m.put("metadataScore", a.getMetadataScore() != null ? a.getMetadataScore() : 0.0);
                    m.put("textAnalysisScore", a.getTextAnalysisScore() != null ? a.getTextAnalysisScore() : 0.0);
                    m.put("ocrScore", a.getOcrScore() != null ? a.getOcrScore() : 0.0);
                    m.put("processingTimeMs", a.getProcessingTimeMs() != null ? a.getProcessingTimeMs() : 0L);
                    LocalDateTime created = a.getCreatedAt() != null ? a.getCreatedAt() : LocalDateTime.now();
                    m.put("createdAt", created.toString());
                    m.put("uploadedAt", created.toString());
                    m.put("extractedText", a.getExtractedText() != null ? a.getExtractedText() : "");
                    m.put("explanation", a.getExplanation() != null ? a.getExplanation() : "");
                    result.add(m);
                }
            }
        }

        if (newsList != null) {
            for (News n : newsList) {
                if (n != null) {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", n.getId());
                    boolean isUrl = n.getSourceUrl() != null && !n.getSourceUrl().isBlank();
                    m.put("type", isUrl ? "url" : "text");
                    m.put("title", n.getTitle() != null ? n.getTitle() : "Untitled News");
                    m.put("content", n.getContent() != null ? n.getContent() : "");
                    m.put("sourceUrl", n.getSourceUrl());
                    m.put("platform", n.getPlatform() != null ? n.getPlatform() : "General");
                    m.put("status", n.getStatus() != null ? n.getStatus().name() : "SUSPICIOUS");
                    m.put("credibilityScore", n.getCredibilityScore());
                    m.put("createdAt", n.getSubmittedAt() != null ? n.getSubmittedAt().toString() : LocalDateTime.now().toString());

                    if (n.getAnalysisResult() != null) {
                        m.put("explanation", n.getAnalysisResult().getExplanation());
                        m.put("clickbaitScore", n.getAnalysisResult().getClickbaitScore());
                        m.put("sentimentScore", n.getAnalysisResult().getSentimentScore());
                        m.put("sourceScore", n.getAnalysisResult().getSourceCredibilityScore());
                        m.put("grammarScore", n.getAnalysisResult().getGrammarScore());
                        m.put("processingTimeMs", n.getAnalysisResult().getProcessingTimeMs());
                    }
                    result.add(m);
                }
            }
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAnalysis(@PathVariable Long id, @RequestParam(required = false) String type) {
        try {
            User user = getAuthenticatedUser();

            if ("news".equalsIgnoreCase(type) || "text".equalsIgnoreCase(type) || "url".equalsIgnoreCase(type)) {
                Optional<News> newsOpt = newsRepository.findById(id);
                if (newsOpt.isPresent()) {
                    News news = newsOpt.get();
                    if (user != null && news.getSubmittedBy() != null && !user.getId().equals(news.getSubmittedBy().getId()) && user.getRole() != User.Role.ADMIN) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "You do not own this record"));
                    }
                    newsRepository.deleteById(id);
                    return ResponseEntity.ok(Map.of("message", "News analysis deleted successfully"));
                }
            }

            // Default or fallback to ImageAnalysis
            Optional<ImageAnalysis> imgOpt = imageAnalysisRepository.findById(id);
            if (imgOpt.isPresent()) {
                ImageAnalysis analysis = imgOpt.get();
                if (user != null && analysis.getUser() != null && !user.getId().equals(analysis.getUser().getId()) && user.getRole() != User.Role.ADMIN) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "You do not own this record"));
                }
                imageAnalysisRepository.delete(analysis);
                return ResponseEntity.ok(Map.of("message", "Image analysis deleted successfully"));
            }

            // Try deleting from news if not found in images
            if (newsRepository.existsById(id)) {
                newsRepository.deleteById(id);
                return ResponseEntity.ok(Map.of("message", "Record deleted successfully"));
            }

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Record not found"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    private long safeLong(Long val) {
        return val != null ? val : 0L;
    }
}