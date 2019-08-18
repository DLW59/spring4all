package com.dlw.study.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.List;

/**
 * @author dengliwen
 * @date 2019/5/21
 * @desc
 */
@RestController
@Slf4j
public class HealthController {

    @Autowired
    private DiscoveryClient discoveryClient;

    @Autowired
    private RestTemplate restTemplate;

    @GetMapping("/health")
    public String health() {
        List<String> services = discoveryClient.getServices();
        log.info(services.toString());
        List<ServiceInstance> instances = discoveryClient.getInstances("consul-producer");
        log.info(instances.toString());
        if (CollectionUtils.isEmpty(instances)) {
            return "没有可用服务";
        }
        ServiceInstance instance = instances.get(0);
        log.info(instance.toString());
        String scheme = instance.getScheme() == null ? "http" : instance.getScheme();
        String s = restTemplate.getForObject(scheme + "://" + instance.getServiceId() + "/produce", String.class);
        return s;
    }
}
