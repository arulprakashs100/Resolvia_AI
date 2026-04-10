package com.SmartHITL.AI_Application.service;

import com.SmartHITL.AI_Application.dto.AuthResponseDTO;
import com.SmartHITL.AI_Application.dto.LoginRequestDTO;
import com.SmartHITL.AI_Application.dto.RegisterRequestDTO;
import com.SmartHITL.AI_Application.entity.Role;
import com.SmartHITL.AI_Application.entity.User;
import com.SmartHITL.AI_Application.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO request) {

        // Check duplicate email
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        String email = request.email();
        String requestedRole = request.role().toUpperCase();

        // STRICT EMAIL DOMAIN VALIDATION
        String emailDomain = email.substring(email.indexOf("@") + 1).toLowerCase();
        if (emailDomain.equals("ggmail.com") || emailDomain.equals("gamil.com") ||
                emailDomain.equals("gmaill.com") || emailDomain.equals("gmail.co") ||
                emailDomain.startsWith("gggg")) {
            throw new RuntimeException("Invalid email domain provided. Please enter a valid email address.");
        }

        // STRICT ADMIN VALIDATION
        if (requestedRole.equals("ADMIN") && !email.endsWith("@admin.com")) {
            throw new RuntimeException("Only @admin.com email addresses can register as ADMIN");
        }

        Role role = Role.valueOf(requestedRole);

        User user = User.builder()
                .name(request.name())
                .email(email)
                .password(passwordEncoder.encode(request.password()))
                .role(role)
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail(), role.name());

        return new AuthResponseDTO(
                token,
                role.name(),
                "Registration successful"
        );
    }

    public AuthResponseDTO login(LoginRequestDTO request) {

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole().name()
        );

        return new AuthResponseDTO(
                token,
                user.getRole().name(),
                "Login successful"
        );
    }
}