package com.foodlink;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FoodlinkBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(FoodlinkBackendApplication.class, args);
	}

}
