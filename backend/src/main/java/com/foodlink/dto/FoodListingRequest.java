package com.foodlink.dto;

import lombok.Data;

@Data
public class FoodListingRequest {
    private String title;
    private Double quantity;
    private String location;
    private String pickupTime;
    private String contactNumber;
}
