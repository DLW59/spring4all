package com.dlw.study.service.impl;

import com.dlw.study.model.CommonMessage;
import com.dlw.study.model.CommonResponse;
import com.dlw.study.service.MqService;
import lombok.extern.slf4j.Slf4j;
import org.apache.rocketmq.client.producer.DefaultMQProducer;
import org.apache.rocketmq.client.producer.MessageQueueSelector;
import org.apache.rocketmq.common.message.Message;
import org.apache.rocketmq.common.message.MessageQueue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author dlw
 * @date 2018-05-24
 * @description
 */
@Service
@Slf4j
public class MqServiceImpl implements MqService {

    @Autowired
    private DefaultMQProducer producer;


    @Override
    public CommonResponse send(CommonMessage commonMessage) {
        Message message = new Message(commonMessage.getTopic(),commonMessage.getTag(),
                commonMessage.getKey(),commonMessage.getMessage().getBytes());
        try {
            if (commonMessage.getOrderId() >= 0) {
                //顺序消费
                producer.send(message, new MessageQueueSelector() {
                    @Override
                    public MessageQueue select(List<MessageQueue> list, Message message, Object o) {
                        int index = (int) o % list.size();
                        return list.get(index);
                    }
                },commonMessage.getOrderId());
                log.info("生产：{}",commonMessage.getMessage());
            }else {
                //普通消费
                producer.send(message);
                log.info("生产：{}",commonMessage.getMessage());
            }
        }catch (Exception e) {
            log.error(e.getMessage());
        }finally {
            producer.shutdown();
        }
        return CommonResponse.success();
    }
}
