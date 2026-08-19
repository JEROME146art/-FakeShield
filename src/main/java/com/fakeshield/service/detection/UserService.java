package com.fakeshield.service;

import com.fakeshield.model.User;
import com.fakeshield.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ================================
    // Get Currently Logged-in User
    // ================================
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("No user is currently logged in");
        }

        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    // ================================
    // Get User by ID
    // ================================
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    // ================================
    // Get User by Username
    // ================================
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    // ================================
    // Get User by Email
    // ================================
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    // ================================
    // Get All Users (Admin only)
    // ================================
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ================================
    // Update User Profile
    // ================================
    public User updateProfile(Long userId, Map<String, String> updates) {
        User user = getUserById(userId);

        // Update full name
        if (updates.containsKey("fullName") && updates.get("fullName") != null) {
            user.setFullName(updates.get("fullName"));
        }

        // Update email (with validation)
        if (updates.containsKey("email") && updates.get("email") != null) {
            String newEmail = updates.get("email");

            // Check if new email is different and not taken
            if (!newEmail.equals(user.getEmail())) {
                if (userRepository.existsByEmail(newEmail)) {
                    throw new RuntimeException("Email already in use");
                }
                user.setEmail(newEmail);
            }
        }

        User updatedUser = userRepository.save(user);
        System.out.println("✅ Profile updated for: " + updatedUser.getUsername());

        return updatedUser;
    }

    // ================================
    // Change Password
    // ================================
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = getUserById(userId);

        // Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Validate new password
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters");
        }

        // Check if new password is same as old
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new RuntimeException("New password must be different from current password");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        System.out.println("✅ Password changed for: " + user.getUsername());
    }

    // ================================
    // Delete User Account
    // ================================
    public void deleteUser(Long userId) {
        User user = getUserById(userId);
        userRepository.delete(user);
        System.out.println("🗑️ User deleted: " + user.getUsername());
    }

    // ================================
    // Check if Username Exists
    // ================================
    public boolean usernameExists(String username) {
        return userRepository.existsByUsername(username);
    }

    // ================================
    // Check if Email Exists
    // ================================
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    // ================================
    // Update Last Login Time
    // ================================
    public void updateLastLogin(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
        }
    }

    // ================================
    // Promote User to Admin (Admin only)
    // ================================
    public User promoteToAdmin(Long userId) {
        User user = getUserById(userId);
        user.setRole(User.Role.ADMIN);
        User updated = userRepository.save(user);
        System.out.println("👑 User promoted to ADMIN: " + updated.getUsername());
        return updated;
    }

    // ================================
    // Demote Admin to User (Admin only)
    // ================================
    public User demoteToUser(Long userId) {
        User user = getUserById(userId);
        user.setRole(User.Role.USER);
        User updated = userRepository.save(user);
        System.out.println("⬇️ User demoted to USER: " + updated.getUsername());
        return updated;
    }

    // ================================
    // Get User Statistics (Admin Dashboard)
    // ================================
    public Map<String, Object> getUserStatistics() {
        Map<String, Object> stats = new HashMap<>();

        long totalUsers = userRepository.count();
        List<User> allUsers = userRepository.findAll();

        long adminCount = allUsers.stream()
                .filter(u -> u.getRole() == User.Role.ADMIN)
                .count();

        long userCount = allUsers.stream()
                .filter(u -> u.getRole() == User.Role.USER)
                .count();

        // Users who logged in today
        LocalDateTime todayStart = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        long activeToday = allUsers.stream()
                .filter(u -> u.getLastLogin() != null && u.getLastLogin().isAfter(todayStart))
                .count();

        // Users registered this week
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        long newThisWeek = allUsers.stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(weekAgo))
                .count();

        stats.put("totalUsers", totalUsers);
        stats.put("adminCount", adminCount);
        stats.put("userCount", userCount);
        stats.put("activeToday", activeToday);
        stats.put("newThisWeek", newThisWeek);

        return stats;
    }

    // ================================
    // Get User Profile Info (Safe - no password)
    // ================================
    public Map<String, Object> getUserProfile(Long userId) {
        User user = getUserById(userId);

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("username", user.getUsername());
        profile.put("email", user.getEmail());
        profile.put("fullName", user.getFullName());
        profile.put("role", user.getRole().name());
        profile.put("createdAt", user.getCreatedAt());
        profile.put("lastLogin", user.getLastLogin());
        // Note: Password is NEVER included!

        return profile;
    }

    // ================================
    // Search Users by Username or Email
    // ================================
    public List<User> searchUsers(String keyword) {
        // Get all users and filter (for small datasets)
        // For production with many users, add custom query in repository
        return userRepository.findAll().stream()
                .filter(u -> u.getUsername().toLowerCase().contains(keyword.toLowerCase()) ||
                        u.getEmail().toLowerCase().contains(keyword.toLowerCase()) ||
                        (u.getFullName() != null &&
                                u.getFullName().toLowerCase().contains(keyword.toLowerCase())))
                .toList();
    }
}