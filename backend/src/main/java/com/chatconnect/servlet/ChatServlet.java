package com.chatconnect.servlet;

import com.chatconnect.entity.Chat;
import com.chatconnect.entity.User;
import com.chatconnect.service.AuthService;
import com.chatconnect.service.ChatService;
import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

/**
 * REST endpoints for chat management using the ChatService.
 */
@WebServlet(name = "ChatServlet", urlPatterns = {"/api/chats/*"})
public class ChatServlet extends HttpServlet {
    private final ChatService chatService = new ChatService();
    private final AuthService authService = new AuthService(
            new com.chatconnect.dao.UserDao(),
            new com.chatconnect.util.JwtUtil()
    );
    private final Gson gson = new Gson();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        Long requesterId = (Long) req.getAttribute("userId"); // set by JwtAuthFilter
        ChatRequest chatRequest = gson.fromJson(req.getReader(), ChatRequest.class);
        if (chatRequest == null || chatRequest.getUserId() == null) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write(gson.toJson(new ApiResponse(false, "Missing userId", null)));
            return;
        }
        try {
            Chat chat = chatService.createChat(requesterId, chatRequest.getUserId());
            resp.setStatus(HttpServletResponse.SC_CREATED);
            resp.getWriter().write(gson.toJson(new ApiResponse(true, "Chat created", chat)));
        } catch (IllegalArgumentException e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write(gson.toJson(new ApiResponse(false, e.getMessage(), null)));
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo(); // may be null or "/{id}"
        Long requesterId = (Long) req.getAttribute("userId");
        if (pathInfo == null || pathInfo.equals("/")) {
            // List chats for user
            List<Chat> chats = chatService.listChatsForUser(requesterId);
            resp.setStatus(HttpServletResponse.SC_OK);
            resp.getWriter().write(gson.toJson(new ApiResponse(true, "Chats retrieved", chats)));
        } else {
            try {
                Long chatId = Long.parseLong(pathInfo.substring(1));
                Optional<Chat> chatOpt = chatService.getChat(chatId);
                if (chatOpt.isEmpty()) {
                    resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    resp.getWriter().write(gson.toJson(new ApiResponse(false, "Chat not found", null)));
                    return;
                }
                // Verify requester is participant
                if (!chatService.isUserInChat(chatId, requesterId)) {
                    resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    resp.getWriter().write(gson.toJson(new ApiResponse(false, "Access denied", null)));
                    return;
                }
                resp.setStatus(HttpServletResponse.SC_OK);
                resp.getWriter().write(gson.toJson(new ApiResponse(true, "Chat details", chatOpt.get())));
            } catch (NumberFormatException e) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write(gson.toJson(new ApiResponse(false, "Invalid chat id", null)));
            }
        }
    }

    // Helper DTOs
    private static class ChatRequest {
        private Long userId;
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
    }

    private static class ApiResponse {
        private boolean success;
        private String message;
        private Object data;
        public ApiResponse(boolean success, String message, Object data) {
            this.success = success; this.message = message; this.data = data;
        }
        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public Object getData() { return data; }
    }
}
