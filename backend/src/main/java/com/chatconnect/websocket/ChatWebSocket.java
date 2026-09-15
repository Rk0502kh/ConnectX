package com.chatconnect.websocket;

import com.chatconnect.dao.ChatDao;
import com.chatconnect.dao.ChatParticipantDao;
import com.chatconnect.dao.MessageDao;
import com.chatconnect.dao.UserDao;
import com.chatconnect.dto.ChatMessageDto;
import com.chatconnect.entity.Chat;
import com.chatconnect.entity.Message;
import com.chatconnect.entity.User;
import com.chatconnect.util.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.websocket.CloseReason;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import java.io.IOException;
import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.time.LocalDateTime;

@ServerEndpoint("/ws/chat")
public class ChatWebSocket {
    private static final Map<Long, Set<Session>> chatSessions = new ConcurrentHashMap<>();
    private static final Map<String, Long> sessionUserMap = new ConcurrentHashMap<>();
    private static final ObjectMapper mapper = new ObjectMapper();
    private static final MessageDao messageDao = new MessageDao();
    private static final ChatDao chatDao = new ChatDao();
    private static final UserDao userDao = new UserDao();
    private static final ChatParticipantDao chatParticipantDao = new ChatParticipantDao();
    private static final JwtUtil jwtUtil = new JwtUtil();

    @OnOpen
    public void onOpen(Session session) {
        String query = session.getQueryString();
        String token = null;
        if (query != null) {
            for (String param : query.split("&")) {
                String[] kv = param.split("=");
                if (kv.length == 2 && "token".equals(kv[0])) {
                    token = kv[1];
                    break;
                }
            }
        }
        if (token == null) {
            closeSession(session, CloseReason.CloseCodes.CANNOT_ACCEPT, "Missing token");
            return;
        }
        try {
            Long userId = jwtUtil.validateTokenAndGetUserId(token);
            sessionUserMap.put(session.getId(), userId);
        } catch (Exception e) {
            closeSession(session, CloseReason.CloseCodes.CANNOT_ACCEPT, "Invalid token");
        }
    }

    @OnMessage
    public void onMessage(String messageJson, Session session) {
        Long userId = sessionUserMap.get(session.getId());
        if (userId == null) {
            closeSession(session, CloseReason.CloseCodes.VIOLATED_POLICY, "Unauthenticated");
            return;
        }
        try {
            ChatMessageDto dto = mapper.readValue(messageJson, ChatMessageDto.class);
            if (dto.getChatId() == null || dto.getContent() == null || dto.getContent().trim().isEmpty()) {
                sendError(session, "Invalid payload");
                return;
            }
            boolean isParticipant = chatParticipantDao.isUserInChat(dto.getChatId(), userId);
            if (!isParticipant) {
                sendError(session, "User not part of chat");
                return;
            }
            if (dto.getContent().getBytes("UTF-8").length > 5 * 1024) {
                sendError(session, "Message too large");
                return;
            }
            Chat chat = chatDao.findById(dto.getChatId()).orElse(null);
            User sender = userDao.findById(userId).orElse(null);
            if (chat == null || sender == null) {
                sendError(session, "Chat or User not found");
                return;
            }

            Message msg = new Message();
            msg.setChat(chat);
            msg.setSender(sender);
            msg.setMessageText(dto.getContent());
            msg.setStatus(Message.Status.SENT);
            msg.setSentAt(LocalDateTime.now());
            messageDao.save(msg);

            Set<Session> sessions = chatSessions.computeIfAbsent(dto.getChatId(), k -> Collections.synchronizedSet(new HashSet<>()));
            sessions.add(session);
            ChatMessageDto outDto = new ChatMessageDto();
            outDto.setType("CHAT_MESSAGE");
            outDto.setChatId(dto.getChatId());
            outDto.setSenderId(userId);
            outDto.setContent(dto.getContent());
            outDto.setTimestamp(msg.getSentAt());
            String outJson = mapper.writeValueAsString(outDto);
            for (Session s : sessions) {
                if (s.isOpen()) {
                    s.getAsyncRemote().sendText(outJson);
                }
            }
        } catch (Exception e) {
            sendError(session, "Server error");
        }
    }

    @OnClose
    public void onClose(Session session, CloseReason reason) {
        sessionUserMap.remove(session.getId());
        for (Set<Session> set : chatSessions.values()) {
            set.remove(session);
        }
    }

    @OnError
    public void onError(Session session, Throwable throwable) {
        onClose(session, new CloseReason(CloseReason.CloseCodes.UNEXPECTED_CONDITION, "Error"));
    }

    private void sendError(Session session, String error) {
        try {
            session.getAsyncRemote().sendText("{\"error\":\"" + error + "\"}");
        } catch (Exception ignored) {}
    }

    private void closeSession(Session session, CloseReason.CloseCode code, String reason) {
        try {
            session.close(new CloseReason(code, reason));
        } catch (IOException ignored) {}
    }
}
