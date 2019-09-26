package com.dlw.study.service;

import com.dlw.study.config.RocketMqConsumerConfig;
import com.dlw.study.model.Order;
import com.netflix.discovery.converters.Auto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.annotation.StreamListener;
import org.springframework.messaging.Message;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

/**
 * @author dengliwen
 * @date 2019/9/26
 * @desc
 */
@Service
@Slf4j
public class ConsumerService {

    /**
     * 消费字符串消息
     * @param msg
     */
    @StreamListener(RocketMqConsumerConfig.CustomSink.INPUT)
    public void receive(String msg) {
        log.info("接收字符串消息：{}",msg);
    }

    /**
     * 消费对象消息
     * @param order
     */
    @StreamListener(RocketMqConsumerConfig.CustomSink.INPUT2)
    public void receive(@Payload Order order) {
        log.info("接收对象消息：{}",order);
    }

    /**
     * 通过spring.messaging对象来接收消息
     * @param message
     */
    @StreamListener(RocketMqConsumerConfig.CustomSink.INPUT3)
    public void receive(Message message) {
        log.info("接收消息：{}",message);
    }

}
