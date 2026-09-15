package com.chatconnect.dao;

import com.chatconnect.entity.Chat;
import com.chatconnect.util.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.hibernate.query.Query;
import java.util.List;
import java.util.Optional;

/**
 * Data Access Object for Chat entity.
 */
public class ChatDao {

    /**
     * Persist a new Chat entity and return the persisted instance.
     */
    public Chat save(Chat chat) {
        Transaction tx = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            tx = session.beginTransaction();
            session.save(chat);
            tx.commit();
            return chat;
        } catch (Exception e) {
            if (tx != null) tx.rollback();
            throw e;
        }
    }

    public Optional<Chat> findById(Long id) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return Optional.ofNullable(session.get(Chat.class, id));
        }
    }

    public List<Chat> findChatsBetweenUsers(Long userId1, Long userId2) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<Chat> query = session.createQuery(
                "select c from Chat c join c.participants p1 join c.participants p2 where p1.user.id = :uid1 and p2.user.id = :uid2", Chat.class);
            query.setParameter("uid1", userId1);
            query.setParameter("uid2", userId2);
            return query.list();
        }
    }

    public List<Chat> findAll() {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.createQuery("from Chat", Chat.class).list();
        }
    }

    /**
     * Find all chats that a given user participates in.
     */
    public List<Chat> findByUserId(Long userId) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<Chat> query = session.createQuery(
                "select cp.chat from ChatParticipant cp where cp.user.id = :userId", Chat.class);
            query.setParameter("userId", userId);
            return query.list();
        }
    }

    /**
     * Paginated version of findByUserId.
     * @param userId the user identifier
     * @param page zero‑based page index
     * @param size number of records per page
     */
    public List<Chat> findByUserId(Long userId, int page, int size) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<Chat> query = session.createQuery(
                "select cp.chat from ChatParticipant cp where cp.user.id = :userId", Chat.class);
            query.setParameter("userId", userId);
            query.setFirstResult(page * size);
            query.setMaxResults(size);
            return query.list();
        }
    }
    public void update(Chat chat) {
        Transaction tx = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            tx = session.beginTransaction();
            session.update(chat);
            tx.commit();
        } catch (Exception e) {
            if (tx != null) tx.rollback();
            throw e;
        }
    }

    public void delete(Chat chat) {
        Transaction tx = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            tx = session.beginTransaction();
            session.delete(chat);
            tx.commit();
        } catch (Exception e) {
            if (tx != null) tx.rollback();
            throw e;
        }
    }
}
