package com.dlw.study.service;

import org.apache.rocketmq.client.consumer.listener.ConsumeOrderlyStatus;
import org.apache.rocketmq.common.message.Message;
import org.apache.rocketmq.common.message.MessageExt;

/**
 * ..
 * MQ消息消费服务
 *
 * @author dlw
 * @date 2018-05-24
 */
public interface MqService {
	/**
	 * 消费消息
	 *
	 * @param message MQ消息
	 * @return 消费结果
	 */
	ConsumeOrderlyStatus consume(MessageExt message) throws Exception;

}
