package com.fakeshield.service;

import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
public class LanguageService {

    // Supported languages
    private static final Map<String, String> LANGUAGE_NAMES = new HashMap<>();

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
    }

    /**
     * Detect language from text using simple pattern matching
     * (Simplified for demo - production would use language-detector library)
     */
    public String detectLanguage(String text) {
        if (text == null || text.isEmpty()) {
            return "en"; // Default English
        }

        // Tamil detection (Unicode range)
        if (text.matches(".*[\\u0B80-\\u0BFF].*")) return "ta";

        // Hindi detection (Devanagari script)
        if (text.matches(".*[\\u0900-\\u097F].*")) return "hi";

        // Bengali detection
        if (text.matches(".*[\\u0980-\\u09FF].*")) return "bn";

        // Chinese detection
        if (text.matches(".*[\\u4E00-\\u9FFF].*")) return "zh";

        // Japanese detection (Hiragana/Katakana)
        if (text.matches(".*[\\u3040-\\u309F\\u30A0-\\u30FF].*")) return "ja";

        // Arabic detection
        if (text.matches(".*[\\u0600-\\u06FF].*")) return "ar";

        // Russian detection (Cyrillic)
        if (text.matches(".*[\\u0400-\\u04FF].*")) return "ru";

        // Spanish detection (common words)
        if (text.toLowerCase().matches(".*(hola|noticias|falso|verdadero|el|la|los|las).*")) return "es";

        // French detection (common words)
        if (text.toLowerCase().matches(".*(bonjour|nouvelles|faux|vrai|le|la|les|des).*")) return "fr";

        // German detection (common words)
        if (text.toLowerCase().matches(".*(guten|nachrichten|falsch|wahr|der|die|das).*")) return "de";

        // Portuguese detection
        if (text.toLowerCase().matches(".*(olá|notícias|falso|verdadeiro|o|a|os|as).*")) return "pt";

        return "en"; // Default to English
    }

    /**
     * Get language name from code
     */
    public String getLanguageName(String code) {
        return LANGUAGE_NAMES.getOrDefault(code, "Unknown");
    }

    /**
     * Translate text using free Google Translate API
     * (Uses public endpoint - for demo purposes)
     */
    public String translateText(String text, String sourceLang, String targetLang) {
        try {
            if (sourceLang.equals(targetLang)) {
                return text; // No translation needed
            }

            String encodedText = URLEncoder.encode(text, StandardCharsets.UTF_8);
            String urlString = "https://translate.googleapis.com/translate_a/single?" +
                    "client=gtx&sl=" + sourceLang +
                    "&tl=" + targetLang +
                    "&dt=t&q=" + encodedText;

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(urlString))
                    .header("User-Agent", "Mozilla/5.0")
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                return parseTranslation(response.body());
            }
        } catch (Exception e) {
            System.err.println("Translation error: " + e.getMessage());
        }

        return text; // Return original on error
    }

    /**
     * Parse Google Translate response (simple parser)
     */
    private String parseTranslation(String jsonResponse) {
        try {
            // Response format: [[["translated text","original",null,null,1]],null,"en"]
            int startIdx = jsonResponse.indexOf("[[[\"") + 4;
            int endIdx = jsonResponse.indexOf("\",\"");

            if (startIdx > 3 && endIdx > startIdx) {
                return jsonResponse.substring(startIdx, endIdx)
                        .replace("\\n", "\n")
                        .replace("\\\"", "\"");
            }
        } catch (Exception e) {
            System.err.println("Parse error: " + e.getMessage());
        }
        return "";
    }

    /**
     * Get all supported languages
     */
    public Map<String, String> getSupportedLanguages() {
        return new HashMap<>(LANGUAGE_NAMES);
    }
}