package com.dlw.study;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * @author dengliwen
 * @date 2019/5/21
 * @desc
 */
@SpringBootApplication
@EnableDiscoveryClient
public class ConsulProducer {

    public static void main(String[] args) {
        SpringApplication.run(ConsulProducer.class,args);
    }
}
