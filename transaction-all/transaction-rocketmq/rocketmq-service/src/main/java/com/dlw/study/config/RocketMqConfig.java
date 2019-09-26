package com.dlw.study.config;

import org.springframework.cloud.stream.annotation.EnableBinding;
import org.springframework.cloud.stream.annotation.Input;
import org.springframework.cloud.stream.messaging.Sink;
import org.springframework.cloud.stream.messaging.Source;
import org.springframework.messaging.SubscribableChannel;

/**
 * @author dengliwen
 * @date 2019/9/25
 * @desc
 */
@EnableBinding({Source.class, RocketMqConfig.CustomSink.class})
public class RocketMqConfig {

    /**
     * 自定义sink  消费者订阅死信队列
     */
    public interface CustomSink extends Sink {

        @Input("inputDlq")
        SubscribableChannel inputDlq();
    }


}
