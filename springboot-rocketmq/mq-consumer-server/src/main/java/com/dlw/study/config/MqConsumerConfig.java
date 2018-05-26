package com.dlw.study.config;

import com.dlw.study.enums.MessageTopicEnum;
import com.dlw.study.listener.CustomMessageListenerOrderly;
import com.dlw.study.service.impl.MessageDispatch;
import lombok.extern.slf4j.Slf4j;
import org.apache.rocketmq.client.consumer.DefaultMQPushConsumer;
import org.apache.rocketmq.client.consumer.listener.ConsumeOrderlyContext;
import org.apache.rocketmq.client.consumer.listener.ConsumeOrderlyStatus;
import org.apache.rocketmq.client.consumer.listener.MessageListenerOrderly;
import org.apache.rocketmq.client.exception.MQClientException;
import org.apache.rocketmq.common.consumer.ConsumeFromWhere;
import org.apache.rocketmq.common.message.MessageExt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import java.util.List;


/**
 * @author dlw
 * @date 2018-05-24
 * @description
 */
@Component
@Slf4j
public class MqConsumerConfig {

    /**
     * mq nameserver服务地址
     */
    @Value("${rocketmq.nameserver.address}")
    private String nameServerAddress;
    /**
     * mq消费者组
     */
    @Value("${rocketmq.consumer.group}")
    private String consumerGroup;

    /**
     * mq消费者实列名称
     */
    @Value("${rocketmq.consumer.instance.name}")
    private String consumerInstanceName;

    @Autowired
    private MessageDispatch messageDispatch;

    @Autowired
    private CustomMessageListenerOrderly customMessageListenerOrderly;
    /**
     * 注入一个默认的消费者
     * @return
     * @throws MQClientException
     */
    @Bean
    public DefaultMQPushConsumer getConsumer() throws MQClientException {
        log.info("nameserver地址:{},生产者组名称:{},生产者实列名称:{}",nameServerAddress,consumerGroup,consumerInstanceName);
        //实列push consumer
        DefaultMQPushConsumer consumer = new DefaultMQPushConsumer(consumerGroup);
        consumer.setNamesrvAddr(nameServerAddress);
//        consumer.setInstanceName(UUID.randomUUID().toString().replaceAll("-","").substring(0,10));
        consumer.setInstanceName(consumerInstanceName);
        consumer.setPullBatchSize(1000);
        consumer.setPullThresholdForQueue(50);
        consumer.setConsumeThreadMin(20);
        consumer.setConsumeMessageBatchMaxSize(1024);
        consumer.setVipChannelEnabled(false);
        //从队列的第一个开始消费
        consumer.setConsumeFromWhere(ConsumeFromWhere.CONSUME_FROM_FIRST_OFFSET);
        //监听所有主题消息，可根据业务过滤主题消息
//        for (MessageTopicEnum topicEnum : MessageTopicEnum.values()) {
//            //可根据tag过滤消息
//            consumer.subscribe(topicEnum.getTopic(), "new || disable || taboo");
//        }
        consumer.subscribe(MessageTopicEnum.DEV_SETPOINT_POINT_CHANGE.getTopic(), "new || disable || taboo");
        //据说用匿名内部类实现消息监听只会消费一次
//        consumer.setMessageListener(new MessageListenerOrderly() {
//            @Override
//            public ConsumeOrderlyStatus consumeMessage(List<MessageExt> list, ConsumeOrderlyContext consumeOrderlyContext) {
//                //处理逻辑业务
//                return messageDispatch.dispatch(list);
//            }
//        });
        consumer.setMessageListener(customMessageListenerOrderly);
        try {
            consumer.start();
        } catch (MQClientException e) {
            log.error("MQ生产者配置失败:{}", e);
            throw e;
        }
        return consumer;
    }

}
