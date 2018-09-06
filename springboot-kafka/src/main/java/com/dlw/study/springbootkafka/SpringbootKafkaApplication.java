package com.dlw.study.springbootkafka;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SpringbootKafkaApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpringbootKafkaApplication.class, args);
	}
}
