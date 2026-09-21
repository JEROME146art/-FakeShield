package com.fakeshield.controller;

import com.fakeshield.model.User;
import com.fakeshield.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    // ================================
    // Get Current Logged-in User
    // ================================
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            User user = userService.getCurrentUser();
            return ResponseEntity.ok(userService.getUserProfile(user.getId()));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ================================
    // Get User Profile by ID
    // ================================
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            Map<String, Object> profile = userService.getUserProfile(id);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ================================
    // Update Profile
    // ================================
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> updates) {
        try {
            User currentUser = userService.getCurrentUser();
            User updated = userService.updateProfile(currentUser.getId(), updates);
            return ResponseEntity.ok(userService.getUserProfile(updated.getId()));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ================================
    // Change Password
    // ================================
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> passwords) {
        try {
            User currentUser = userService.getCurrentUser();
            String oldPassword = passwords.get("oldPassword");
            String newPassword = passwords.get("newPassword");

            if (oldPassword == null || newPassword == null) {
                throw new RuntimeException("Old and new passwords are required");
            }

            userService.changePassword(currentUser.getId(), oldPassword, newPassword);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Password changed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ================================
    // Delete Account
    // ================================
    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteAccount() {
        try {
            User currentUser = userService.getCurrentUser();
            userService.deleteUser(currentUser.getId());

            Map<String, String> response = new HashMap<>();
            response.put("message", "Account deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ================================
    // Check Username Availability
    // ================================
    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestParam String username) {
        Map<String, Object> response = new HashMap<>();
        response.put("username", username);
        response.put("available", !userService.usernameExists(username));
        return ResponseEntity.ok(response);
    }

    // ================================
    // Check Email Availability
    // ================================
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        Map<String, Object> response = new HashMap<>();
        response.put("email", email);
        response.put("available", !userService.emailExists(email));
        return ResponseEntity.ok(response);
    }

    // ================================
    // ADMIN ENDPOINTS
    // ================================

    // Get all users (Admin only)
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Get user statistics (Admin only)
    @GetMapping("/admin/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getStatistics() {
        try {
            Map<String, Object> stats = userService.getUserStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Promote user to admin
    @PostMapping("/admin/promote/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> promoteToAdmin(@PathVariable Long userId) {
        try {
            User user = userService.promoteToAdmin(userId);
            return ResponseEntity.ok(userService.getUserProfile(user.getId()));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Demote admin to user
    @PostMapping("/admin/demote/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> demoteToUser(@PathVariable Long userId) {
        try {
            User user = userService.demoteToUser(userId);
            return ResponseEntity.ok(userService.getUserProfile(user.getId()));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Delete user (Admin only)
    @DeleteMapping("/admin/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUserByAdmin(@PathVariable Long userId) {
        try {
            userService.deleteUser(userId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "User deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Search users (Admin only)
    @GetMapping("/admin/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> searchUsers(@RequestParam String keyword) {
        try {
            List<User> users = userService.searchUsers(keyword);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}