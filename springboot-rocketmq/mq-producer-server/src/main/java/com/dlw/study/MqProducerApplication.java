package com.dlw.study;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.client.SpringCloudApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * @author dlw
 * @date 2018-05-24
 * @description
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableCaching
public class MqProducerApplication {

    public static void main(String args[]) {
        SpringApplication.run(MqProducerApplication.class, args);
    }
}
