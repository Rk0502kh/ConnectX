package com.chatconnect.servlet;

import com.chatconnect.dao.UserDao;
import com.chatconnect.entity.User;
import com.chatconnect.service.AuthService;
import com.chatconnect.util.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@WebServlet(name = "UserServlet", urlPatterns = {"/api/users/*"})
public class UserServlet extends HttpServlet {
    private final UserDao userDao = new UserDao();
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();
        resp.setContentType("application/json");
        if (pathInfo == null || "/".equals(pathInfo)) {
            // List all users
            resp.getWriter().write(mapper.writeValueAsString(userDao.findAll()));
        } else {
            // Get user by ID
            try {
                Long id = Long.parseLong(pathInfo.substring(1));
                User user = userDao.findById(id).orElse(null);
                if (user != null) {
                    resp.getWriter().write(mapper.writeValueAsString(user));
                } else {
                    resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    resp.getWriter().write("{\"error\":\"User not found\"}");
                }
            } catch (NumberFormatException e) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"error\":\"Invalid user ID\"}");
            }
        }
    }
}
