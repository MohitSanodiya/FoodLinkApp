package com.foodlink.controller;

import com.foodlink.dto.AuthResponse;
import com.foodlink.dto.LoginRequest;
import com.foodlink.dto.RegisterRequest;
import com.foodlink.model.User;
import com.foodlink.model.Role;
import com.foodlink.model.Status;
import com.foodlink.repository.UserRepository;
import com.foodlink.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtil jwtUtil;

    @SuppressWarnings("null")
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        if (userRepository.findByEmail(signUpRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("error", "Error: Email is already in use!"));
        }

        User user = User.builder()
                .name(signUpRequest.getName())
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .location(signUpRequest.getLocation())
                .role(signUpRequest.getRole())
                .status(Status.PENDING)
                .isVerified(false)
                .isDeleted(false)
                .build();

        userRepository.save(user);

        return ResponseEntity.ok(Collections.singletonMap("message", "User registered successfully! Account is under verification."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + loginRequest.getEmail()));

        // Check if user is inactive (Block login for non-admins)
        if (user.getRole() != Role.ADMIN) {
            if (user.getStatus() == Status.PENDING) {
                return ResponseEntity.status(403).body(Collections.singletonMap("error", "Account under verification"));
            } else if (user.getStatus() == Status.REJECTED) {
                return ResponseEntity.status(403).body(Collections.singletonMap("error", "Account rejected"));
            } else if (user.getStatus() == Status.SUSPENDED) {
                return ResponseEntity.status(403).body(Collections.singletonMap("error", "Account suspended"));
            }
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        String jwt = jwtUtil.generateToken(userDetails);

        return ResponseEntity.ok(new AuthResponse(jwt,
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getLocation(),
                user.getRole().name(),
                user.getStatus().name()));
    }
}
