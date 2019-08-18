package com.dlw.study.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * @author dengliwen
 * @date 2019/5/21
 * @desc
 */
@Component
@Slf4j
public class RabbitMqProducer {

    @Autowired
    private AmqpTemplate rabbitTemplate;

    @Autowired
    private RabbitMqConfig mqConfig;

    /**
     * 生产消息
     */
    public void produce(String o) {
        log.info("发送消息：{}",o);
        rabbitTemplate.convertAndSend(mqConfig.getQueue(),o);
    }
}
