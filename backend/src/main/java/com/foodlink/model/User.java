package com.foodlink.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    
    @Column(unique = true)
    private String email;
    private String password;
    
    private String location; // lowercase city match

    @Enumerated(EnumType.STRING)
    private Role role;

    @Enumerated(EnumType.STRING)
    private Status status;

    private Boolean isVerified;
    private Boolean isDeleted;

    @PrePersist
    @PreUpdate
    public void convertLowercase() {
        if (location != null) {
            this.location = location.toLowerCase();
        }
    }
}
