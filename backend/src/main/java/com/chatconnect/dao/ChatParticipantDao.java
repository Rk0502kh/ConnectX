package com.chatconnect.dao;

import com.chatconnect.entity.ChatParticipant;
import com.chatconnect.util.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.hibernate.query.Query;
import java.util.List;

/**
 * Data Access Object for ChatParticipant entity.
 */
public class ChatParticipantDao {

    public ChatParticipant save(ChatParticipant participant) {
        Transaction tx = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            tx = session.beginTransaction();
            session.save(participant);
            tx.commit();
            return participant;
        } catch (Exception e) {
            if (tx != null) tx.rollback();
            throw e;
        }
    }

    public ChatParticipant findById(Long id) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.get(ChatParticipant.class, id);
        }
    }

    public List<ChatParticipant> findAll() {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.createQuery("from ChatParticipant", ChatParticipant.class).list();
        }
    }

    /**
     * Find participants of a given chat.
     */
    public List<ChatParticipant> findByChatId(Long chatId) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<ChatParticipant> query = session.createQuery(
                "from ChatParticipant cp where cp.chat.id = :chatId", ChatParticipant.class);
            query.setParameter("chatId", chatId);
            return query.list();
        }
    }

    /**
     * Find a participant record for a specific user in a specific chat.
     */
    public ChatParticipant findByChatIdAndUserId(Long chatId, Long userId) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<ChatParticipant> query = session.createQuery(
                "from ChatParticipant cp where cp.chat.id = :chatId and cp.user.id = :userId", ChatParticipant.class);
            query.setParameter("chatId", chatId);
            query.setParameter("userId", userId);
            return query.uniqueResult();
        }
    }

    /**
     * Check if a user participates in a given chat.
     */
    public boolean isUserInChat(Long chatId, Long userId) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<Long> query = session.createQuery(
                "select count(cp.id) from ChatParticipant cp where cp.chat.id = :chatId and cp.user.id = :userId",
                Long.class);
            query.setParameter("chatId", chatId);
            query.setParameter("userId", userId);
            Long count = query.uniqueResult();
            return count != null && count > 0;
        }
    }

    public void delete(ChatParticipant participant) {
        Transaction tx = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            tx = session.beginTransaction();
            session.delete(participant);
            tx.commit();
        } catch (Exception e) {
            if (tx != null) tx.rollback();
            throw e;
        }
    }
}
