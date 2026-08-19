package com.fakeshield.controller;

import com.fakeshield.model.ImageAnalysis;
import com.fakeshield.model.NewsStatus;
import com.fakeshield.model.User;
import com.fakeshield.repository.ImageAnalysisRepository;
import com.fakeshield.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/history")
@CrossOrigin(origins = "*")
public class HistoryController {

    @Autowired
    private ImageAnalysisRepository imageAnalysisRepository;

    @Autowired
    private UserService userService;

    // Get logged-in user's analysis history
    @GetMapping("/my-analyses")
    public ResponseEntity<?> getMyAnalyses() {
        try {
            User user = userService.getCurrentUser();
            List<ImageAnalysis> analyses = imageAnalysisRepository.findByUserOrderByIdDesc(user);
            return ResponseEntity.ok(analyses);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Get user's statistics
    @GetMapping("/my-stats")
    public ResponseEntity<?> getMyStats() {
        try {
            User user = userService.getCurrentUser();

            Map<String, Object> stats = new HashMap<>();
            stats.put("total", imageAnalysisRepository.countByUser(user));
            stats.put("real", imageAnalysisRepository.countByUserAndStatus(user, NewsStatus.REAL));
            stats.put("fake", imageAnalysisRepository.countByUserAndStatus(user, NewsStatus.FAKE));
            stats.put("suspicious", imageAnalysisRepository.countByUserAndStatus(user, NewsStatus.SUSPICIOUS));

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Delete an analysis (only owner can delete)
    @DeleteMapping("/{analysisId}")
    public ResponseEntity<?> deleteAnalysis(@PathVariable Long analysisId) {
        try {
            User user = userService.getCurrentUser();

            ImageAnalysis analysis = imageAnalysisRepository.findById(analysisId)
                    .orElseThrow(() -> new RuntimeException("Analysis not found"));

            // Check ownership
            if (analysis.getUser() == null || !analysis.getUser().getId().equals(user.getId())) {
                throw new RuntimeException("You can only delete your own analyses");
            }

            imageAnalysisRepository.delete(analysis);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Analysis deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}