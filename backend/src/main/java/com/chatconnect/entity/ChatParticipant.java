package com.chatconnect.entity;

import javax.persistence.*;

@Entity
@Table(name = "chat_participants",
       uniqueConstraints = {@UniqueConstraint(columnNames = {"chat_id", "user_id"})})
public class ChatParticipant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_id", nullable = false)
    private Chat chat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Chat getChat() { return chat; }
    public void setChat(Chat chat) { this.chat = chat; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
