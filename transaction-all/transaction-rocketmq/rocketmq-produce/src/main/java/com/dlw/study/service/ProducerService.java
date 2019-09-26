package com.dlw.study.service;

import com.dlw.study.config.RocketMqProducerConfig;
import org.apache.rocketmq.common.message.MessageConst;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.messaging.Source;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageHeaders;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Service;
import org.springframework.util.MimeTypeUtils;


/**
 * @author dengliwen
 * @date 2019/9/26
 * @desc
 */
@Service
public class ProducerService {

    @Autowired
    private RocketMqProducerConfig.CustomSource source;

    /**
     * 发送字符消息
     * @param msg
     */
    public void send(String msg) {
        source.output().send(MessageBuilder.withPayload(msg).build());
    }

    /**
     * 发送带tag的消息
     * @param t
     * @param tag
     * @param <T>
     */
    public <T> void send(T t,String tag) {
        final Message<T> message = MessageBuilder.withPayload(t)
                .setHeader(MessageConst.PROPERTY_TAGS, tag)
                .setHeader(MessageHeaders.CONTENT_TYPE, MimeTypeUtils.APPLICATION_JSON)
                .build();
        source.output().send(message);
    }
}
