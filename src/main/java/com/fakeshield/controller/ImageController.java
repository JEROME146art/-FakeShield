package com.fakeshield.controller;

import com.fakeshield.model.ImageAnalysis;
import com.fakeshield.service.ImageAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
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
    // POST: Upload and Analyze Image
    // URL: POST /api/images/analyze
    // ================================
    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeImage(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Please select an image file"));
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Only image files are allowed"));
            }

            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "File size must be less than 10MB"));
            }

            ImageAnalysis analysis = imageAnalysisService.analyzeImage(file);
            return ResponseEntity.ok(buildResponse(analysis));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Analysis failed: " + e.getMessage()));
        }
    }

    // ================================
    // GET: All Images
    // ================================
    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllImages() {
        List<ImageAnalysis> images = imageAnalysisService.getAllImages();
        List<Map<String, Object>> response = new ArrayList<>();
        for (ImageAnalysis image : images) {
            response.add(buildResponse(image));
        }
        return ResponseEntity.ok(response);
    }

    // ================================
    // GET: Image by ID
    // ================================
    @GetMapping("/{id}")
    public ResponseEntity<?> getImageById(@PathVariable Long id) {
        Optional<ImageAnalysis> image = imageAnalysisService.getImageById(id);
        if (image.isPresent()) {
            return ResponseEntity.ok(buildResponse(image.get()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Image not found"));
    }

    // ================================
    // GET: Statistics
    // ================================
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Long>> getStatistics() {
        return ResponseEntity.ok(imageAnalysisService.getImageStatistics());
    }

    // ================================
    // DELETE: Delete Image
    // ================================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteImage(@PathVariable Long id) {
        Optional<ImageAnalysis> image = imageAnalysisService.getImageById(id);
        if (image.isPresent()) {
            imageAnalysisService.deleteImage(id);
            return ResponseEntity.ok(Map.of("message", "Image deleted"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Image not found"));
    }

    // ================================
    // Build Response
    // ================================
    private Map<String, Object> buildResponse(ImageAnalysis analysis) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", analysis.getId());
        response.put("filename", analysis.getFilename());
        response.put("fileSize", analysis.getFileSize());
        response.put("imageType", analysis.getImageType());
        response.put("extractedText", analysis.getExtractedText());
        response.put("credibilityScore",
                Math.round(analysis.getCredibilityScore() * 10.0) / 10.0);
        response.put("status", analysis.getStatus().name());
        response.put("statusDisplay", analysis.getStatus().getDisplayName());
        response.put("statusColor", analysis.getStatus().getColorCode());
        response.put("textScore", analysis.getTextAnalysisScore());
        response.put("metadataScore", analysis.getMetadataScore());
        response.put("visualScore", analysis.getVisualScore());
        response.put("ocrScore", analysis.getOcrScore());
        response.put("explanation", analysis.getExplanation());
        response.put("uploadedAt", analysis.getUploadedAt().toString());
        response.put("processingMs", analysis.getProcessingTimeMs());
        return response;
    }
}