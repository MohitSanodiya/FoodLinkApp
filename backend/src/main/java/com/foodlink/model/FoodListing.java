package com.foodlink.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "food_listings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodListing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private Double quantity;
    private String location; 
    private String pickupTime;
    private String contactNumber; 

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    @PrePersist
    @PreUpdate
    public void convertLowercase() {
        if (location != null) {
            this.location = location.toLowerCase();
        }
    }
}
