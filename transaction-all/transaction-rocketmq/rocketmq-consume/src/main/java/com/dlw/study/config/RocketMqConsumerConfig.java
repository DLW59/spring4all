package com.dlw.study.config;

import org.springframework.cloud.stream.annotation.EnableBinding;
import org.springframework.cloud.stream.annotation.Input;
import org.springframework.cloud.stream.messaging.Sink;
import org.springframework.messaging.SubscribableChannel;

/**
 * @author dengliwen
 * @date 2019/9/26
 * @desc 消费者配置
 */
@EnableBinding({RocketMqConsumerConfig.CustomSink.class})
public class RocketMqConsumerConfig {

    public interface CustomSink extends Sink {
        String INPUT2 = "input2";
        String INPUT3 = "input3";

        @Input(INPUT2)
        SubscribableChannel input2();

        @Input(INPUT3)
        SubscribableChannel input3();
    }
}
