package com.SmartHITL.AI_Application.repository;

import com.SmartHITL.AI_Application.entity.Ticket;
import com.SmartHITL.AI_Application.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByUser(User user);

    List<Ticket> findByUserId(Long id);

    long countByStatus(String status);

    // Duplicate check: same user, same title, within last 5 minutes
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.user = :user " +
           "AND LOWER(t.title) = LOWER(:title) " +
           "AND t.createdAt >= :since")
    long countRecentDuplicates(@Param("user") User user,
                               @Param("title") String title,
                               @Param("since") LocalDateTime since);
}
