package com.foodlink.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String name;
    private String location;
    private String role;
    private String status;
    
    public AuthResponse(String token, Long id, String email, String name, String location, String role, String status) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.name = name;
        this.location = location;
        this.role = role;
        this.status = status;
    }
}
