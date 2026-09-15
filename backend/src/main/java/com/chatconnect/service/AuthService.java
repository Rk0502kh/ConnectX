package com.chatconnect.service;

import com.chatconnect.dao.UserDao;
import com.chatconnect.entity.User;
import com.chatconnect.util.JwtUtil;
import org.mindrot.jbcrypt.BCrypt;

import java.util.Optional;
import java.util.regex.Pattern;

public class AuthService {

    private final UserDao userDao;
    private final JwtUtil jwtUtil;
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");
    private static final int MIN_PASSWORD_LENGTH = 8;

    public AuthService(UserDao userDao, JwtUtil jwtUtil) {
        this.userDao = userDao;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Register a new user.
     * @return the persisted User object
     * @throws IllegalArgumentException if validation fails
     */
    public User register(String username, String email, String rawPassword, String contactNumber) {
        // Basic validation
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Username is required");
        }
        if (email == null || !EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException("Valid email is required");
        }
        if (rawPassword == null || rawPassword.length() < MIN_PASSWORD_LENGTH) {
            throw new IllegalArgumentException("Password must be at least " + MIN_PASSWORD_LENGTH + " characters");
        }
        // Duplicate checks
        if (userDao.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }
        if (userDao.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Username already in use");
        }
        // Hash password
        String hashed = BCrypt.hashpw(rawPassword, BCrypt.gensalt());
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(hashed);
        user.setContactNumber(contactNumber);
        // persisted via DAO
        return userDao.save(user);
    }

    /**
     * Login with email and password. Returns JWT token string.
     */
    public String login(String email, String rawPassword) {
        Optional<User> optionalUser = userDao.findByEmail(email);
        if (optionalUser.isEmpty()) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        User user = optionalUser.get();
        if (!BCrypt.checkpw(rawPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        // Generate JWT – token contains user id
        return jwtUtil.generateAccessToken(user.getId());
    }

    /**
     * Validate JWT and return user id.
     */
    public Long validateToken(String token) {
        return jwtUtil.validateTokenAndGetUserId(token);
    }

    public Optional<User> getUserById(Long id) {
        return userDao.findById(id);
    }
}
