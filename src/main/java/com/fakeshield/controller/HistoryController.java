package com.fakeshield.controller;

import com.fakeshield.model.ImageAnalysis;
import com.fakeshield.model.NewsStatus;
import com.fakeshield.model.User;
import com.fakeshield.repository.ImageAnalysisRepository;
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
                Map<String, String> err = new HashMap<>();
                err.put("error", "Session expired or user not found. Please log in again.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
            }

            Long userId = user.getId();
            long total = safeLong(imageAnalysisRepository.countByUserId(userId));
            long real = safeLong(imageAnalysisRepository.countByUserIdAndStatus(userId, NewsStatus.REAL));
            long fake = safeLong(imageAnalysisRepository.countByUserIdAndStatus(userId, NewsStatus.FAKE));
            long suspicious = safeLong(imageAnalysisRepository.countByUserIdAndStatus(userId, NewsStatus.SUSPICIOUS));

            Map<String, Object> stats = new LinkedHashMap<>();
            stats.put("total", total);
            stats.put("real", real);
            stats.put("fake", fake);
            stats.put("suspicious", suspicious);
            stats.put("username", user.getUsername());
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
            if (user == null) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Session expired or user not found. Please log in again.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
            }

            Long userId = user.getId();
            List<ImageAnalysis> list = imageAnalysisRepository.findByUserIdOrderByIdDesc(userId);
            if (list == null) list = Collections.emptyList();

            List<Map<String, Object>> result = new ArrayList<>();
            for (ImageAnalysis a : list) {
                if (a != null) {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", a.getId());
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
                    m.put("createdAt", created);
                    m.put("uploadedAt", created);
                    m.put("extractedText", a.getExtractedText() != null ? a.getExtractedText() : "");
                    m.put("explanation", a.getExplanation() != null ? a.getExplanation() : "");
                    result.add(m);
                }
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage() != null ? e.getMessage() : "Error loading history");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAnalysis(@PathVariable Long id) {
        try {
            User user = getAuthenticatedUser();
            if (user == null) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Unauthorized");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
            }

            ImageAnalysis analysis = imageAnalysisRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Analysis record not found: " + id));

            if (analysis.getUser() == null || !user.getId().equals(analysis.getUser().getId())) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "You do not own this record");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(err);
            }

            imageAnalysisRepository.delete(analysis);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Analysis deleted successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }
    }

    private long safeLong(Long val) {
        return val != null ? val : 0L;
    }
}