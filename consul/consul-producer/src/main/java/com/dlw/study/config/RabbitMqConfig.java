package com.dlw.study.config;

import lombok.Data;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * @author dengliwen
 * @date 2019/5/21
 * @desc
 */
@Configuration
@ConfigurationProperties(prefix = "rabbitmq")
@Data
public class RabbitMqConfig {

    private String queue;

    private String topic;

    @Bean
    public Queue queue() {
        return new Queue(queue);
    }

    @Bean
    public TopicExchange topicExchange() {
        return new TopicExchange(topic);
    }

}
