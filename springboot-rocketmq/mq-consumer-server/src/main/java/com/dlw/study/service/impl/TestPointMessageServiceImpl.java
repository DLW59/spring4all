package com.dlw.study.service.impl;

import com.alibaba.fastjson.JSON;
import com.dlw.study.enums.PointMessageTagsEnum;
import com.dlw.study.model.Response;
import com.dlw.study.param.Add;
import com.dlw.study.param.Disable;
import com.dlw.study.param.Taboo;
import com.dlw.study.service.TestPointMessageService;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.rocketmq.client.consumer.listener.ConsumeOrderlyStatus;
import org.apache.rocketmq.common.message.MessageExt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.annotation.Resource;

/**
 * @author dlw
 * @date 2018-05-24
 * @description
 */
@Service
@Slf4j
public class TestPointMessageServiceImpl implements TestPointMessageService {

    /**
     * 可售
     */
    @Value("${setpoint.service.ssp.point.test.new}")
    private String testNewPointUrl;

    /**
     * 不可售
     */
    @Value("${setpoint.service.ssp.point.test.disable}")
    private String testDisableUrl;

    /**
     * 禁忌
     */
    @Value("${setpoint.service.ssp.point.test.taboo}")
    private String testTabooUrl;

    @Resource
    private RestTemplate restTemplate;

    @Override
    public ConsumeOrderlyStatus consume(MessageExt message) {
        //根据标签进行消费
        String tags = message.getTags();
        if (!PointMessageTagsEnum.hasValue(tags)) {
            return ConsumeOrderlyStatus.SUCCESS;
        }
        //tags不在接收范围内，即为错误消息，消费掉才能保证队列不阻塞
        PointMessageTagsEnum pointMessageTagsEnum = PointMessageTagsEnum.getByTag(tags);
        if (null == pointMessageTagsEnum) {
            return ConsumeOrderlyStatus.SUCCESS;
        }
        String messageText = new String(message.getBody());
        log.info("messageText:{}", messageText);
        if (StringUtils.isEmpty(messageText)) {
            return ConsumeOrderlyStatus.SUCCESS;
        }
        switch (pointMessageTagsEnum) {
            case NEW:
                newPoint(messageText);
                break;
            case DISABLE:
                disable(messageText);
                break;
            case TABOO:
                taboo(messageText);
                break;
            default:
                break;
        }
        return ConsumeOrderlyStatus.SUCCESS;
    }

    /**
     * 点位禁忌改变
     * @param messageText 消息体
     */
    private void taboo(String messageText) {
        Taboo taboo;
        try {
            taboo = JSON.parseObject(messageText, Taboo.class);
            restTemplate.postForObject(testTabooUrl,taboo,Response.class);
        }catch (Exception e){
            return;
        }
        log.info("消费消息：{}",messageText);
    }

    /**
     * 点位不可售
     * @param messageText 消息体
     */
    private void disable(String messageText) {
        Disable disable;
        try {
            disable = JSON.parseObject(messageText, Disable.class);
            restTemplate.delete(testDisableUrl,disable);
        }catch (Exception e){
            return;
        }
        log.info("消费消息：{}",messageText);
    }

    /**
     * 点位可售
     * @param messageText 消息体
     */
    private void newPoint(String messageText) {
        Add add;
        try {
            add = JSON.parseObject(messageText, Add.class);
            restTemplate.put(testNewPointUrl,add,Response.class);
        }catch (Exception e){
            return;
        }
        log.info("消费消息：{}",messageText);
    }
}
