package com.fakeshield.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    // ================================
    // Password Encoder Bean (BCrypt)
    // ================================
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ================================
    // Authentication Manager Bean
    // ================================
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    // ================================
    // Main Security Filter Chain
    // ================================
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // ================================
                        // 1. Public Authentication Endpoints
                        // ================================
                        .requestMatchers("/api/auth/**").permitAll()

                        // ================================
                        // 2. Public Username/Email Check (for signup validation)
                        // ================================
                        .requestMatchers(
                                "/api/user/check-username",
                                "/api/user/check-email"
                        ).permitAll()

                        // ================================
                        // 3. Public Static Files & HTML Pages
                        // ================================
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/login.html",
                                "/signup.html",
                                "/history.html",
                                "/profile.html",
                                "/app.js",
                                "/auth.js",
                                "/styles.css",
                                "/auth.css",
                                "/favicon.ico",
                                "/static/**",
                                "/assets/**",
                                "/images/**"
                        ).permitAll()

                        // ================================
                        // 4. Public Features (Guest Analysis)
                        // ================================
                        .requestMatchers("/api/images/analyze").permitAll()
                        .requestMatchers("/api/images/statistics").permitAll()

                        // ================================
                        // 5. Development Tools (H2 Console)
                        // ================================
                        .requestMatchers("/h2-console/**").permitAll()

                        // ================================
                        // 6. Protected Endpoints (Login Required)
                        // ================================
                        .requestMatchers("/api/user/**").authenticated()
                        .requestMatchers("/api/history/**").authenticated()

                        // ================================
                        // 7. Admin Only Endpoints
                        // ================================
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // ================================
                        // 8. Everything else - allow (safe default for now)
                        // ================================
                        .anyRequest().permitAll()
                )
                // Allow H2 console frames
                .headers(headers -> headers.frameOptions(frame -> frame.disable()))
                // Add JWT filter before Spring's default auth filter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ================================
    // CORS Configuration
    // ================================
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}