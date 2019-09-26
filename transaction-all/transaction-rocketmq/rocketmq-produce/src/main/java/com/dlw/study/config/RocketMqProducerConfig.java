package com.dlw.study.config;

import org.springframework.cloud.stream.annotation.EnableBinding;
import org.springframework.cloud.stream.annotation.Output;
import org.springframework.cloud.stream.messaging.Source;
import org.springframework.messaging.MessageChannel;

/**
 * @author dengliwen
 * @date 2019/9/26
 * @desc 生产者配置
 */
@EnableBinding({RocketMqProducerConfig.CustomSource.class})
public class RocketMqProducerConfig {

    public interface CustomSource extends Source {

        @Output("output2")
        MessageChannel output2();
    }
}
