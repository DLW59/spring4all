package com.dlw.study.service.impl;

import com.dlw.study.model.CommonMessage;
import com.dlw.study.model.CommonResponse;
import com.dlw.study.service.MqService;
import lombok.extern.slf4j.Slf4j;
import org.apache.rocketmq.client.producer.DefaultMQProducer;
import org.apache.rocketmq.client.producer.MessageQueueSelector;
import org.apache.rocketmq.client.producer.SendResult;
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
            SendResult result;
            if (commonMessage.getOrderId() >= 0) {
                //顺序消费
                result = producer.send(message, new MessageQueueSelector() {
                    @Override
                    public MessageQueue select(List<MessageQueue> list, Message message, Object o) {
                        int index = (int) o % list.size();
                        return list.get(index);
                    }
                }, commonMessage.getOrderId());
                log.info("send msg：发送结果：{}----消息key={}",result,commonMessage.getKey());
            }else {
                //普通消费
                result = producer.send(message);
                log.info("send msg：发送结果：{}----消息key={}",result,commonMessage.getKey());
            }
        }catch (Exception e) {
            log.info("send msg：发送失败----消息key={}",commonMessage.getKey());
            log.error(e.getMessage());
        }finally {
            producer.shutdown();
        }
        return CommonResponse.success();
    }
}
