package com.foodlink.controller;

import com.foodlink.dto.DonationRequestDTO;
import com.foodlink.dto.DonationRequestPayload;
import com.foodlink.dto.ResponseActionRequest;
import com.foodlink.dto.UserDTO;
import com.foodlink.model.Role;
import com.foodlink.model.User;
import com.foodlink.repository.UserRepository;
import com.foodlink.service.DonationRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/org")
public class OrgController {

    @Autowired
    private DonationRequestService donationRequestService;

    @Autowired
    private UserRepository userRepository;

    
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_HOSTEL', 'ROLE_HOTEL')")
    public ResponseEntity<Page<UserDTO>> getOrgByCity(
            @RequestParam("city") String cityStr,
            @PageableDefault(size = 10) Pageable pageable) {
        String matchCity = cityStr != null ? cityStr.toLowerCase() : "";
        Page<User> orgs = userRepository.findByRoleInAndLocationIgnoreCase(
                Arrays.asList(Role.NGO, Role.GAUSHALA), matchCity, pageable
        );

        Page<UserDTO> dtoPage = orgs.map(org -> new UserDTO(org.getId(), org.getName(), org.getLocation()));
        return ResponseEntity.ok(dtoPage);
    }

    
    @PostMapping("/requests")
    @PreAuthorize("hasAnyAuthority('ROLE_HOSTEL', 'ROLE_HOTEL')")
    public ResponseEntity<?> createRequest(@RequestBody DonationRequestPayload payload, Authentication authentication) {
        User hostel = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Hostel not found"));
                
        donationRequestService.createRequest(payload.getFoodListingId(), payload.getNgoId(), hostel.getId());
        return ResponseEntity.ok("Request created successfully with status PENDING.");
    }

    
    @GetMapping("/requests")
    @PreAuthorize("hasAnyAuthority('ROLE_NGO', 'ROLE_GAUSHALA')")
    public ResponseEntity<Page<DonationRequestDTO>> getMyRequests(
            @RequestParam(required = false) String status, 
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication) {
            
        User org = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Organization not found"));
                
        Page<DonationRequestDTO> requests = donationRequestService.getRequestsForOrg(org.getId(), status, pageable);
        return ResponseEntity.ok(requests);
    }

    
    @PutMapping("/requests/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_NGO', 'ROLE_GAUSHALA')")
    public ResponseEntity<?> updateRequestStatus(@PathVariable Long id, 
            @RequestBody ResponseActionRequest response, Authentication authentication) {
            
        User org = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Organization not found"));
                
        donationRequestService.handleResponse(id, org.getId(), response.getStatus());
        return ResponseEntity.ok("Request status updated to " + response.getStatus());
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyAuthority('ROLE_NGO', 'ROLE_GAUSHALA')")
    public ResponseEntity<java.util.Map<String, Object>> getStats(Authentication authentication) {
        User org = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Organization not found"));
                
        return ResponseEntity.ok(donationRequestService.getOrgStats(org.getId()));
    }
}
