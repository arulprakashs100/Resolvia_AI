package com.SmartHITL.AI_Application.dto;

import jakarta.validation.constraints.*;

public record RegisterRequestDTO(

        @NotBlank
        String name,

        @Email
        @NotBlank
        String email,

        @Pattern(
                regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&]).{8,}$",
                message = "Password must contain 8 characters, a number and a symbol"
        )
        String password,

        @NotBlank
        String role
) {}