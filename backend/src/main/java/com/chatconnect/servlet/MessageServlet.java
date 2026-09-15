package com.chatconnect.servlet;

import com.chatconnect.entity.Message;
import com.chatconnect.service.AuthService;
import com.chatconnect.service.MessageService;
import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

/**
 * REST endpoints for message handling using MessageService.
 */
@WebServlet(name = "MessageServlet", urlPatterns = {"/api/chats/*/messages"})
public class MessageServlet extends HttpServlet {
    private final MessageService messageService = new MessageService();
    private final AuthService authService = new AuthService(
            new com.chatconnect.dao.UserDao(),
            new com.chatconnect.util.JwtUtil()
    );
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        Long requesterId = (Long) req.getAttribute("userId");
        String path = req.getPathInfo(); // expects "/{chatId}/messages"
        if (path == null) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write(gson.toJson(new ApiResponse(false, "Missing chatId", null)));
            return;
        }
        String[] parts = path.split("/");
        if (parts.length < 2) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write(gson.toJson(new ApiResponse(false, "Invalid path", null)));
            return;
        }
        Long chatId;
        try {
            chatId = Long.parseLong(parts[1]);
        } catch (NumberFormatException e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write(gson.toJson(new ApiResponse(false, "Invalid chatId", null)));
            return;
        }
        // Verify participation via MessageService (throws if not allowed)
        // Pagination parameters (default page=1, size=20)
        int page = 1;
        int size = 20;
        String pageParam = req.getParameter("page");
        String sizeParam = req.getParameter("size");
        try {
            if (pageParam != null) page = Integer.parseInt(pageParam);
            if (sizeParam != null) size = Integer.parseInt(sizeParam);
        } catch (NumberFormatException e) {
            // ignore and use defaults
        }
        List<Message> messages = messageService.getMessages(chatId, page, size);
        resp.setStatus(HttpServletResponse.SC_OK);
        resp.getWriter().write(gson.toJson(new ApiResponse(true, "Messages retrieved", messages)));
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        Long requesterId = (Long) req.getAttribute("userId");
        String path = req.getPathInfo(); // "/{chatId}/messages"
        if (path == null) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write(gson.toJson(new ApiResponse(false, "Missing chatId", null)));
            return;
        }
        String[] parts = path.split("/");
        if (parts.length < 2) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write(gson.toJson(new ApiResponse(false, "Invalid path", null)));
            return;
        }
        Long chatId;
        try {
            chatId = Long.parseLong(parts[1]);
        } catch (NumberFormatException e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write(gson.toJson(new ApiResponse(false, "Invalid chatId", null)));
            return;
        }
        MessageRequest mr = gson.fromJson(req.getReader(), MessageRequest.class);
        if (mr == null || mr.getContent() == null || mr.getContent().isBlank()) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write(gson.toJson(new ApiResponse(false, "Message content required", null)));
            return;
        }
        try {
            Message msg = messageService.sendMessage(chatId, requesterId, mr.getContent());
            resp.setStatus(HttpServletResponse.SC_CREATED);
            resp.getWriter().write(gson.toJson(new ApiResponse(true, "Message sent", msg)));
        } catch (IllegalArgumentException e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write(gson.toJson(new ApiResponse(false, e.getMessage(), null)));
        }
    }

    private static class MessageRequest {
        private String content;
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
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
