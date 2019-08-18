package com.dlw.study.springbootkafka.producer;

import com.dlw.study.springbootkafka.message.Message1;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * @author dlw
 * @date 2018/9/2
 * @desc
 */
@Slf4j
@Component
public class Producer1 {

    @Value("${spring.kafka.template.default-topic}")
    private String defaultTopic;
    @Autowired
    private KafkaTemplate kafkaTemplate;

    /**
     *定时发送
     */
    @Scheduled(cron = "0 0/1 * * * ?")
    public void send() {
        log.info("default-topic:{}","test1");
        Message1 message1 = new Message1(UUID.randomUUID().toString(),
                "hello kafka",System.currentTimeMillis());
        kafkaTemplate.send(defaultTopic, message1.toString());
    }

}
