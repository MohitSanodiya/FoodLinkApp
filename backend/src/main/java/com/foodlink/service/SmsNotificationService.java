package com.foodlink.service;

import com.foodlink.model.DonationRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.util.Base64;

@Service
public class SmsNotificationService {

    private final boolean enabled;
    private final String accountSid;
    private final String authToken;
    private final String fromNumber;
    private final String defaultCountryCode;
    private final RestClient restClient;

    public SmsNotificationService(
            @Value("${sms.enabled:false}") boolean enabled,
            @Value("${sms.twilio.account-sid:}") String accountSid,
            @Value("${sms.twilio.auth-token:}") String authToken,
            @Value("${sms.twilio.from-number:}") String fromNumber,
            @Value("${sms.default-country-code:+91}") String defaultCountryCode,
            RestClient.Builder restClientBuilder) {
        this.enabled = enabled;
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.fromNumber = fromNumber;
        this.defaultCountryCode = defaultCountryCode;
        this.restClient = restClientBuilder.build();
    }

    public void sendAcceptanceNotification(DonationRequest request) {
        String contactNumber = request.getFoodListing().getContactNumber();
        String recipient = normalizePhoneNumber(contactNumber);

        if (recipient == null) {
            System.out.println("SMS skipped: donor contact number is missing or invalid.");
            return;
        }

        String message = buildAcceptanceMessage(request);

        if (!isConfigured()) {
            System.out.println("SMS notification preview to " + recipient + ": " + message);
            return;
        }

        try {
            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("To", recipient);
            form.add("From", fromNumber);
            form.add("Body", message);

            restClient.post()
                    .uri("https://api.twilio.com/2010-04-01/Accounts/{accountSid}/Messages.json", accountSid)
                    .header("Authorization", "Basic " + basicAuthToken())
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .body(form)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception ex) {
            System.out.println("SMS notification failed: " + ex.getMessage());
        }
    }

    private boolean isConfigured() {
        return enabled
                && !accountSid.isBlank()
                && !authToken.isBlank()
                && !fromNumber.isBlank();
    }

    private String basicAuthToken() {
        String credentials = accountSid + ":" + authToken;
        return Base64.getEncoder().encodeToString(credentials.getBytes());
    }

    private String buildAcceptanceMessage(DonationRequest request) {
        String orgName = request.getNgo().getName();
        String foodTitle = request.getFoodListing().getTitle();
        String pickupTime = request.getFoodListing().getPickupTime();

        return "FoodLink: Your food donation \"" + foodTitle + "\" has been accepted by "
                + orgName + ". Pickup time: " + pickupTime + ". Thank you for donating!";
    }

    private String normalizePhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.isBlank()) {
            return null;
        }

        String trimmed = phoneNumber.trim();
        if (trimmed.startsWith("+")) {
            String digits = trimmed.substring(1).replaceAll("\\D", "");
            return digits.length() >= 10 ? "+" + digits : null;
        }

        String digits = trimmed.replaceAll("\\D", "");
        if (digits.length() == 10) {
            return defaultCountryCode + digits;
        }
        if (digits.length() > 10) {
            return "+" + digits;
        }
        return null;
    }
}
