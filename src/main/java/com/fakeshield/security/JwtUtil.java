package com.fakeshield.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret:FakeShieldDefaultSecretKeyThatIsLongEnoughForHS256Algorithm123456}")
    private String secret;

    @Value("${jwt.expiration:86400000}") // 24 hours
    private long expiration;

    /**
     * Ensures secret is always >= 256 bits for HS256.
     * If user provides a short secret, we hash it to 256-bit key.
     */
    private SecretKey getSigningKey() {
        try {
            byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);

            // If key is already long enough (>= 32 bytes), use it
            if (keyBytes.length >= 32) {
                return Keys.hmacShaKeyFor(keyBytes);
            }

            // Otherwise hash it to produce a secure 256-bit key
            MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
            byte[] hashedKey = sha256.digest(keyBytes);
            return Keys.hmacShaKeyFor(hashedKey);

        } catch (Exception e) {
            throw new RuntimeException("Failed to create JWT signing key", e);
        }
    }

    // Generate token
    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, username);
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    // Extract username from token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Extract expiration date
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // Check if token is expired
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // Validate token
    public Boolean validateToken(String token, String username) {
        final String tokenUsername = extractUsername(token);
        return (tokenUsername.equals(username) && !isTokenExpired(token));
    }
}