package com.fakeshield.controller;

import com.fakeshield.service.LanguageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/language")
@CrossOrigin(origins = "*")
public class LanguageController {

    @Autowired
    private LanguageService languageService;

    // GET: All supported languages
    @GetMapping("/supported")
    public ResponseEntity<Map<String, String>> getSupportedLanguages() {
        return ResponseEntity.ok(languageService.getSupportedLanguages());
    }

    // POST: Detect language
    @PostMapping("/detect")
    public ResponseEntity<?> detectLanguage(@RequestBody Map<String, String> request) {
        String text = request.get("text");
        if (text == null || text.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Text is required"));
        }

        String detectedCode = languageService.detectLanguage(text);
        String detectedName = languageService.getLanguageName(detectedCode);

        Map<String, String> response = new HashMap<>();
        response.put("code", detectedCode);
        response.put("name", detectedName);

        return ResponseEntity.ok(response);
    }

    // POST: Translate text
    @PostMapping("/translate")
    public ResponseEntity<?> translateText(@RequestBody Map<String, String> request) {
        String text = request.get("text");
        String sourceLang = request.getOrDefault("source", "auto");
        String targetLang = request.getOrDefault("target", "en");

        if (text == null || text.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Text is required"));
        }

        // Auto-detect if source is "auto"
        if (sourceLang.equals("auto")) {
            sourceLang = languageService.detectLanguage(text);
        }

        String translated = languageService.translateText(text, sourceLang, targetLang);

        Map<String, String> response = new HashMap<>();
        response.put("original", text);
        response.put("translated", translated);
        response.put("sourceLang", sourceLang);
        response.put("targetLang", targetLang);
        response.put("sourceLangName", languageService.getLanguageName(sourceLang));
        response.put("targetLangName", languageService.getLanguageName(targetLang));

        return ResponseEntity.ok(response);
    }
}