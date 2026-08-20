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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

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
    // Get current logged-in user
    // ================================
    private User getCurrentUserOrThrow() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new RuntimeException("Unauthorized: Please login again");
        }

        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    // ================================
    // GET /api/history/my-analyses
    // ================================
    @GetMapping("/my-analyses")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getMyAnalyses() {
        try {
            User user = getCurrentUserOrThrow();

            List<ImageAnalysis> analyses =
                    imageAnalysisRepository.findByUserOrderByIdDesc(user);

            // Convert to safe response maps (avoid lazy/json issues)
            List<Map<String, Object>> response = new ArrayList<>();
            for (ImageAnalysis a : analyses) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", a.getId());
                item.put("filename", a.getFilename());
                item.put("fileSize", a.getFileSize());
                item.put("imageType", a.getImageType());
                item.put("status", a.getStatus() != null ? a.getStatus().name() : "SUSPICIOUS");
                item.put("credibilityScore", a.getCredibilityScore());
                item.put("visualScore", a.getVisualScore());
                item.put("metadataScore", a.getMetadataScore());
                item.put("textAnalysisScore", a.getTextAnalysisScore());
                item.put("ocrScore", a.getOcrScore());
                item.put("processingTimeMs", a.getProcessingTimeMs());
                item.put("createdAt", a.getCreatedAt());
                item.put("uploadedAt", a.getCreatedAt());
                item.put("extractedText", a.getExtractedText());
                item.put("explanation", a.getExplanation());
                response.add(item);
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage() != null ? e.getMessage() : "Internal Server Error");
            return ResponseEntity.internalServerError().body(error);
        }
    }

    // ================================
    // GET /api/history/my-stats
    // ================================
    @GetMapping("/my-stats")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getMyStats() {
        try {
            User user = getCurrentUserOrThrow();

            long total = imageAnalysisRepository.countByUser(user);
            long real = imageAnalysisRepository.countByUserAndStatus(user, NewsStatus.REAL);
            long fake = imageAnalysisRepository.countByUserAndStatus(user, NewsStatus.FAKE);
            long suspicious = imageAnalysisRepository.countByUserAndStatus(user, NewsStatus.SUSPICIOUS);

            Map<String, Object> stats = new LinkedHashMap<>();
            stats.put("total", total);
            stats.put("real", real);
            stats.put("fake", fake);
            stats.put("suspicious", suspicious);

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage() != null ? e.getMessage() : "Internal Server Error");
            return ResponseEntity.internalServerError().body(error);
        }
    }

    // ================================
    // DELETE /api/history/{id}
    // ================================
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteAnalysis(@PathVariable Long id) {
        try {
            User user = getCurrentUserOrThrow();

            ImageAnalysis analysis = imageAnalysisRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Analysis not found"));

            if (analysis.getUser() == null || analysis.getUser().getId() == null
                    || !analysis.getUser().getId().equals(user.getId())) {
                throw new RuntimeException("You can only delete your own analyses");
            }

            imageAnalysisRepository.delete(analysis);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Analysis deleted successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage() != null ? e.getMessage() : "Internal Server Error");
            return ResponseEntity.badRequest().body(error);
        }
    }
}