package com.fakeshield;

import com.fakeshield.service.TelegramBotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.TelegramBotsApi;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.updatesreceivers.DefaultBotSession;

@SpringBootApplication
public class FakeshieldApplication {

    public static void main(String[] args) {
        System.out.println("╔══════════════════════════════════════╗");
        System.out.println("║   FakeShield Backend Starting...     ║");
        System.out.println("║   Fake News Detection Platform       ║");
        System.out.println("║   With Telegram Bot Support 🤖       ║");
        System.out.println("╚══════════════════════════════════════╝");

        SpringApplication.run(FakeshieldApplication.class, args);
    }
}

@Component
class BotInitializer {

    @Autowired
    private TelegramBotService telegramBotService;

    @EventListener(ApplicationReadyEvent.class)
    public void init() {
        try {
            TelegramBotsApi botsApi = new TelegramBotsApi(DefaultBotSession.class);
            botsApi.registerBot(telegramBotService);
            System.out.println("");
            System.out.println("╔══════════════════════════════════════╗");
            System.out.println("║   🤖 Telegram Bot Started!           ║");
            System.out.println("║   Ready to receive messages          ║");
            System.out.println("╚══════════════════════════════════════╝");
        } catch (TelegramApiException e) {
            System.err.println("❌ Error starting Telegram bot: " + e.getMessage());
            e.printStackTrace();
        }
    }
}