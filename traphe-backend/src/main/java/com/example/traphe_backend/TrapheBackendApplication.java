package com.example.traphe_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class TrapheBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(TrapheBackendApplication.class, args);
	}

}
