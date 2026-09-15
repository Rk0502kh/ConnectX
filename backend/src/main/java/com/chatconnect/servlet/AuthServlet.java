package com.chatconnect.servlet;

import com.chatconnect.entity.User;
import com.chatconnect.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@WebServlet(name = "AuthServlet", urlPatterns = {"/api/auth/*"})
public class AuthServlet extends HttpServlet {

    private AuthService authService;
    private ObjectMapper mapper = new ObjectMapper();

    @Override
    public void init() throws ServletException {
        // Obtain DAO and JwtUtil from servlet context or create new instances
        // For simplicity, we create new instances here assuming they have default constructors.
        // In a real project use dependency injection.
        authService = new AuthService(
                (com.chatconnect.dao.UserDao) getServletContext().getAttribute("userDao"),
                (com.chatconnect.util.JwtUtil) getServletContext().getAttribute("jwtUtil")
        );
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String path = req.getPathInfo(); // after /api/auth
        resp.setContentType("application/json");
        Map<String, Object> response = new HashMap<>();
        try {
            if ("/register".equals(path)) {
                Map<String, String> body = mapper.readValue(req.getReader(), Map.class);
                String username = body.get("username");
                String email = body.get("email");
                String password = body.get("password");
                String contactNumber = body.get("contactNumber");
                User user = authService.register(username, email, password, contactNumber);
                response.put("success", true);
                response.put("message", "User registered successfully");
                response.put("data", Map.of("userId", user.getId()));
                resp.setStatus(HttpServletResponse.SC_CREATED);
            } else if ("/login".equals(path)) {
                Map<String, String> body = mapper.readValue(req.getReader(), Map.class);
                String email = body.get("email");
                String password = body.get("password");
                String token = authService.login(email, password);
                response.put("success", true);
                response.put("message", "Login successful");
                response.put("data", Map.of("token", token));
                resp.setStatus(HttpServletResponse.SC_OK);
            } else {
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.put("success", false);
                response.put("message", "Endpoint not found");
            }
        } catch (IllegalArgumentException e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.put("success", false);
            response.put("message", e.getMessage());
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.put("success", false);
            response.put("message", "Server error");
        }
        mapper.writeValue(resp.getWriter(), response);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // Protected endpoint to get current user info
        String path = req.getPathInfo();
        resp.setContentType("application/json");
        Map<String, Object> response = new HashMap<>();
        if ("/me".equals(path)) {
            Long userId = (Long) req.getAttribute("userId");
            if (userId == null) {
                resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.put("success", false);
                response.put("message", "Unauthorized");
            } else {
                User user = authService.getUserById(userId).orElse(null);
                if (user == null) {
                    resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    response.put("success", false);
                    response.put("message", "User not found");
                } else {
                    resp.setStatus(HttpServletResponse.SC_OK);
                    response.put("success", true);
                    response.put("message", "User info retrieved");
                    response.put("data", Map.of(
                            "id", user.getId(),
                            "username", user.getUsername(),
                            "email", user.getEmail(),
                            "contactNumber", user.getContactNumber(),
                            "profileImage", user.getProfileImage()
                    ));
                }
            }
        } else {
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
            response.put("success", false);
            response.put("message", "Endpoint not found");
        }
        mapper.writeValue(resp.getWriter(), response);
    }
}
