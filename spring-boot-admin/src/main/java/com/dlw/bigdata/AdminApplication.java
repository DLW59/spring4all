package com.dlw.bigdata;

import de.codecentric.boot.admin.server.config.EnableAdminServer;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.Configuration;

/**
 * @author dlw
 * @date 2018/9/6
 * @desc
 */
//@SpringBootApplication
@EnableAdminServer
@Configuration
@EnableAutoConfiguration
public class AdminApplication {
    public static void main(String[] args) {
        SpringApplication.run(AdminApplication.class, args);
    }
}

