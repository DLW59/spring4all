package com.dlw.study.service.impl;

import com.dlw.study.enums.MessageTopicEnum;
import com.dlw.study.factory.MessageConsumeServiceFactory;
import lombok.extern.slf4j.Slf4j;
import org.apache.rocketmq.client.consumer.listener.ConsumeOrderlyStatus;
import org.apache.rocketmq.common.message.Message;
import org.apache.rocketmq.common.message.MessageExt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * ..
 * 消息业务分发
 *
 * @author dlw
 * @date 2018-05-24
 */
@Component
@Slf4j
public class MessageDispatch {
	/**
	 * 消费工厂
	 */
	@Autowired
	private MessageConsumeServiceFactory factory;

	/**
	 * 分发业务消息
	 *
	 * @param messages 消息
	 * @return 消息消费结果
	 */
	public ConsumeOrderlyStatus dispatch(List<MessageExt> messages) throws Exception {

		for(MessageExt message:messages){
			if (message == null) {
				return ConsumeOrderlyStatus.SUCCESS;
			}
			String topic = message.getTopic();
			if (!MessageTopicEnum.hasValue(topic)) {
				//消息主题错误
				return ConsumeOrderlyStatus.SUCCESS;
			}
			 factory.service(MessageTopicEnum.getEnumByTopic(topic)).consume(message);
		}

		return ConsumeOrderlyStatus.SUCCESS;
	}

}
