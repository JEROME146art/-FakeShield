package com.fakeshield.service;

import com.fakeshield.model.News;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

@Component
public class TelegramBotService extends TelegramLongPollingBot {

    @Value("${telegram.bot.token}")
    private String botToken;

    @Value("${telegram.bot.username}")
    private String botUsername;

    @Autowired
    private NewsAnalysisService newsAnalysisService;

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
        // Send "analyzing" message first
        sendMessage(chatId, "🔍 *Analyzing your text...*\nPlease wait 2-3 seconds ⏳");

        try {
            // Create News object
            News news = new News.Builder()
                    .title(text.length() > 100 ? text.substring(0, 100) : text)
                    .content(text)
                    .platform("Telegram Bot")
                    .build();

            // Analyze
            News analyzed = newsAnalysisService.analyzeNewsWithLanguage(news);

            // Build reply
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
        reply.append("*🌐 Full Analysis:*\n");
        reply.append("fakeshield-production-f214.up.railway.app\n\n");
        reply.append("*📤 Share this bot:*\n");
        reply.append("@").append(botUsername).append("\n\n");
        reply.append("_Send another news to analyze!_");

        return reply.toString();
    }

    private String formatScore(double score) {
        int rounded = (int) Math.round(score);
        String emoji;
        if (rounded >= 75) emoji = "🟢";
        else if (rounded >= 50) emoji = "🟡";
        else emoji = "🔴";
        return emoji + " " + rounded + "%";
    }

    private String getCredibilityBar(double score) {
        int filled = (int) (score / 10);
        StringBuilder bar = new StringBuilder();
        for (int i = 0; i < 10; i++) {
            if (i < filled) bar.append("█");
            else bar.append("░");
        }
        return bar.toString();
    }

    private String getVerdict(String status) {
        switch (status) {
            case "REAL":
                return "✅ This appears to be legitimate news with good credibility indicators.";
            case "FAKE":
                return "❌ WARNING: This shows strong signs of being fake news. DO NOT share!";
            case "SUSPICIOUS":
                return "⚠️ CAUTION: This content has some red flags. Verify from reliable sources before sharing.";
            default:
                return "❓ Cannot determine credibility. Please provide more context.";
        }
    }

    private void sendMessage(long chatId, String text) {
        SendMessage message = new SendMessage();
        message.setChatId(String.valueOf(chatId));
        message.setText(text);
        message.setParseMode("Markdown");

        try {
            execute(message);
        } catch (TelegramApiException e) {
            System.err.println("Error sending message: " + e.getMessage());
        }
    }
}