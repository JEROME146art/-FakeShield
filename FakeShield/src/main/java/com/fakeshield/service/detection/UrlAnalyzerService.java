package com.fakeshield.service;

import com.fakeshield.model.News;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

@Service
public class UrlAnalyzerService {

    @Autowired
    private NewsAnalysisService newsAnalysisService;

    /**
     * Fetch and analyze news from URL
     */
    public News analyzeUrl(String url) throws Exception {
        System.out.println("================================");
        System.out.println("🌐 Analyzing URL: " + url);
        System.out.println("================================");

        // Fetch article content
        Map<String, String> articleData = fetchArticle(url);

        // Create News object
        News news = new News.Builder()
                .title(articleData.get("title"))
                .content(articleData.get("content"))
                .sourceUrl(url)
                .platform(articleData.get("platform"))
                .author(articleData.get("author"))
                .build();

        // Analyze
        return newsAnalysisService.analyzeNewsWithLanguage(news);
    }

    /**
     * Fetch article from URL using JSoup
     */
    private Map<String, String> fetchArticle(String url) throws Exception {
        Map<String, String> data = new HashMap<>();

        // Connect and get HTML
        Document doc = Jsoup.connect(url)
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                .timeout(15000)
                .followRedirects(true)
                .get();

        // Extract title
        String title = extractTitle(doc);
        data.put("title", title);

        // Extract content
        String content = extractContent(doc);
        data.put("content", content);

        // Extract author
        String author = extractAuthor(doc);
        data.put("author", author);

        // Extract platform from URL
        String platform = extractPlatform(url);
        data.put("platform", platform);

        System.out.println("📄 Title: " + title);
        System.out.println("📝 Content length: " + content.length() + " chars");
        System.out.println("👤 Author: " + author);
        System.out.println("🌐 Platform: " + platform);

        return data;
    }

    private String extractTitle(Document doc) {
        // Try multiple ways to get title
        String title = "";

        // 1. Try og:title (most reliable)
        Element ogTitle = doc.selectFirst("meta[property=og:title]");
        if (ogTitle != null) {
            title = ogTitle.attr("content");
        }

        // 2. Try twitter:title
        if (title.isEmpty()) {
            Element twitterTitle = doc.selectFirst("meta[name=twitter:title]");
            if (twitterTitle != null) {
                title = twitterTitle.attr("content");
            }
        }

        // 3. Try h1
        if (title.isEmpty()) {
            Element h1 = doc.selectFirst("h1");
            if (h1 != null) {
                title = h1.text();
            }
        }

        // 4. Fallback to page title
        if (title.isEmpty()) {
            title = doc.title();
        }

        return title.trim();
    }

    private String extractContent(Document doc) {
        StringBuilder content = new StringBuilder();

        // Try article tag first
        Elements articles = doc.select("article");
        if (!articles.isEmpty()) {
            for (Element article : articles) {
                Elements paragraphs = article.select("p");
                for (Element p : paragraphs) {
                    String text = p.text().trim();
                    if (text.length() > 30) {
                        content.append(text).append("\n\n");
                    }
                }
            }
        }

        // If no article tag, try main tag
        if (content.length() < 100) {
            Elements mains = doc.select("main");
            if (!mains.isEmpty()) {
                Elements paragraphs = mains.select("p");
                for (Element p : paragraphs) {
                    String text = p.text().trim();
                    if (text.length() > 30) {
                        content.append(text).append("\n\n");
                    }
                }
            }
        }

        // Fallback: get all paragraphs
        if (content.length() < 100) {
            Elements paragraphs = doc.select("p");
            for (Element p : paragraphs) {
                String text = p.text().trim();
                if (text.length() > 50) {
                    content.append(text).append("\n\n");
                }
            }
        }

        // Try og:description as backup
        if (content.length() < 100) {
            Element ogDesc = doc.selectFirst("meta[property=og:description]");
            if (ogDesc != null) {
                content.append(ogDesc.attr("content"));
            }
        }

        String result = content.toString().trim();

        // Limit content length
        if (result.length() > 5000) {
            result = result.substring(0, 5000) + "...";
        }

        return result;
    }

    private String extractAuthor(Document doc) {
        String author = "";

        // Try meta author
        Element metaAuthor = doc.selectFirst("meta[name=author]");
        if (metaAuthor != null) {
            author = metaAuthor.attr("content");
        }

        // Try og:article:author
        if (author.isEmpty()) {
            Element ogAuthor = doc.selectFirst("meta[property=article:author]");
            if (ogAuthor != null) {
                author = ogAuthor.attr("content");
            }
        }

        // Try common author classes
        if (author.isEmpty()) {
            Element authorElement = doc.selectFirst(".author, .byline, [class*=author], [class*=byline]");
            if (authorElement != null) {
                author = authorElement.text();
            }
        }

        return author.isEmpty() ? "Unknown" : author.trim();
    }

    private String extractPlatform(String url) {
        try {
            URI uri = new URI(url);
            String domain = uri.getHost();
            if (domain == null) return "Unknown";

            // Remove www.
            domain = domain.replace("www.", "");

            // Extract main domain
            String[] parts = domain.split("\\.");
            if (parts.length >= 2) {
                return parts[0].substring(0, 1).toUpperCase() + parts[0].substring(1);
            }

            return domain;
        } catch (Exception e) {
            return "Unknown";
        }
    }
}