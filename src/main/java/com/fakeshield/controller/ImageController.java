package com.fakeshield.controller;

import com.fakeshield.model.ImageAnalysis;
import com.fakeshield.service.ImageAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "*")
public class ImageController {

    @Autowired
    private ImageAnalysisService imageAnalysisService;

    // ================================
    // Analyze uploaded image
    // ================================
    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeImage(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Please select a file to upload");
                return ResponseEntity.badRequest().body(error);
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "File must be an image");
                return ResponseEntity.badRequest().body(error);
            }

            ImageAnalysis analysis = imageAnalysisService.analyzeImage(file);
            return ResponseEntity.ok(analysis);

        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Analysis failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    // ================================
    // Get all analyzed images
    // ================================
    @GetMapping
    public ResponseEntity<List<ImageAnalysis>> getAllImages() {
        return ResponseEntity.ok(imageAnalysisService.getAllImages());
    }

    // ================================
    // Get image by ID
    // ================================
    @GetMapping("/{id}")
    public ResponseEntity<?> getImageById(@PathVariable Long id) {
        Optional<ImageAnalysis> analysis = imageAnalysisService.getImageById(id);

        if (analysis.isPresent()) {
            return ResponseEntity.ok(analysis.get());
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Image not found");
            return ResponseEntity.notFound().build();
        }
    }

    // ================================
    // Get statistics
    // ================================
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Long>> getStatistics() {
        return ResponseEntity.ok(imageAnalysisService.getImageStatistics());
    }

    // ================================
    // Delete image analysis
    // ================================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteImage(@PathVariable Long id) {
        try {
            imageAnalysisService.deleteImage(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Image deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}