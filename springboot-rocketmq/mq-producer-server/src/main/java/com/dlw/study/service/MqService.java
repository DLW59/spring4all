package com.dlw.study.service;

import com.dlw.study.model.CommonMessage;
import com.dlw.study.model.CommonResponse;
import org.apache.rocketmq.client.exception.MQBrokerException;
import org.apache.rocketmq.client.exception.MQClientException;
import org.apache.rocketmq.remoting.exception.RemotingException;

/**
 * @author dlw
 * @date 2018-05-24
 * @description
 */
public interface MqService {

    CommonResponse send(CommonMessage commonMessage) throws InterruptedException, RemotingException, MQClientException, MQBrokerException;
}
