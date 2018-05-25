package com.dlw.study.model;

import lombok.Data;

import java.io.Serializable;

/**
 * ..
 * 通用MQ消息传输对象
 *
 * @author dlw
 * @since 2018-05-24
 */
@Data
public class CommonMessage implements Serializable {
	/**
	 * 主题
	 */
	private String topic;
	/**
	 * 标签
	 */
	private String tag;
	/**
	 * 关键字
	 */
	private String key;
	/**
	 * 消息内容
	 */
	private String message;
	/**
	 * 顺序消息ID
	 */
	private int orderId;

}
