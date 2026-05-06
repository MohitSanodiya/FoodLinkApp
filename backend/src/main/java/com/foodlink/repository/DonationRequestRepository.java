package com.foodlink.repository;

import com.foodlink.model.DonationRequest;
import com.foodlink.model.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.time.LocalDateTime;

public interface DonationRequestRepository extends JpaRepository<DonationRequest, Long> {
    Page<DonationRequest> findByNgoIdOrderByCreatedAtDesc(Long ngoId, Pageable pageable);
    Page<DonationRequest> findByNgoIdAndStatusOrderByCreatedAtDesc(Long ngoId, RequestStatus status, Pageable pageable);
    long countByNgoIdAndStatus(Long ngoId, RequestStatus status);
    
    // For Hostel History
    Page<DonationRequest> findByCreatedByIdOrderByCreatedAtDesc(Long hostelId, Pageable pageable);
    
    // For Auto Expiration
    List<DonationRequest> findByStatusAndCreatedAtBefore(RequestStatus status, LocalDateTime time);

    // For Stats
    long countByCreatedBy_Id(Long hostelId);
    long countByCreatedBy_IdAndStatus(Long hostelId, RequestStatus status);
    
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT d.ngo.id) FROM DonationRequest d WHERE d.createdBy.id = ?1 AND d.status = ?2")
    long countDistinctNgoIdByCreatedBy_IdAndStatus(Long hostelId, RequestStatus status);
    
    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(fl.quantity), 0) FROM DonationRequest d JOIN d.foodListing fl WHERE d.createdBy.id = ?1 AND d.status = ?2")
    Double sumQuantityByCreatedBy_IdAndStatus(Long hostelId, RequestStatus status);
    
    // For Checks
    boolean existsByFoodListingIdAndStatus(Long foodListingId, RequestStatus status);
    boolean existsByFoodListingIdAndNgoId(Long foodListingId, Long ngoId);
}
