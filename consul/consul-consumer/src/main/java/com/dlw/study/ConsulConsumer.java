package com.dlw.study;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

/**
 * @author dengliwen
 * @date 2019/5/21
 * @desc
 */
@SpringBootApplication
@EnableDiscoveryClient
public class ConsulConsumer {

    public static void main(String[] args) {
        SpringApplication.run(ConsulConsumer.class,args);
    }

    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
