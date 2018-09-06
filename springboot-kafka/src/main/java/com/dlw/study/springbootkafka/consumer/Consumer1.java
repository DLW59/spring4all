package com.dlw.study.springbootkafka.consumer;

import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * @author dlw
 * @date 2018/9/2
 * @desc
 */
@Slf4j
@Component
public class Consumer1 {

    @KafkaListener(topics = {"test"})
    public void receive(ConsumerRecord record) {
        Optional<Object> value = Optional.ofNullable(record.value());
        if (value.isPresent()) {
            Object o = value.get();
            log.info("record======{}",record.toString());
            log.info("o======={}",o.toString());
        }
    }
}
