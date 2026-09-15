# Backend (Java Servlet)

## Overview

This is the backend for **ChatConnect**. It implements a REST API and WebSocket endpoint using Java Servlets, Hibernate ORM, and JWT authentication.

## Build

`ash
cd backend
mvn clean package
`

The generated WAR (	arget/chatconnect.war) can be deployed to Apache Tomcat (v9+).

## Configuration

Edit src/main/resources/hibernate.cfg.xml to point to your MySQL database.

## Running

1. Start MySQL and create the database using ../database/schema.sql and ../database/sample_data.sql.
2. Deploy the WAR to Tomcat.
3. The API will be available at http://localhost:8080/chatconnect/api/... and the WebSocket at ws://localhost:8080/chatconnect/ws/chat.

## Endpoints

- **Auth**: /api/auth/register, /api/auth/login, /api/auth/logout
- **Users**: /api/users, /api/users/{id}
- **Chats**: /api/chats, /api/chats/{id}
- **Messages**: /api/chats/{chatId}/messages

## Testing

Run unit tests with:
`ash
mvn test
`

## Documentation

See the docs/ folder for architecture diagrams and API docs.
