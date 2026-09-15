-- -------------------------------------------------
-- Sample data for ChatConnect development
-- -------------------------------------------------

-- Users (passwords are bcrypt hashes of " Password123!\)
INSERT INTO users (username, email, password_hash, contact_number, profile_image, created_at, updated_at, online_status)
VALUES
('Alice', 'alice@example.com', '', '555-0101', NULL, NOW(), NOW(), 'offline'),
('Bob', 'bob@example.com', '', '555-0102', NULL, NOW(), NOW(), 'offline'),
('Charlie', 'charlie@example.com', '', '555-0103', NULL, NOW(), NOW(), 'offline');

-- Chats (private conversations)
INSERT INTO chats (created_at, updated_at)
VALUES
(NOW(), NOW()), -- chat 1 (Alice ↔ Bob)
(NOW(), NOW()), -- chat 2 (Alice ↔ Charlie)
(NOW(), NOW()); -- chat 3 (Bob ↔ Charlie)

-- Chat participants
INSERT INTO chat_participants (chat_id, user_id)
VALUES
(1, 1), -- Alice in chat 1
(1, 2), -- Bob in chat 1
(2, 1), -- Alice in chat 2
(2, 3), -- Charlie in chat 2
(3, 2), -- Bob in chat 3
(3, 3); -- Charlie in chat 3

-- Messages (status values: SENT, DELIVERED, READ)
INSERT INTO messages (chat_id, sender_id, message_text, sent_at, status)
VALUES
-- Chat 1
(1, 1, 'Hey Bob! How are you?', NOW(), 'SENT'),
(1, 2, 'Hi Alice! I’m good, thanks. You?', NOW(), 'DELIVERED'),

-- Chat 2
(2, 1, 'Hello Charlie, nice to meet you.', NOW(), 'SENT'),
(2, 3, 'Hey Alice! Same here.', NOW(), 'DELIVERED'),

-- Chat 3
(3, 2, 'Charlie, did you finish the assignment?', NOW(), 'SENT'),
(3, 3, 'Almost done, should be ready tomorrow.', NOW(), 'DELIVERED');
