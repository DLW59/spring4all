package com.dlw.study;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

/**
 * @author dlw
 * @date 2018-05-24
 * @description
 */
@SpringBootApplication
//@EnableDiscoveryClient
@EnableCaching
public class MqProducerApplication {

    public static void main(String args[]) {
        SpringApplication.run(MqProducerApplication.class, args);
    }
}
