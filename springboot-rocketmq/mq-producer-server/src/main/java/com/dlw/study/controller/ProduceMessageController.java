package com.dlw.study.controller;

import com.dlw.study.model.CommonMessage;
import com.dlw.study.model.CommonResponse;
import com.dlw.study.service.MqService;
import lombok.extern.slf4j.Slf4j;
import org.apache.rocketmq.client.exception.MQBrokerException;
import org.apache.rocketmq.client.exception.MQClientException;
import org.apache.rocketmq.remoting.exception.RemotingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author dlw
 * @date 2018-05-24
 * @description
 */
@RestController
@RequestMapping("/produce")
@Slf4j
public class ProduceMessageController {

    @Autowired
    private MqService mqService;


    /**
     * 生成消息
     * @param commonMessage 消息
     * @return
     */
    @PostMapping(value = "/message",produces = "application/json;charset=UTF-8")
    public CommonResponse send(@RequestBody CommonMessage commonMessage) {
        CommonResponse commonResponse = new CommonResponse();
        try {
            commonResponse = mqService.send(commonMessage);
        } catch (Exception e) {
            log.error("消息发送失败:{}", e.getMessage());
            commonResponse.setReturnCode(500);
            commonResponse.setReturnMessage("error");
        }
        return commonResponse;
    }


}
