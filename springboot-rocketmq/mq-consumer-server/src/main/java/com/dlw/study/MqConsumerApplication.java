package com.dlw.study;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

/**
 * @author dlw
 * @date 2018-05-24
 * @description
 */
@SpringBootApplication
//@EnableDiscoveryClient
@EnableCaching
//@EnableFeignClients
public class MqConsumerApplication {

    public static void main(String args[]) {
        SpringApplication.run(MqConsumerApplication.class, args);
    }

//    @LoadBalanced
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
