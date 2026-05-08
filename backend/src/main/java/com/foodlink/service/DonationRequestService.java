package com.foodlink.service;

import com.foodlink.dto.DonationRequestDTO;
import com.foodlink.model.DonationRequest;
import com.foodlink.model.FoodListing;
import com.foodlink.model.RequestStatus;
import com.foodlink.model.User;
import com.foodlink.repository.DonationRequestRepository;
import com.foodlink.repository.FoodListingRepository;
import com.foodlink.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class DonationRequestService {

    @Autowired
    private DonationRequestRepository donationRequestRepository;

    @Autowired
    private FoodListingRepository foodListingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SmsNotificationService smsNotificationService;

    @SuppressWarnings("null")
    public void createRequest(Long foodListingId, Long ngoId, Long hostelId) {
        if (donationRequestRepository.existsByFoodListingIdAndNgoId(foodListingId, ngoId)) {
            throw new RuntimeException("Already notified");
        }

        @SuppressWarnings("null")
        FoodListing foodListing = foodListingRepository.findById(foodListingId)
                .orElseThrow(() -> new RuntimeException("Food Listing not found"));

        @SuppressWarnings("null")
        User ngo = userRepository.findById(ngoId)
                .orElseThrow(() -> new RuntimeException("NGO not found"));

        @SuppressWarnings("null")
        User hostel = userRepository.findById(hostelId)
                .orElseThrow(() -> new RuntimeException("Hostel User not found"));

        DonationRequest request = DonationRequest.builder()
                .foodListing(foodListing)
                .ngo(ngo)
                .createdBy(hostel)
                .status(RequestStatus.PENDING)
                .build();

        donationRequestRepository.save(request);
    }

    public Page<DonationRequestDTO> getRequestsForOrg(Long ngoId, String statusFilter, Pageable pageable) {
        Page<DonationRequest> requests;

        if (statusFilter != null && !statusFilter.isEmpty()) {
            RequestStatus status = RequestStatus.valueOf(statusFilter.toUpperCase());
            requests = donationRequestRepository.findByNgoIdAndStatusOrderByCreatedAtDesc(ngoId, status, pageable);
        } else {
            requests = donationRequestRepository.findByNgoIdOrderByCreatedAtDesc(ngoId, pageable);
        }

        return requests.map(this::mapToDTO);
    }

    public Page<DonationRequestDTO> getRequestsForHostel(Long hostelId, Pageable pageable) {
        Page<DonationRequest> requests = donationRequestRepository.findByCreatedByIdOrderByCreatedAtDesc(hostelId, pageable);
        return requests.map(this::mapToDTO);
    }

    private DonationRequestDTO mapToDTO(DonationRequest req) {
        java.time.Duration duration = java.time.Duration.between(req.getCreatedAt(), java.time.LocalDateTime.now());
        long hours = duration.toHours();
        String age = hours > 0 ? hours + " hours ago" : duration.toMinutes() + " mins ago";
        
        return new DonationRequestDTO(
                req.getId(),
                req.getFoodListing().getTitle(),
                req.getCreatedBy().getName(),
                req.getNgo().getName(),
                req.getStatus().name(),
                req.getCreatedAt(),
                age,
                req.getFoodListing().getPickupTime(),
                req.getFoodListing().getContactNumber()
        );
    }

    public void handleResponse(Long requestId, Long ngoId, String statusStr) {
        @SuppressWarnings("null")
        DonationRequest request = donationRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getNgo().getId().equals(ngoId)) {
            throw new RuntimeException("Unauthorized to update this request");
        }

        if (request.getStatus() == RequestStatus.EXPIRED) {
            throw new RuntimeException("Request already expired");
        }

        RequestStatus newStatus = RequestStatus.valueOf(statusStr.toUpperCase());
        
        if (newStatus == RequestStatus.ACCEPTED) {
            if (donationRequestRepository.existsByFoodListingIdAndStatus(request.getFoodListing().getId(), RequestStatus.ACCEPTED)) {
                throw new RuntimeException("Food already claimed by another NGO");
            }
        }
        
        request.setStatus(newStatus);

        DonationRequest savedRequest = donationRequestRepository.save(request);

        if (newStatus == RequestStatus.ACCEPTED) {
            smsNotificationService.sendAcceptanceNotification(savedRequest);
        }
    }

    public java.util.Map<String, Object> getHostelStats(Long hostelId) {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        
        // Use FoodListingRepository for listing-centric total
        long totalListings = foodListingRepository.countByCreatedBy_Id(hostelId);
        
        // Request counts from DonationRequestRepository
        long totalRequests = donationRequestRepository.countByCreatedBy_Id(hostelId);
        long accepted = donationRequestRepository.countByCreatedBy_IdAndStatus(hostelId, RequestStatus.ACCEPTED);
        long pending = donationRequestRepository.countByCreatedBy_IdAndStatus(hostelId, RequestStatus.PENDING);
        long rejected = donationRequestRepository.countByCreatedBy_IdAndStatus(hostelId, RequestStatus.REJECTED);
        long expired = donationRequestRepository.countByCreatedBy_IdAndStatus(hostelId, RequestStatus.EXPIRED);
        
        // Detailed impact metrics
        long ngosHelped = donationRequestRepository.countDistinctNgoIdByCreatedBy_IdAndStatus(hostelId, RequestStatus.ACCEPTED);
        
        // Success rate based on requests (or could be based on listings if preferred)
        int successRate = totalRequests > 0 ? (int) Math.round((double) accepted / totalRequests * 100) : 0;
        
        stats.put("total", totalListings); // Showing total listings instead of total requests
        stats.put("totalRequests", totalRequests);
        stats.put("accepted", accepted);
        stats.put("pending", pending);
        stats.put("rejected", rejected);
        stats.put("expired", expired);
        stats.put("mealsDonated", totalListings); 
        stats.put("ngosHelped", ngosHelped);
        stats.put("successRate", successRate);
        
        return stats;
    }

    public java.util.Map<String, Object> getOrgStats(Long ngoId) {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        
        long accepted = donationRequestRepository.countByNgoIdAndStatus(ngoId, RequestStatus.ACCEPTED);
        long pending = donationRequestRepository.countByNgoIdAndStatus(ngoId, RequestStatus.PENDING);
        long rejected = donationRequestRepository.countByNgoIdAndStatus(ngoId, RequestStatus.REJECTED);
        
        stats.put("accepted", accepted);
        stats.put("pending", pending);
        stats.put("rejected", rejected);
        
        return stats;
    }
}
