package com.fakeshield.service;

import com.fakeshield.model.User;
import com.fakeshield.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // ================================
    // Register User
    // ================================
    public User registerUser(String username, String email, String password)
            throws Exception {

        if (userRepository.existsByEmail(email)) {
            throw new Exception("Email already registered: " + email);
        }

        if (userRepository.existsByUsername(username)) {
            throw new Exception("Username already taken: " + username);
        }

        if (password.length() < 6) {
            throw new Exception("Password must be at least 6 characters");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password);

        User savedUser = userRepository.save(user);
        System.out.println("✅ New user registered: " + savedUser.getUsername());
        return savedUser;
    }

    // ================================
    // Login User
    // ================================
    public Optional<User> login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword().equals(password)) {
                return Optional.of(user);
            }
        }

        return Optional.empty();
    }

    // ================================
    // Get All Users
    // ================================
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ================================
    // Get User By ID
    // ================================
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    // ================================
    // Get Leaderboard
    // ================================
    public List<Map<String, Object>> getLeaderboard() {
        List<User> topUsers = userRepository.findTopUsers();
        List<Map<String, Object>> leaderboard = new ArrayList<>();

        int rank = 1;
        for (User user : topUsers) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("rank", rank++);
            entry.put("username", user.getUsername());
            entry.put("reputationPoints", user.getReputationPoints());
            entry.put("totalSubmissions", user.getTotalSubmissions());
            leaderboard.add(entry);
            if (rank > 10) break;
        }

        return leaderboard;
    }
}