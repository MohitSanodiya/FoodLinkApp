package com.foodlink.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DonationRequestDTO {
    private Long id;
    private String foodTitle;
    private String hostelName;
    private String ngoName;
    private String status;
    private LocalDateTime createdAt;
    private String requestAge;
    private String pickupTime;
    private String contactNumber;
}
