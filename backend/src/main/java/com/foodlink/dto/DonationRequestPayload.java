package com.foodlink.dto;

import lombok.Data;

@Data
public class DonationRequestPayload {
    private Long foodListingId;
    private Long ngoId;
}
