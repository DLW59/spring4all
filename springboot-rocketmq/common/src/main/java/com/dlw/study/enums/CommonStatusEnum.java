package com.dlw.study.enums;

/**
 * ..
 * 通用状态枚举 0标识成功
 *
 * @author dlw
 * @since 2018-05-24
 */
public enum CommonStatusEnum {

	SUCCESS(0, ""),
	ERROR(500,"接口异常");

	CommonStatusEnum(int code, String message) {
		this.code = code;
		this.message = message;
	}

	public int getCode() {

		return code;
	}

	public void setCode(int code) {
		this.code = code;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	private int code;

	private String message;


}
