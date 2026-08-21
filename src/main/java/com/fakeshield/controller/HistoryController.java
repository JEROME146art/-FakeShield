package com.fakeshield.controller;

import com.fakeshield.model.ImageAnalysis;
import com.fakeshield.model.NewsStatus;
import com.fakeshield.model.User;
import com.fakeshield.repository.ImageAnalysisRepository;
import com.fakeshield.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.PrintWriter;
import java.io.StringWriter;
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

    // ================================
    // Get Current Authenticated User
    // ================================
    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(String.valueOf(auth.getPrincipal()))) {
            throw new RuntimeException("Unauthorized: Please log in again");
        }
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username)
                        .orElseThrow(() -> new RuntimeException("User account not found: " + username)));
    }

    // ================================
    // Null-Safe DTO Mapping
    // ================================
    private Map<String, Object> convertToMap(ImageAnalysis a) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", a.getId());
        map.put("filename", a.getFilename() != null ? a.getFilename() : "Unknown");
        map.put("fileSize", a.getFileSize() != null ? a.getFileSize() : 0L);
        map.put("imageType", a.getImageType() != null ? a.getImageType() : "image/jpeg");

        // Null-safe status
        String statusStr = "SUSPICIOUS";
        if (a.getStatus() != null) {
            statusStr = a.getStatus().name();
        }
        map.put("status", statusStr);

        // Null-safe scores
        map.put("credibilityScore", a.getCredibilityScore() != null ? a.getCredibilityScore() : 0.0);
        map.put("visualScore", a.getVisualScore() != null ? a.getVisualScore() : 0.0);
        map.put("metadataScore", a.getMetadataScore() != null ? a.getMetadataScore() : 0.0);
        map.put("textAnalysisScore", a.getTextAnalysisScore() != null ? a.getTextAnalysisScore() : 0.0);
        map.put("ocrScore", a.getOcrScore() != null ? a.getOcrScore() : 0.0);

        map.put("processingTimeMs", a.getProcessingTimeMs() != null ? a.getProcessingTimeMs() : 0L);

        LocalDateTime created = a.getCreatedAt() != null ? a.getCreatedAt() : LocalDateTime.now();
        map.put("createdAt", created);
        map.put("uploadedAt", created);
        map.put("extractedText", a.getExtractedText() != null ? a.getExtractedText() : "");
        map.put("explanation", a.getExplanation() != null ? a.getExplanation() : "");
        return map;
    }

    // ================================
    // GET /api/history/my-stats
    // ================================
    @GetMapping("/my-stats")
    public ResponseEntity<?> getMyStats() {
        try {
            User user = getAuthenticatedUser();
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

        } catch (Throwable t) {
            t.printStackTrace();
            return buildErrorResponse(t);
        }
    }

    // ================================
    // GET /api/history/my-analyses
    // ================================
    @GetMapping("/my-analyses")
    public ResponseEntity<?> getMyAnalyses() {
        try {
            User user = getAuthenticatedUser();
            Long userId = user.getId();

            List<ImageAnalysis> list = imageAnalysisRepository.findByUserIdOrderByIdDesc(userId);
            if (list == null) {
                list = Collections.emptyList();
            }

            List<Map<String, Object>> result = new ArrayList<>();
            for (ImageAnalysis a : list) {
                if (a != null) {
                    result.add(convertToMap(a));
                }
            }

            return ResponseEntity.ok(result);

        } catch (Throwable t) {
            t.printStackTrace();
            return buildErrorResponse(t);
        }
    }

    // ================================
    // DELETE /api/history/{id}
    // ================================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAnalysis(@PathVariable Long id) {
        try {
            User user = getAuthenticatedUser();

            ImageAnalysis analysis = imageAnalysisRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Analysis record not found with id: " + id));

            if (analysis.getUser() == null || !user.getId().equals(analysis.getUser().getId())) {
                throw new RuntimeException("Unauthorized: You do not own this analysis record");
            }

            imageAnalysisRepository.delete(analysis);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Analysis deleted successfully");
            return ResponseEntity.ok(response);

        } catch (Throwable t) {
            t.printStackTrace();
            return buildErrorResponse(t);
        }
    }

    private long safeLong(Long val) {
        return val != null ? val : 0L;
    }

    private ResponseEntity<Map<String, Object>> buildErrorResponse(Throwable t) {
        Map<String, Object> err = new LinkedHashMap<>();
        String msg = t.getMessage();
        if (msg == null || msg.trim().isEmpty()) {
            msg = t.getClass().getSimpleName();
        }
        err.put("error", msg);
        err.put("exception", t.getClass().getName());

        StringWriter sw = new StringWriter();
        t.printStackTrace(new PrintWriter(sw));
        String stackTrace = sw.toString();
        err.put("details", stackTrace.length() > 300 ? stackTrace.substring(0, 300) + "..." : stackTrace);

        return ResponseEntity.internalServerError().body(err);
    }
}