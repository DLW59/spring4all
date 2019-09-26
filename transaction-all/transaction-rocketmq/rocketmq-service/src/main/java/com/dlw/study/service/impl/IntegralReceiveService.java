package com.dlw.study.service.impl;

import com.dlw.study.config.RocketMqConfig;
import com.dlw.study.enums.MessageStatusEnum;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.stream.annotation.StreamListener;
import org.springframework.cloud.stream.messaging.Sink;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Service;

/**
 * @author dengliwen
 * @date 2019/9/26
 * @desc 积分服务的消费者，接收到下单成功后增加积分
 */
@Service
@Slf4j
public class IntegralReceiveService {

    @StreamListener(RocketMqConfig.CustomSink.INPUT)
    public void receive(Message message) {
        //模拟消费异常
        String consume = (String)message.getHeaders().get(MessageStatusEnum.CONSUMER_FAIL.name());
        if (MessageStatusEnum.CONSUMER_FAIL.name().equals(consume)) {
            log.error("============Exception：积分进程挂了，消费消息失败");
            //模拟插入订单后服务器挂了，没有commit事务消息
            throw new RuntimeException("积分服务器挂了");
        }

        log.info("============收到订单信息，增加积分:" + message);
    }
}
