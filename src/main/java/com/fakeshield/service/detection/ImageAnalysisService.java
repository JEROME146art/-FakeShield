package com.fakeshield.service;

import com.fakeshield.model.ImageAnalysis;
import com.fakeshield.model.NewsStatus;
import com.fakeshield.repository.ImageAnalysisRepository;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ImageAnalysisService {

    private static final int MAX_DIMENSION = 800; // Resize to save memory
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    @Autowired
    private ImageAnalysisRepository imageAnalysisRepository;

    // Cache file bytes ONCE
    private byte[] cachedBytes;

    // ================================
    // Main Analysis Method
    // ================================
    public ImageAnalysis analyzeImage(MultipartFile file) throws Exception {
        long startTime = System.currentTimeMillis();

        // ✅ File size check
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File too large. Max 5MB allowed.");
        }

        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        ImageAnalysis analysis = new ImageAnalysis();
        analysis.setFilename(file.getOriginalFilename());
        analysis.setFileSize(file.getSize());
        analysis.setImageType(file.getContentType());

        StringBuilder explanation = new StringBuilder();

        // ✅ Read file bytes ONCE, cache it
        cachedBytes = file.getBytes();

        // ✅ Load + resize image ONCE
        BufferedImage resizedImage = loadAndResize();

        // ✅ Save resized image to temp file (much smaller than original)
        File tempFile = saveResizedToTemp(resizedImage);

        try {
            // Run all analyses using cached data
            double visualScore = analyzeVisual(resizedImage, explanation);
            double metadataScore = analyzeMetadata(file, explanation);
            String extractedText = extractTextFromImage(tempFile, explanation);
            analysis.setExtractedText(extractedText);
            double textScore = analyzeExtractedText(extractedText, explanation);
            double ocrScore = analyzeOCRQuality(extractedText, explanation);

            // Calculate overall score
            double overallScore = (visualScore * 0.20) +
                    (metadataScore * 0.20) +
                    (textScore * 0.35) +
                    (ocrScore * 0.25);

            analysis.setVisualScore(visualScore);
            analysis.setMetadataScore(metadataScore);
            analysis.setTextAnalysisScore(textScore);
            analysis.setOcrScore(ocrScore);
            analysis.setCredibilityScore(overallScore);
            analysis.setExplanation(explanation.toString());

            NewsStatus status = determineStatus(overallScore);
            analysis.setStatus(status);

            long processingTime = System.currentTimeMillis() - startTime;
            analysis.setProcessingTimeMs(processingTime);

            ImageAnalysis saved = imageAnalysisRepository.save(analysis);

            System.out.println("✅ Image Analyzed: " + saved.getFilename() +
                    " | Score: " + overallScore + " | Status: " + status +
                    " | Time: " + processingTime + "ms");

            return saved;

        } finally {
            // ✅ CRITICAL: Free memory
            if (tempFile != null && tempFile.exists()) {
                tempFile.delete();
            }
            if (resizedImage != null) {
                resizedImage.flush();
            }
            cachedBytes = null;
            System.gc(); // Suggest garbage collection
        }
    }

    // ================================
    // Load and Resize Image (MEMORY SAVER)
    // ================================
    private BufferedImage loadAndResize() throws Exception {
        BufferedImage original = ImageIO.read(new ByteArrayInputStream(cachedBytes));
        if (original == null) {
            throw new IllegalArgumentException("Invalid image file");
        }

        int width = original.getWidth();
        int height = original.getHeight();

        // If already small, return as-is
        if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
            return original;
        }

        // Calculate new dimensions
        double scale = Math.min(
                (double) MAX_DIMENSION / width,
                (double) MAX_DIMENSION / height
        );
        int newWidth = (int) (width * scale);
        int newHeight = (int) (height * scale);

        // Create resized image
        BufferedImage resized = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = resized.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION,
                RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.setRenderingHint(RenderingHints.KEY_RENDERING,
                RenderingHints.VALUE_RENDER_QUALITY);
        g.drawImage(original, 0, 0, newWidth, newHeight, null);
        g.dispose();

        // ✅ Free original image immediately
        original.flush();

        return resized;
    }

    // ================================
    // Save Resized Image to Temp File
    // ================================
    private File saveResizedToTemp(BufferedImage image) throws Exception {
        File tempFile = File.createTempFile("resized_", ".png");
        ImageIO.write(image, "png", tempFile);
        return tempFile;
    }

    // ================================
    // Extract Text using Tesseract OCR
    // ================================
    private String extractTextFromImage(File tempFile, StringBuilder explanation) {
        String extractedText = "";

        try {
            Tesseract tesseract = new Tesseract();

            // Try multiple common paths for tessdata
            String[] possiblePaths = {
                    "/usr/share/tesseract-ocr/4.00/tessdata",
                    "/usr/share/tesseract-ocr/5/tessdata",
                    "/usr/share/tesseract-ocr/tessdata",
                    "/usr/share/tessdata",
                    "/usr/local/share/tessdata",
                    "C:\\Program Files\\Tesseract-OCR\\tessdata",
                    "./tessdata"
            };

            boolean pathFound = false;
            for (String path : possiblePaths) {
                if (new File(path).exists()) {
                    tesseract.setDatapath(path);
                    pathFound = true;
                    break;
                }
            }

            if (!pathFound) {
                explanation.append("\n• OCR Extraction:\n");
                explanation.append("  - Tesseract data path not found\n");
                return "";
            }

            tesseract.setLanguage("eng");

            // ✅ Memory-friendly settings
            tesseract.setPageSegMode(3); // Automatic page segmentation
            tesseract.setOcrEngineMode(1); // Neural nets LSTM engine only

            extractedText = tesseract.doOCR(tempFile);
            extractedText = extractedText.trim();

            explanation.append("\n• OCR Extraction:\n");
            if (extractedText.isEmpty()) {
                explanation.append("  - No text detected in image\n");
            } else {
                explanation.append("  - Extracted ").append(extractedText.length()).append(" characters\n");
                explanation.append("  - Preview: \"")
                        .append(extractedText.length() > 100 ?
                                extractedText.substring(0, 100) + "..." : extractedText)
                        .append("\"\n");
            }

        } catch (TesseractException e) {
            explanation.append("\n• OCR Extraction:\n");
            explanation.append("  - OCR failed: ").append(e.getMessage()).append("\n");
            extractedText = "";
        } catch (Exception e) {
            explanation.append("\n• OCR Extraction:\n");
            explanation.append("  - Error: ").append(e.getMessage()).append("\n");
            extractedText = "";
        }

        return extractedText;
    }

    // ================================
    // Visual Analysis (uses cached image)
    // ================================
    private double analyzeVisual(BufferedImage image, StringBuilder explanation) {
        double score = 80.0;

        try {
            if (image == null) {
                explanation.append("• Visual: Cannot read image. ");
                return 20.0;
            }

            int width = image.getWidth();
            int height = image.getHeight();

            explanation.append("• Visual Analysis:\n");
            explanation.append("  - Dimensions: ").append(width).append("x").append(height).append("\n");

            if (width < 300 || height < 300) {
                score -= 20;
                explanation.append("  - WARNING: Small image size\n");
            } else {
                explanation.append("  - Good image size\n");
            }

            double aspectRatio = (double) width / height;
            if (aspectRatio > 4.0 || aspectRatio < 0.25) {
                score -= 15;
                explanation.append("  - WARNING: Unusual aspect ratio\n");
            }

            if (width * height > 1000000) {
                score += 10;
                explanation.append("  - Good resolution (HD)\n");
            }

        } catch (Exception e) {
            score = 30.0;
            explanation.append("  - ERROR: ").append(e.getMessage()).append("\n");
        }

        return Math.min(100, Math.max(0, score));
    }

    // ================================
    // Metadata Analysis
    // ================================
    private double analyzeMetadata(MultipartFile file, StringBuilder explanation) {
        double score = 70.0;

        explanation.append("\n• Metadata Analysis:\n");

        long fileSize = file.getSize();
        String contentType = file.getContentType();
        String filename = file.getOriginalFilename();

        explanation.append("  - File size: ").append(fileSize / 1024).append(" KB\n");
        explanation.append("  - Type: ").append(contentType).append("\n");
        explanation.append("  - Filename: ").append(filename).append("\n");

        if (fileSize < 10000) {
            score -= 25;
            explanation.append("  - WARNING: Very small file size\n");
        } else if (fileSize > 5000000) {
            score += 5;
            explanation.append("  - Good file size (high quality)\n");
        }

        if (contentType == null || !contentType.startsWith("image/")) {
            score -= 30;
            explanation.append("  - WARNING: Invalid image type\n");
        }

        if (filename != null) {
            String lowerName = filename.toLowerCase();
            if (lowerName.contains("fake") ||
                    lowerName.contains("edited") ||
                    lowerName.contains("modified") ||
                    lowerName.contains("photoshop")) {
                score -= 20;
                explanation.append("  - WARNING: Suspicious filename\n");
            }
        }

        return Math.min(100, Math.max(0, score));
    }

    // ================================
    // Text Analysis
    // ================================
    private double analyzeExtractedText(String text, StringBuilder explanation) {
        double score = 60.0;

        explanation.append("\n• Text Content Analysis:\n");

        if (text == null || text.isEmpty()) {
            explanation.append("  - No text to analyze\n");
            return 50.0;
        }

        String lowerText = text.toLowerCase();

        String[] fakeIndicators = {
                "breaking", "shocking", "you won't believe",
                "doctors hate", "conspiracy", "cover up",
                "share before deleted", "wake up", "hoax",
                "click here", "urgent", "leaked"
        };

        String[] realIndicators = {
                "according to", "reuters", "associated press",
                "study shows", "research", "official statement",
                "confirmed", "verified", "reported", "sources say"
        };

        int fakeCount = 0;
        int realCount = 0;

        for (String indicator : fakeIndicators) {
            if (lowerText.contains(indicator)) {
                fakeCount++;
                score -= 8;
                explanation.append("  - WARNING: Fake indicator: '").append(indicator).append("'\n");
            }
        }

        for (String indicator : realIndicators) {
            if (lowerText.contains(indicator)) {
                realCount++;
                score += 6;
                explanation.append("  - GOOD: Real indicator: '").append(indicator).append("'\n");
            }
        }

        long capsCount = text.chars().filter(Character::isUpperCase).count();
        double capsRatio = (double) capsCount / text.length();
        if (capsRatio > 0.5 && text.length() > 20) {
            score -= 15;
            explanation.append("  - WARNING: Excessive capitalization\n");
        }

        long exclamationCount = text.chars().filter(c -> c == '!').count();
        if (exclamationCount > 5) {
            score -= 10;
            explanation.append("  - WARNING: Too many exclamation marks\n");
        }

        if (fakeCount == 0 && realCount == 0) {
            explanation.append("  - No clear indicators found\n");
        }

        return Math.min(100, Math.max(0, score));
    }

    // ================================
    // OCR Quality Analysis
    // ================================
    private double analyzeOCRQuality(String text, StringBuilder explanation) {
        double score = 70.0;

        explanation.append("\n• OCR Quality:\n");

        if (text == null || text.isEmpty()) {
            explanation.append("  - No text extracted (image may have no text)\n");
            return 60.0;
        }

        int length = text.length();
        int wordCount = text.split("\\s+").length;

        explanation.append("  - Characters: ").append(length).append("\n");
        explanation.append("  - Words: ").append(wordCount).append("\n");

        if (length < 20) {
            score -= 15;
            explanation.append("  - WARNING: Very little text extracted\n");
        }

        if (length > 200 && wordCount > 30) {
            score += 15;
            explanation.append("  - Good amount of readable text\n");
        }

        return Math.min(100, Math.max(0, score));
    }

    // ================================
    // Determine Status
    // ================================
    private NewsStatus determineStatus(double score) {
        if (score >= 70) return NewsStatus.REAL;
        if (score >= 45) return NewsStatus.SUSPICIOUS;
        return NewsStatus.FAKE;
    }

    // ================================
    // CRUD Methods
    // ================================
    public List<ImageAnalysis> getAllImages() {
        return imageAnalysisRepository.findLatestImages();
    }

    public Optional<ImageAnalysis> getImageById(Long id) {
        return imageAnalysisRepository.findById(id);
    }

    public Map<String, Long> getImageStatistics() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", imageAnalysisRepository.count());
        stats.put("fake", imageAnalysisRepository.countByStatus(NewsStatus.FAKE));
        stats.put("real", imageAnalysisRepository.countByStatus(NewsStatus.REAL));
        stats.put("suspicious", imageAnalysisRepository.countByStatus(NewsStatus.SUSPICIOUS));
        return stats;
    }

    public void deleteImage(Long id) {
        imageAnalysisRepository.deleteById(id);
    }
}