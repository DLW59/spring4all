package com.dlw.study.service.impl;

import com.alibaba.fastjson.JSON;
import com.dlw.study.enums.PointMessageTagsEnum;
import com.dlw.study.model.Response;
import com.dlw.study.param.Add;
import com.dlw.study.param.Disable;
import com.dlw.study.param.Taboo;
import com.dlw.study.service.DevPointMessageService;
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
public class DevPointMessageServiceImpl implements DevPointMessageService {

    /**
     * 可售
     */
    @Value("${setpoint.service.ssp.point.dev.new}")
    private String devNewPointUrl;

    /**
     * 不可售
     */
    @Value("${setpoint.service.ssp.point.dev.disable}")
    private String devDisableUrl;

    /**
     * 禁忌
     */
    @Value("${setpoint.service.ssp.point.dev.taboo}")
    private String devTabooUrl;

    @Resource
    private RestTemplate restTemplate;

    @Override
    public ConsumeOrderlyStatus consume(MessageExt message) throws Exception {
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
        log.info("重试了：{}次",message.getReconsumeTimes());
        if (2 <= message.getReconsumeTimes()) {
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
    private void taboo(String messageText) throws Exception {
        Taboo taboo;
        try {
            taboo = JSON.parseObject(messageText, Taboo.class);
            restTemplate.postForObject(devTabooUrl,taboo,Response.class);
        }catch (Exception e){
            throw new Exception();
        }
        log.info("消费消息：{}",messageText);
    }

    /**
     * 点位不可售
     * @param messageText 消息体
     */
    private void disable(String messageText) throws Exception {
        Disable disable;
        try {
            disable = JSON.parseObject(messageText, Disable.class);
            restTemplate.delete(devDisableUrl,disable);
        }catch (Exception e){
            throw new Exception();
        }
        log.info("消费消息：{}",messageText);
    }

    /**
     * 点位可售
     * @param messageText 消息体
     */
    private void newPoint(String messageText) throws Exception {
        Add add;
        try {
            add = JSON.parseObject(messageText, Add.class);
            restTemplate.put(devNewPointUrl,add,Response.class);
        }catch (Exception e){
            throw new Exception();
        }
        log.info("消费消息：{}",messageText);
    }
}
