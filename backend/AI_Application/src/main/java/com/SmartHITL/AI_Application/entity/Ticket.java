package com.SmartHITL.AI_Application.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name="tickets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String ticketNumber;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String category;

    private String status;

    // Priority: HIGH, MEDIUM, LOW — set by admin or defaulted to MEDIUM on creation
    private String priority;

    // AI solution text — populated when admin resolves the ticket
    @Column(columnDefinition = "TEXT")
    private String solution;

    // Resolution type: AUTO, AI_HUMAN, NON_TECHNICAL, MANUAL
    // Without AI integration, admin sets this manually; default null = MANUAL
    private String aiResolutionType;

    // AI confidence score (0-100). Without AI, defaults to 0
    private Integer aiConfidence;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name="user_id")
    private User user;
}