package com.chatconnect.service;

import com.chatconnect.dao.UserDao;
import com.chatconnect.entity.User;
import java.util.Optional;

/**
 * Service layer for user profile management.
 */
public class UserService {
    private final UserDao userDao = new UserDao();

    /**
     * Retrieves a user's profile by id.
     */
    public Optional<User> getUserProfile(Long userId) {
        return userDao.findById(userId);
    }

    /**
     * Updates a user's profile fields.
     * Fields that are null are ignored (partial update).
     */
    public User updateUser(Long userId, String username, String email, String contactNumber, String profileImage) {
        User user = userDao.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (username != null) user.setUsername(username);
        if (email != null) user.setEmail(email);
        if (contactNumber != null) user.setContactNumber(contactNumber);
        if (profileImage != null) user.setProfileImage(profileImage);
        userDao.update(user);
        return user;
    }

    /**
     * Sets the online status of a user (e.g., "ONLINE", "OFFLINE").
     * This can be used by the WebSocket layer to broadcast presence.
     */
    public void setStatus(Long userId, String status) {
        User user = userDao.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setOnlineStatus("ONLINE".equalsIgnoreCase(status));
        userDao.update(user);
    }
}
