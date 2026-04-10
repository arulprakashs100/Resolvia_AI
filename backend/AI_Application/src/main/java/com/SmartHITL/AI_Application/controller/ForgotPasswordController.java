package com.SmartHITL.AI_Application.controller;

import com.SmartHITL.AI_Application.dto.ForgotPasswordRequestDTO;
import com.SmartHITL.AI_Application.dto.ResetPasswordRequestDTO;
import com.SmartHITL.AI_Application.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class ForgotPasswordController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequestDTO request) {
        boolean exists = passwordResetService.checkEmailExists(request.getEmail());

        if (!exists) {
            throw new RuntimeException("Email not registered");
        }
        return ResponseEntity.ok("Email verified");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequestDTO request) {
        passwordResetService.resetPassword(request.getEmail(), request.getNewPassword());
        return ResponseEntity.ok("Password reset successful");
    }
}
