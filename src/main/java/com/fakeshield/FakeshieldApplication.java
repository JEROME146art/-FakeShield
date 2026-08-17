package com.fakeshield;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FakeshieldApplication {

    public static void main(String[] args) {
        System.out.println("╔══════════════════════════════════════╗");
        System.out.println("║   FakeShield Backend Starting...     ║");
        System.out.println("║   Fake News Detection Platform       ║");
        System.out.println("║                                      ║");
        System.out.println("╚══════════════════════════════════════╝");

        SpringApplication.run(FakeshieldApplication.class, args);
    }
}

