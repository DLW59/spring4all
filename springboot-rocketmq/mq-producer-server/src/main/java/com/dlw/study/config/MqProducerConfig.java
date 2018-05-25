package com.dlw.study.config;

import lombok.extern.slf4j.Slf4j;
import org.apache.rocketmq.client.exception.MQClientException;
import org.apache.rocketmq.client.producer.DefaultMQProducer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


/**
 * @author dlw
 * @date 2018-05-24
 * @description
 */
@Configuration
@Slf4j
public class MqProducerConfig {

    /**
     * mq nameserver服务地址
     */
    @Value("${rocketmq.nameserver.address}")
    private String nameServerAddress;
    /**
     * mq生产者组
     */
    @Value("${rocketmq.producer.group}")
    private String producerGroup;

    /**
     * mq生产者实列名称
     */
    @Value("${rocketmq.producer.instance.name}")
    private String producerInstanceName;

    /**
     * 注入一个默认的生产者
     * @return
     * @throws MQClientException
     */
    @Bean
    public DefaultMQProducer getProducer() throws MQClientException {
        log.info("nameserver地址:{},生产者组名称:{},生产者实列名称:{}",nameServerAddress,producerGroup,producerInstanceName);
        DefaultMQProducer producer = new DefaultMQProducer(producerGroup);
        producer.setNamesrvAddr(nameServerAddress);
//        producer.setInstanceName(UUID.randomUUID().toString().replaceAll("-","").substring(0,10));
        producer.setInstanceName(producerInstanceName);
        //默认禁用VIP通道
        producer.setVipChannelEnabled(false);
        //发送失败重试次数
//        producer.setRetryTimesWhenSendFailed(3);
        try {
            producer.start();
        } catch (MQClientException e) {
            log.error("MQ生产者配置失败:{}", e);
            throw e;
        }
        return producer;
    }

}
