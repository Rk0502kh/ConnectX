package com.chatconnect.service;

import com.chatconnect.dao.ChatDao;
import com.chatconnect.dao.MessageDao;
import com.chatconnect.dao.UserDao;
import com.chatconnect.entity.Chat;
import com.chatconnect.entity.Message;
import com.chatconnect.entity.User;
import java.util.List;
import java.util.Optional;

/**
 * Service layer for handling chat messages.
 */
public class MessageService {
    private final MessageDao messageDao = new MessageDao();
    private final ChatDao chatDao = new ChatDao();
    private final UserDao userDao = new UserDao();

    /**
     * Persists a new message and returns the saved entity.
     *
     * @param chatId   the chat to which the message belongs
     * @param senderId the id of the user sending the message (already authenticated)
     * @param content  the text content of the message
     * @return the persisted Message
     * @throws IllegalArgumentException if the chat or user does not exist or content is invalid
     */
    public Message sendMessage(Long chatId, Long senderId, String content) {
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Message content required");
        }
        // Validate chat exists
        Chat chat = chatDao.findById(chatId)
                .orElseThrow(() -> new IllegalArgumentException("Chat not found"));
        // Validate sender exists
        User sender = userDao.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));
        // Create and persist message
        Message msg = new Message();
        msg.setChat(chat);
        msg.setSender(sender);
        msg.setMessageText(content);
        msg.setStatus(Message.Status.SENT);
        messageDao.save(msg);
        // Removed broadcast via WebSocket as it is handled elsewhere or ChatWebSocket needs to be fixed
        return msg;
    }

    /**
     * Retrieves all messages for a given chat.
     *
     * @param chatId the chat identifier
     * @return list of messages ordered by timestamp
     */
    public List<Message> getMessages(Long chatId) {
        // Validate chat existence (optional, could be omitted for performance)
        chatDao.findById(chatId).orElseThrow(() -> new IllegalArgumentException("Chat not found"));
        return messageDao.findByChatId(chatId);
    }

    /**
     * Retrieves all messages for a given chat with pagination.
     */
    public List<Message> getMessages(Long chatId, int page, int size) {
        chatDao.findById(chatId).orElseThrow(() -> new IllegalArgumentException("Chat not found"));
        return messageDao.findByChatIdPaginated(chatId, page, size);
    }
}
