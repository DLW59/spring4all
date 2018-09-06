package com.dlw.study;

import com.aliyun.openservices.ons.api.*;
import com.aliyun.openservices.shade.com.alibaba.fastjson.JSON;

import java.util.Properties;

/**
 * @author dlw
 * @date 2018/5/31
 * @desc
 */
public class ConsumerTest {
    public static void main(String[] args) {
        Properties properties = new Properties();
        // 您在 MQ 控制台创建的 Consumer ID
        properties.put(PropertyKeyConst.ConsumerId, "CID_internet_test_ssp_callback");
        // 鉴权用 AccessKey，在阿里云服务器管理控制台创建
        properties.put(PropertyKeyConst.AccessKey, "LTAInCus2lvJg5F6");
        // 鉴权用 SecretKey，在阿里云服务器管理控制台创建
        properties.put(PropertyKeyConst.SecretKey, "ZI2X0lTJc25c55x5bKc6vNSQFXdESF");
        properties.put(PropertyKeyConst.MaxReconsumeTimes,1 );
        // 设置 TCP 接入域名（此处以公共云公网环境接入为例）
        properties.put(PropertyKeyConst.ONSAddr,
                "http://onsaddr-internet.aliyun.com/rocketmq/nsaddr4client-internet");
        Consumer consumer = ONSFactory.createConsumer(properties);
        consumer.subscribe("internet_test_ssp_callback_topic", "*", new MessageListener() {
            @Override
            public Action consume(Message message, ConsumeContext context) {
                System.out.println(message.getTopic()+ "===== "+message.getTag());
                parse(message.getBody());

                return Action.CommitMessage;
            }
        });
        consumer.start();
        System.out.println("Consumer Started");
    }
    private static void parse(byte[] bytes){
        SendMessage sendMessage = JSON.parseObject(new String(bytes), SendMessage.class);
        System.out.println(sendMessage.getData().getTopic() + "======" + sendMessage.getData().getTag());
        String message = sendMessage.getData().getMessage();
        Add add = JSON.parseObject(message, Add.class);
        System.out.println(add.toString());
    }
}
