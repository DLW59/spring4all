package com.dlw.study;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * @author dengliwen
 * @date 2018/11/25
 */
@SpringBootApplication(exclude = {MongoAutoConfiguration.class, MongoDataAutoConfiguration.class},
        scanBasePackages = {"com.dlw.study"})
@EnableTransactionManagement
@EnableDiscoveryClient
@EnableFeignClients
@MapperScan("com.dlw.study.dao")
public class StockApplication {

    public static void main(String[] args) {
        SpringApplication.run(StockApplication.class,args);
    }
}
