package com.foodlink.service;

import com.foodlink.model.DonationRequest;
import com.foodlink.model.RequestStatus;
import com.foodlink.repository.DonationRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class ExpirationService {

    @Autowired
    private DonationRequestRepository donationRequestRepository;

    @Scheduled(fixedRate = 600000) // Runs every 10 minutes
    public void expireOldRequests() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Kolkata"));
        LocalDateTime threshold = now.minusHours(12);

        List<DonationRequest> expiredRequests = donationRequestRepository
                .findByStatusAndCreatedAtBefore(RequestStatus.PENDING, threshold);

        if (!expiredRequests.isEmpty()) {
            for (DonationRequest req : expiredRequests) {
                req.setStatus(RequestStatus.EXPIRED);
            }
            donationRequestRepository.saveAll(expiredRequests);
            System.out.println("Auto-Expired " + expiredRequests.size() + " stale requests.");
        }
    }
}
