package com.dlw.study.controller;

import com.dlw.study.config.RabbitMqConsumer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.List;

/**
 * @author dengliwen
 * @date 2019/5/21
 * @desc
 */
@RestController
@RequestMapping("/mq")
@Slf4j
public class MqConsumerController {

    @Autowired
    private RabbitMqConsumer consumer;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private DiscoveryClient client;

    @GetMapping("/consume")
    public String consume() {
        List<ServiceInstance> instances = client.getInstances("consul-producer");
        if (CollectionUtils.isEmpty(instances)) {
            return "没有服务可用";
        }
        ServiceInstance instance = instances.get(0);
        Object object = restTemplate.getForObject("http://" + instance.getServiceId() + "/mq/produce", Object.class);
        log.info(object.toString());
        return object.toString();
    }

}
