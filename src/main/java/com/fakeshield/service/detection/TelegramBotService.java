package com.fakeshield.service;

import com.fakeshield.model.News;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.TelegramBotsApi;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.updatesreceivers.DefaultBotSession;

@Component
@ConditionalOnProperty(name = "telegram.bot.enabled", havingValue = "true", matchIfMissing = false)
public class TelegramBotService extends TelegramLongPollingBot {

    @Value("${telegram.bot.token:}")
    private String botToken;

    @Value("${telegram.bot.username:}")
    private String botUsername;

    @Autowired
    private NewsAnalysisService newsAnalysisService;

    // ✅ Auto-register bot on startup
    @PostConstruct
    public void registerBot() {
        try {
            if (botToken == null || botToken.isEmpty()) {
                System.err.println("⚠️ Telegram Bot Token is missing! Bot NOT started.");
                return;
            }

            TelegramBotsApi botsApi = new TelegramBotsApi(DefaultBotSession.class);
            botsApi.registerBot(this);
            System.out.println("✅ Telegram Bot registered successfully: @" + botUsername);
        } catch (TelegramApiException e) {
            System.err.println("❌ Failed to register Telegram Bot: " + e.getMessage());
        }
    }

    @Override
    public String getBotUsername() {
        return botUsername;
    }

    @Override
    public String getBotToken() {
        return botToken;
    }

    @Override
    public void onUpdateReceived(Update update) {
        if (update.hasMessage() && update.getMessage().hasText()) {
            String messageText = update.getMessage().getText();
            long chatId = update.getMessage().getChatId();
            String userName = update.getMessage().getFrom().getFirstName();

            System.out.println("================================");
            System.out.println("📱 Telegram Message Received");
            System.out.println("From: " + userName);
            System.out.println("Text: " + messageText);
            System.out.println("================================");

            // Handle different commands
            if (messageText.equals("/start")) {
                sendWelcomeMessage(chatId, userName);
            } else if (messageText.equals("/help")) {
                sendHelpMessage(chatId);
            } else if (messageText.equals("/about")) {
                sendAboutMessage(chatId);
            } else {
                // Analyze the news
                analyzeAndReply(chatId, messageText);
            }
        }
    }

    private void sendWelcomeMessage(long chatId, String userName) {
        String welcome = "🛡️ *Welcome to FakeShield Bot!* 🛡️\n\n" +
                "Hello " + userName + "! 👋\n\n" +
                "I'm your personal fake news detector! 🔍\n\n" +
                "*How to use me:*\n" +
                "📝 Just send me any news text or headline\n" +
                "🔍 I'll analyze it instantly\n" +
                "✅ Get credibility score & details\n\n" +
                "*Commands:*\n" +
                "/start - Show this message\n" +
                "/help - How to use\n" +
                "/about - About FakeShield\n\n" +
                "*Try me!* Send any news article now! 🚀";

        sendMessage(chatId, welcome);
    }

    private void sendHelpMessage(long chatId) {
        String help = "📖 *How to Use FakeShield Bot*\n\n" +
                "1️⃣ Copy any news article or headline\n" +
                "2️⃣ Send it to me as a message\n" +
                "3️⃣ Wait 2-3 seconds\n" +
                "4️⃣ Get instant analysis!\n\n" +
                "*Example:*\n" +
                "Send: \"Scientists discover new planet\"\n" +
                "Get: ✅ Real News (85% credibility)\n\n" +
                "*What I check:*\n" +
                "• Clickbait patterns\n" +
                "• Sentiment analysis\n" +
                "• Source credibility\n" +
                "• Grammar quality\n\n" +
                "*Web App:*\n" +
                "https://fakeshield-production-f214.up.railway.app";

        sendMessage(chatId, help);
    }

    private void sendAboutMessage(long chatId) {
        String about = "🛡️ *About FakeShield*\n\n" +
                "FakeShield is an AI-powered fake news detection " +
                "platform built with:\n\n" +
                "☕ Java Spring Boot\n" +
                "🎨 HTML/CSS/JavaScript\n" +
                "🐳 Docker\n" +
                "☁️ Railway Cloud\n" +
                "🤖 Multiple Detection Algorithms\n\n" +
                "*Features:*\n" +
                "✅ Text Analysis\n" +
                "✅ Image Analysis (OCR)\n" +
                "✅ Multi-Language Support\n" +
                "✅ Chrome Extension\n" +
                "✅ Telegram Bot (You're using it!)\n\n" +
                "*Developer:*\n" +
                "Jerome Victor Paulraj\n" +
                "College Project\n\n" +
                "*GitHub:*\n" +
                "https://github.com/JEROME146art/-FakeShield";

        sendMessage(chatId, about);
    }

    private void analyzeAndReply(long chatId, String text) {
        sendMessage(chatId, "🔍 *Analyzing your text...*\nPlease wait 2-3 seconds ⏳");

        try {
            News news = new News.Builder()
                    .title(text.length() > 100 ? text.substring(0, 100) : text)
                    .content(text)
                    .platform("Telegram Bot")
                    .build();

            News analyzed = newsAnalysisService.analyzeNewsWithLanguage(news);

            String reply = buildAnalysisReply(analyzed);
            sendMessage(chatId, reply);

        } catch (Exception e) {
            sendMessage(chatId, "❌ *Error analyzing text*\n\nPlease try again or send different text.");
            System.err.println("Analysis error: " + e.getMessage());
        }
    }

    private String buildAnalysisReply(News news) {
        double score = news.getCredibilityScore();
        String status = news.getStatus().name();
        String statusDisplay = news.getStatus().getDisplayName();

        String statusEmoji;
        String statusColor;

        switch (status) {
            case "REAL":
                statusEmoji = "✅";
                statusColor = "🟢";
                break;
            case "FAKE":
                statusEmoji = "❌";
                statusColor = "🔴";
                break;
            case "SUSPICIOUS":
                statusEmoji = "⚠️";
                statusColor = "🟡";
                break;
            default:
                statusEmoji = "❓";
                statusColor = "⚪";
        }

        StringBuilder reply = new StringBuilder();
        reply.append("*🛡️ FakeShield Analysis Result*\n\n");
        reply.append("━━━━━━━━━━━━━━━━━━━━━━\n\n");
        reply.append(statusEmoji).append(" *Status:* ").append(statusDisplay).append("\n");
        reply.append("📊 *Score:* ").append(String.format("%.1f", score)).append("%\n");
        reply.append(statusColor).append(" *Credibility:* ").append(getCredibilityBar(score)).append("\n\n");

        if (news.getAnalysisResult() != null) {
            var ar = news.getAnalysisResult();
            reply.append("*📈 Breakdown:*\n");
            reply.append("• Clickbait: ").append(formatScore(ar.getClickbaitScore())).append("\n");
            reply.append("• Sentiment: ").append(formatScore(ar.getSentimentScore())).append("\n");
            reply.append("• Source: ").append(formatScore(ar.getSourceCredibilityScore())).append("\n");
            reply.append("• Grammar: ").append(formatScore(ar.getGrammarScore())).append("\n");
            reply.append("• Fact Check: ").append(formatScore(ar.getFactCheckScore())).append("\n\n");
        }

        reply.append("*💡 Verdict:*\n");
        reply.append(getVerdict(status)).append("\n\n");

        reply.append("━━━━━━━━━━━━━━━━━━━━━━\n\n");
        reply.append("*🌐 Full