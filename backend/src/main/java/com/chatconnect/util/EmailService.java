package com.chatconnect.util;

import java.util.UUID;

/**
 * Mock email service used for development and testing.
 * Instead of sending real emails, it simply logs the verification URL to the console.
 * In a production setup this could be replaced with an SMTP implementation.
 */
public class EmailService {
    public void sendVerificationEmail(String email, String token) {
        // In a real app you would construct a proper verification URL.
        String verificationUrl = "http://localhost:8080/api/auth/verify?token=" + token;
        System.out.println("[Mock Email] Verification link for " + email + ": " + verificationUrl);
    }
}
