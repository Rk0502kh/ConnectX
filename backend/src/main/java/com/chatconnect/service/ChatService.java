package com.chatconnect.service;

import com.chatconnect.dao.ChatDao;
import com.chatconnect.dao.ChatParticipantDao;
import com.chatconnect.dao.UserDao;
import com.chatconnect.entity.Chat;
import com.chatconnect.entity.ChatParticipant;
import com.chatconnect.entity.User;
import java.util.List;
import java.util.Optional;

/**
 * Service layer for managing chats.
 */
public class ChatService {
    private final ChatDao chatDao = new ChatDao();
    private final ChatParticipantDao chatParticipantDao = new ChatParticipantDao();
    private final UserDao userDao = new UserDao();

    /**
     * Creates a private chat between two users.
     * @param requesterId the id of the user initiating the chat
     * @param otherUserId the id of the other participant
     * @return the created Chat entity
     */
    public Chat createChat(Long requesterId, Long otherUserId) {
        // Validate users exist
        User otherUser = userDao.findById(otherUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        // Ensure no existing chat
        List<Chat> existing = chatDao.findChatsBetweenUsers(requesterId, otherUserId);
        if (!existing.isEmpty()) {
            throw new IllegalArgumentException("Chat already exists");
        }
        // Save chat
        Chat chat = new Chat();
        chatDao.save(chat);
        // Add participants
        ChatParticipant p1 = new ChatParticipant();
        p1.setChat(chat);
        p1.setUser(userDao.findById(requesterId).orElseThrow(() -> new IllegalArgumentException("Requester not found")));
        chatParticipantDao.save(p1);
        ChatParticipant p2 = new ChatParticipant();
        p2.setChat(chat);
        p2.setUser(otherUser);
        chatParticipantDao.save(p2);
        return chat;
    }

    /**
     * Retrieves a chat by its id.
     */
    public Optional<Chat> getChat(Long chatId) {
        return chatDao.findById(chatId);
    }

    /**
     * Lists all chats for a given user.
     */
    public List<Chat> listChatsForUser(Long userId) {
        return chatDao.findByUserId(userId);
    }

    /**
     * Lists chats for a user with pagination.
     * @param userId the user identifier
     * @param page zero‑based page index
     * @param size number of records per page
     */
    public List<Chat> listChatsForUser(Long userId, int page, int size) {
        return chatDao.findByUserId(userId, page, size);
    }

    /**
     * Checks whether a user participates in a chat.
     */
    public boolean isUserInChat(Long chatId, Long userId) {
        return chatParticipantDao.isUserInChat(chatId, userId);
    }
}
