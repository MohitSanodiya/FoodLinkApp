package com.foodlink.repository;

import com.foodlink.model.FoodListing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FoodListingRepository extends JpaRepository<FoodListing, Long> {
    List<FoodListing> findByCreatedBy_Id(Long providerId);
    
    long countByCreatedBy_Id(Long hostelId);
    
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(f) FROM FoodListing f WHERE f.createdBy.id = ?1 AND EXISTS (SELECT dr FROM DonationRequest dr WHERE dr.foodListing = f AND dr.status = ?2)")
    long countAcceptedByCreatedBy_Id(Long hostelId, com.foodlink.model.RequestStatus status);
    
    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(f.quantity), 0) FROM FoodListing f WHERE f.createdBy.id = ?1 AND EXISTS (SELECT dr FROM DonationRequest dr WHERE dr.foodListing = f AND dr.status = ?2)")
    Double sumAcceptedQuantityByCreatedBy_Id(Long hostelId, com.foodlink.model.RequestStatus status);
}
