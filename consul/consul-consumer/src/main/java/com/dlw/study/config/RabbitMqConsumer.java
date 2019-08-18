package com.dlw.study.config;

import com.alibaba.fastjson.JSON;
import com.dlw.study.domain.ParticipleMgr;
import com.dlw.study.service.ParticipleMgrService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.amqp.rabbit.annotation.RabbitHandler;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * @author dengliwen
 * @date 2019/5/21
 * @desc
 */
@Component
@RabbitListener(queues = "test_queue")
@Slf4j
public class RabbitMqConsumer {
    @Autowired
    private AmqpTemplate rabbitTemplate;

    @Autowired
    private ParticipleMgrService participleMgrService;

    /**
     * 不能有返回值 否则报错
     * Request message does not contain reply-to property, and no default response Exchange was set.
     * @param o
     */
    @RabbitHandler
    public void consume(String o) {
        log.info("消费消息：{}",o);
        //todo 消费逻辑
        ParticipleMgr mgr = JSON.parseObject(o, ParticipleMgr.class);
        participleMgrService.add(mgr);
    }
}
