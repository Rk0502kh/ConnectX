package com.chatconnect.filter;

import com.chatconnect.util.JwtUtil;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

public class JwtAuthFilter implements Filter {

    private JwtUtil jwtUtil;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // Retrieve JwtUtil from servlet context if set, otherwise create a new instance
        Object util = filterConfig.getServletContext().getAttribute("jwtUtil");
        if (util instanceof JwtUtil) {
            this.jwtUtil = (JwtUtil) util;
        } else {
            this.jwtUtil = new JwtUtil();
        }
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest httpReq = (HttpServletRequest) request;
        HttpServletResponse httpRes = (HttpServletResponse) response;
        String path = httpReq.getRequestURI();
        // Allow unauthenticated access to auth endpoints and static resources
        if (path.startsWith(httpReq.getContextPath() + "/api/auth")) {
            chain.doFilter(request, response);
            return;
        }
        String authHeader = httpReq.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            httpRes.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpRes.setContentType("application/json");
            httpRes.getWriter().write("{\"success\":false,\"message\":\"Missing or invalid Authorization header\"}");
            return;
        }
        String token = authHeader.substring(7);
        try {
            Long userId = jwtUtil.validateTokenAndGetUserId(token);
            // Attach userId for downstream servlets
            httpReq.setAttribute("userId", userId);
            chain.doFilter(request, response);
        } catch (Exception e) {
            httpRes.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpRes.setContentType("application/json");
            httpRes.getWriter().write("{\"success\":false,\"message\":\"Invalid token\"}");
        }
    }

    @Override
    public void destroy() {
        // No resources to clean up
    }
}
