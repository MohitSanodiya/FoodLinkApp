package com.foodlink.service;

import com.foodlink.model.FoodListing;
import com.foodlink.model.User;
import com.foodlink.repository.FoodListingRepository;
import com.foodlink.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FoodListingService {

    @Autowired
    private FoodListingRepository foodListingRepository;

    @Autowired
    private UserRepository userRepository;

    @SuppressWarnings("null")
    public FoodListing createListing(Long userId, String title, Double quantity, String location, String pickupTime,
            String contactNumber) {
        @SuppressWarnings("null")
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FoodListing listing = FoodListing.builder()
                .title(title)
                .quantity(quantity)
                .location(location) // Will be lowercase due to @PrePersist
                .pickupTime(pickupTime)
                .contactNumber(contactNumber)
                .createdBy(user)
                .build();

        return foodListingRepository.save(listing);
    }

    public List<FoodListing> getListingsByProvider(Long providerId) {
        return foodListingRepository.findByCreatedBy_Id(providerId);
    }
}
