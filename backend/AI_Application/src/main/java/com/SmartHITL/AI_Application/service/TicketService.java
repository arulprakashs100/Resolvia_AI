package com.SmartHITL.AI_Application.service;

import com.SmartHITL.AI_Application.entity.Ticket;
import com.SmartHITL.AI_Application.entity.User;
import com.SmartHITL.AI_Application.repository.TicketRepository;
import com.SmartHITL.AI_Application.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository   userRepository;

    public Ticket createTicket(Ticket ticketRequest) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Duplicate check: same title within last 5 minutes
        long dupeCount = ticketRepository.countRecentDuplicates(
                user, ticketRequest.getTitle(), LocalDateTime.now().minusMinutes(5));
        if (dupeCount > 0) {
            throw new RuntimeException("A similar ticket was already submitted in the last 5 minutes.");
        }

        Ticket ticket = new Ticket();
        ticket.setTitle(ticketRequest.getTitle());
        ticket.setDescription(ticketRequest.getDescription());
        ticket.setCategory(ticketRequest.getCategory());
        ticket.setStatus("OPEN");
        ticket.setPriority("MEDIUM");           // Default priority — admin can change later
        ticket.setAiConfidence(0);              // No AI integration — default 0
        ticket.setAiResolutionType(null);       // Will be set when admin resolves
        ticket.setUser(user);
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setTicketNumber("SR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        return ticketRepository.save(ticket);
    }

    public List<Ticket> getUserTickets() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ticketRepository.findByUserId(user.getId());
    }

    public Ticket getTicket(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));
    }
}