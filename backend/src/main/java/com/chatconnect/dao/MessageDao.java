package com.chatconnect.dao;

import com.chatconnect.entity.Message;
import com.chatconnect.util.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.hibernate.query.Query;
import java.util.List;

/**
 * Data Access Object for Message entity.
 */
public class MessageDao {

    /**
     * Persist a new Message and return the persisted entity.
     */
    public Message save(Message message) {
        Transaction tx = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            tx = session.beginTransaction();
            session.save(message);
            tx.commit();
            return message;
        } catch (Exception e) {
            if (tx != null) tx.rollback();
            throw e;
        }
    }

    public Message findById(Long id) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.get(Message.class, id);
        }
    }

    public List<Message> findAll() {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.createQuery("from Message", Message.class).list();
        }
    }

    public List<Message> findByChatId(Long chatId) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<Message> query = session.createQuery(
                "from Message m where m.chat.id = :chatId", Message.class);
            query.setParameter("chatId", chatId);
            return query.list();
        }
    }

    /**
     * Retrieves paginated messages for a chat ordered by timestamp descending.
     * @param chatId the chat identifier
     * @param page   page number (1‑based)
     * @param size   page size
     * @return list of messages for the given page
     */
    public java.util.List<Message> findByChatIdPaginated(Long chatId, int page, int size) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<Message> query = session.createQuery(
                "from Message m where m.chat.id = :chatId order by m.sentAt desc", Message.class);
            query.setParameter("chatId", chatId);
            query.setFirstResult((page - 1) * size);
            query.setMaxResults(size);
            return query.list();
        }
    }

    public void update(Message message) {
        Transaction tx = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            tx = session.beginTransaction();
            session.update(message);
            tx.commit();
        } catch (Exception e) {
            if (tx != null) tx.rollback();
            throw e;
        }
    }

    public void delete(Message message) {
        Transaction tx = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            tx = session.beginTransaction();
            session.delete(message);
            tx.commit();
        } catch (Exception e) {
            if (tx != null) tx.rollback();
            throw e;
        }
    }
}
