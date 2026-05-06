package com.foodlink.config;

import com.foodlink.model.Role;
import com.foodlink.model.User;
import com.foodlink.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @SuppressWarnings("null")
@Override
    public void run(String... args) throws Exception {
        // We will seed data ONLY if the database has less than 3 NGOs/Gaushalas
        long ngoCount = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.NGO || u.getRole() == Role.GAUSHALA)
                .count();

        if (ngoCount < 3) {
            String encodedPassword = passwordEncoder.encode("demo123");

            List<User> demoOrgs = Arrays.asList(
                    User.builder().name("Mumbai Helping Hands").email("mumbai1@ngo.com")
                            .password(encodedPassword).location("Mumbai").role(Role.NGO).build(),
                    
                    User.builder().name("Delhi Food Rescue").email("delhi1@ngo.com")
                            .password(encodedPassword).location("Delhi").role(Role.NGO).build(),
                            
                    User.builder().name("Safe Tails Gaushala").email("pune1@gaushala.com")
                            .password(encodedPassword).location("Pune").role(Role.GAUSHALA).build(),
                    
                    User.builder().name("Mumbai Animal Hope").email("mumbai_animal@gaushala.com")
                            .password(encodedPassword).location("Mumbai").role(Role.GAUSHALA).build()
            );

            userRepository.saveAll(demoOrgs);
            System.out.println("========== MOCK DATA SEEDED SUCCESSFULLY ==========");
            System.out.println("Added " + demoOrgs.size() + " NGOs/Gaushalas for your demo.");
            System.out.println("All passwords are set to: demo123");
            System.out.println("===================================================");
        }
    }
}
