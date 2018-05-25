package com.dlw.study.listener;

import com.dlw.study.service.impl.MessageDispatch;
import org.apache.rocketmq.client.consumer.listener.ConsumeOrderlyContext;
import org.apache.rocketmq.client.consumer.listener.ConsumeOrderlyStatus;
import org.apache.rocketmq.client.consumer.listener.MessageListenerOrderly;
import org.apache.rocketmq.common.message.MessageExt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * @author dlw
 * @date 2018-05-25
 * @description 自定义消息监听
 */
@Component
public class CustomMessageListenerOrderly implements MessageListenerOrderly {

    @Autowired
    private MessageDispatch messageDispatch;

    @Override
    public ConsumeOrderlyStatus consumeMessage(List<MessageExt> list, ConsumeOrderlyContext consumeOrderlyContext) {
        try {
            return messageDispatch.dispatch(list);
        }catch (Exception e) {
            return ConsumeOrderlyStatus.SUSPEND_CURRENT_QUEUE_A_MOMENT;
        }
    }
}
