package com.dlw.study.controller;

import cn.hutool.core.util.RandomUtil;
import com.dlw.study.model.Order;
import com.netflix.discovery.converters.Auto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.messaging.Source;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.util.IdGenerator;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * @author dengliwen
 * @date 2019/9/26
 * @desc
 */
@RestController
@RequestMapping("/api/order")
public class OrderController {

    @Autowired
    private Source source;

    /**
     * 正常情况
     */
    @GetMapping("/success")
    public String success() {
        Order order = new Order();
        order.setOrderId(UUID.randomUUID().toString());
        order.setOrderNo(RandomUtil.randomString(4));

        Message message = MessageBuilder
                .withPayload(order)
                .setHeader("orderId", order.getOrderId())
                .build();
        //发送半消息
        source.output().send(message);
        return "下单成功";
    }

    /**
     * 发送消息失败
     */
    @GetMapping("/produceFail")
    public String produceFail() {
        Order order = new Order();
        order.setOrderId(UUID.randomUUID().toString());
        order.setOrderNo(RandomUtil.randomString(4));

        Message message = MessageBuilder
                .withPayload(order)
                .setHeader("orderId", order.getOrderId())
                .setHeader("PRODUCE_FAIL", "PRODUCE_FAIL")
                .build();
        //发送半消息
        source.output().send(message);
        return "发送消息失败";
    }

    /**
     * 消费消息失败
     */
    @GetMapping("/consumeFail")
    public String consumeFail() {
        Order order = new Order();
        order.setOrderId(UUID.randomUUID().toString());
        order.setOrderNo(RandomUtil.randomString(4));

        Message message = MessageBuilder
                .withPayload(order)
                .setHeader("orderId", order.getOrderId())
                .setHeader("CONSUMER_FAIL", "CONSUMER_FAIL")
                .build();
        //发送半消息
        source.output().send(message);
        return "消费消息失败";
    }
}
