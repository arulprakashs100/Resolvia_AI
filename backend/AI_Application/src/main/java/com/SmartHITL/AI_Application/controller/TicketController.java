package com.SmartHITL.AI_Application.controller;

import com.SmartHITL.AI_Application.entity.Ticket;
import com.SmartHITL.AI_Application.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {
    private final TicketService ticketService;

    @PostMapping
    public Ticket createTicket(@RequestBody Ticket request) {
        return ticketService.createTicket(request);
    }

    @GetMapping("/my")
    public List<Ticket> getMyTickets() {
        return ticketService.getUserTickets();
    }

    @GetMapping("/{id}")
    public Ticket getTicket(@PathVariable Long id) {
        return ticketService.getTicket(id);
    }
}
