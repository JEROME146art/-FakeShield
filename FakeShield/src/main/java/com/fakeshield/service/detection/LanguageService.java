package com.fakeshield.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Service
public class LanguageService {

    private static final Map<String, String> LANGUAGE_NAMES = new HashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(6))
            .build();

    static {
        LANGUAGE_NAMES.put("en", "English");
        LANGUAGE_NAMES.put("ta", "Tamil");
        LANGUAGE_NAMES.put("hi", "Hindi");
        LANGUAGE_NAMES.put("es", "Spanish");
        LANGUAGE_NAMES.put("fr", "French");
        LANGUAGE_NAMES.put("de", "German");
        LANGUAGE_NAMES.put("zh", "Chinese");
        LANGUAGE_NAMES.put("ar", "Arabic");
        LANGUAGE_NAMES.put("ja", "Japanese");
        LANGUAGE_NAMES.put("ru", "Russian");
        LANGUAGE_NAMES.put("pt", "Portuguese");
        LANGUAGE_NAMES.put("bn", "Bengali");
        LANGUAGE_NAMES.put("te", "Telugu");
        LANGUAGE_NAMES.put("kn", "Kannada");
        LANGUAGE_NAMES.put("ml", "Malayalam");
    }

    /**
     * Detect language from text using Unicode ranges and keywords
     */
    public String detectLanguage(String text) {
        if (text == null || text.trim().isEmpty()) {
            return "en";
        }

        // Unicode scripts
        if (text.matches(".*[\\u0B80-\\u0BFF].*")) return "ta"; // Tamil
        if (text.matches(".*[\\u0900-\\u097F].*")) return "hi"; // Hindi / Devanagari
        if (text.matches(".*[\\u0980-\\u09FF].*")) return "bn"; // Bengali
        if (text.matches(".*[\\u0C00-\\u0C7F].*")) return "te"; // Telugu
        if (text.matches(".*[\\u0C80-\\u0CFF].*")) return "kn"; // Kannada
        if (text.matches(".*[\\u0D00-\\u0D7F].*")) return "ml"; // Malayalam
        if (text.matches(".*[\\u4E00-\\u9FFF].*")) return "zh"; // Chinese
        if (text.matches(".*[\\u3040-\\u309F\\u30A0-\\u30FF].*")) return "ja"; // Japanese
        if (text.matches(".*[\\u0600-\\u06FF].*")) return "ar"; // Arabic
        if (text.matches(".*[\\u0400-\\u04FF].*")) return "ru"; // Russian

        String lower = text.toLowerCase();
        if (lower.matches(".*\\b(el|la|los|las|un|una|noticias|falso|verdadero|hola|gracias)\\b.*")) return "es";
        if (lower.matches(".*\\b(le|la|les|un|une|des|nouvelles|faux|vrai|bonjour|merci)\\b.*")) return "fr";
        if (lower.matches(".*\\b(der|die|das|ein|eine|nachrichten|falsch|wahr|guten|danke)\\b.*")) return "de";
        if (lower.matches(".*\\b(o|a|os|as|um|uma|notícias|falso|verdadeiro|olá|obrigado)\\b.*")) return "pt";

        return "en";
    }

    /**
     * Get human-readable language name
     */
    public String getLanguageName(String code) {
        if (code == null) return "Unknown";
        return LANGUAGE_NAMES.getOrDefault(code.toLowerCase(), code.toUpperCase());
    }

    /**
     * Translate text using Chrome Translation API with GTX fallback
     */
    public String translateText(String text, String sourceLang, String targetLang) {
        if (text == null || text.trim().isEmpty()) {
            return text;
        }

        if (sourceLang != null && targetLang != null && sourceLang.equalsIgnoreCase(targetLang)) {
            return text;
        }

        String sl = (sourceLang == null || sourceLang.isBlank() || "auto".equalsIgnoreCase(sourceLang)) ? "auto" : sourceLang.toLowerCase();
        String tl = (targetLang == null || targetLang.isBlank()) ? "en" : targetLang.toLowerCase();

        // 1. Primary: Google Chrome translation endpoint
        try {
            String encodedText = URLEncoder.encode(text, StandardCharsets.UTF_8);
            String urlString = "https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=" +
                    sl + "&tl=" + tl + "&q=" + encodedText;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(urlString))
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .timeout(Duration.ofSeconds(6))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                if (root.isArray() && root.size() > 0 && !root.get(0).isNull()) {
                    String translated = root.get(0).asText();
                    if (translated != null && !translated.isBlank()) {
                        return translated;
                    }
                } else if (root.isTextual()) {
                    return root.asText();
                }
            }
        } catch (Exception e) {
            System.err.println("Primary translate endpoint error: " + e.getMessage());
        }

        // 2. Secondary Fallback: Google GTX endpoint
        try {
            String encodedText = URLEncoder.encode(text, StandardCharsets.UTF_8);
            String urlString = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" +
                    sl + "&tl=" + tl + "&dt=t&q=" + encodedText;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(urlString))
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
                    .timeout(Duration.ofSeconds(5))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                if (root.isArray() && root.size() > 0 && root.get(0).isArray()) {
                    StringBuilder sb = new StringBuilder();
                    for (JsonNode item : root.get(0)) {
                        if (item.isArray() && item.size() > 0 && !item.get(0).isNull()) {
                            sb.append(item.get(0).asText());
                        }
                    }
                    String res = sb.toString();
                    if (!res.isBlank()) return res;
                }
            }
        } catch (Exception e) {
            System.err.println("Secondary translate endpoint error: " + e.getMessage());
        }

        return text;
    }

    /**
     * Get all supported languages map
     */
    public Map<String, String> getSupportedLanguages() {
        return new HashMap<>(LANGUAGE_NAMES);
    }
}