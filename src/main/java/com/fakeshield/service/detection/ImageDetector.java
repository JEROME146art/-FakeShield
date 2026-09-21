package com.fakeshield.service.detection;

import com.fakeshield.model.News;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;

// OOP: Inheritance - extends BaseDetector
public class ImageDetector extends BaseDetector {

    private MultipartFile imageFile;
    private String extractedText;

    public ImageDetector(MultipartFile imageFile) {
        super("Image Detector", 0.20);
        this.imageFile = imageFile;
        this.extractedText = "";
    }

    // OOP: Polymorphism
    @Override
    protected double performAnalysis(News news) {
        double score = 100.0;
        StringBuilder explanation = new StringBuilder();

        try {
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(imageFile.getBytes()));

            if (image == null) {
                lastExplanation = "Invalid image file";
                return 20.0;
            }

            int width = image.getWidth();
            int height = image.getHeight();

            explanation.append("Image dimensions: ").append(width).append("x").append(height).append(". ");

            // Suspicious if very small
            if (width < 200 || height < 200) {
                score -= 15;
                explanation.append("Small image size (possibly compressed). ");
            }

            long fileSize = imageFile.getSize();
            explanation.append("File size: ").append(fileSize / 1024).append(" KB. ");

            if (fileSize < 10000) {
                score -= 20;
                explanation.append("Very small file size (possibly manipulated). ");
            }

            String contentType = imageFile.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                score -= 30;
                explanation.append("Invalid image format. ");
            }

            double aspectRatio = (double) width / height;
            if (aspectRatio > 3.0 || aspectRatio < 0.33) {
                score -= 10;
                explanation.append("Unusual aspect ratio. ");
            }

        } catch (Exception e) {
            explanation.append("Error analyzing image: ").append(e.getMessage());
            score = 30.0;
        }

        lastExplanation = explanation.toString();
        return score;
    }

    public String getExtractedText() {
        return extractedText;
    }

    public void setExtractedText(String extractedText) {
        this.extractedText = extractedText;
    }
}