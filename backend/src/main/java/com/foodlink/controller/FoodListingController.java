package com.foodlink.controller;

import com.foodlink.dto.FoodListingRequest;
import com.foodlink.model.FoodListing;
import com.foodlink.service.FoodListingService;
import com.foodlink.model.User;
import com.foodlink.model.Status;
import com.foodlink.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import com.foodlink.dto.DonationRequestDTO;
import com.foodlink.service.DonationRequestService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/hostels")
@PreAuthorize("hasAnyAuthority('ROLE_HOSTEL', 'ROLE_HOTEL')")
public class FoodListingController {

    @Autowired
    private FoodListingService foodListingService;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DonationRequestService donationRequestService;

    @PostMapping("/foods")
    public ResponseEntity<FoodListing> createListing(@Valid @RequestBody FoodListingRequest request, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getStatus() != Status.ACTIVE) {
            throw new RuntimeException("Your account is not active. Status: " + user.getStatus());
        }
                
        FoodListing listing = foodListingService.createListing(
                user.getId(),
                request.getTitle(),
                request.getQuantity(),
                request.getLocation(),
                request.getPickupTime(),
                request.getContactNumber()
        );
        return ResponseEntity.ok(listing);
    }

    @GetMapping("/history")
    public ResponseEntity<Page<DonationRequestDTO>> getHistory(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        Page<DonationRequestDTO> requests = donationRequestService.getRequestsForHostel(user.getId(), pageable);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/stats")
    public ResponseEntity<java.util.Map<String, Object>> getStats(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        return ResponseEntity.ok(donationRequestService.getHostelStats(user.getId()));
    }
}
