package com.dlw.study.enums;

/**
 * ..
 * MQ消息主题枚举
 *
 * @author dlw
 * @since 2018-05-24
 */
public enum MessageTopicEnum {

	/**
	 * 点位状态改变主题
	 */
	POINT_STATUS_CHANGE("point-status-change"),

	/**
	 * 开发环境topic
	 */
	DEV_SETPOINT_POINT_CHANGE("dev_setpoint_point_change"),

	/**
	 * 测试环境topic
	 */
	TEST_SETPOINT_POINT_CHANGE("test_setpoint_point_change"),

	/**
	 * 预上线环境topic
	 */
	PRE_SETPOINT_POINT_CHANGE("pre_setpoint_point_change"),

	/**
	 * 生产环境topic
	 */
	PROD_SETPOINT_POINT_CHANGE("prod_setpoint_point_change");


	
	private String topic;


	public String getTopic() {
		return topic;
	}

	public void setTopic(String topic) {
		this.topic = topic;
	}

	MessageTopicEnum(String topic) {

		this.topic = topic;
	}

	/**
	 * 根据主题获取
	 *
	 * @param topic 主题
	 * @return 对应的枚举
	 */
	public static MessageTopicEnum getEnumByTopic(String topic) {
		for (MessageTopicEnum topicEnum : MessageTopicEnum.values()) {
			if (topicEnum.getTopic().equals(topic)) {
				return topicEnum;
			}
		}
		return null;
	}

	/**
	 * 消息主题是否在枚举范围内
	 *
	 * @param topic 消息主题
	 * @return 消息主题是否在枚举范围内
	 */
	public static boolean hasValue(String topic) {
		boolean has = false;
		for (MessageTopicEnum topicEnum : MessageTopicEnum.values()) {
			if (topicEnum.getTopic().equals(topic)) {
				has = true;
				break;
			}
		}
		return has;
	}
}
