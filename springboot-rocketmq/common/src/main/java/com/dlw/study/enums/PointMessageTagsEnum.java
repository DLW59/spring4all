package com.dlw.study.enums;

/**
 * ..
 * 支付服务的消息标签
 *
 * @author dlw
 * @since 2018-05-24
 */
public enum PointMessageTagsEnum {

	NEW("0", "点位可售"),
	DISABLE("1", "点位不可售"),
	TABOO("2", "点位禁忌行业");

	/**
	 * 消息tag标识
	 */
	private String code;
	/**
	 * 意义
	 */
	private String note;


	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public String getNote() {
		return note;
	}

	public void setNote(String note) {
		this.note = note;
	}

	PointMessageTagsEnum(String code, String note) {

		this.code = code;
		this.note = note;
	}

	/**
	 * 根据code获取枚举
	 *
	 * @param code 标识
	 * @return 对应枚举
	 */
	public static PointMessageTagsEnum getByCode(String code) {
		for (PointMessageTagsEnum tagsEnum : PointMessageTagsEnum.values()) {
			if (tagsEnum.getCode().equals(code)) {
				return tagsEnum;
			}
		}
		return null;
	}

	/**
	 * 值是否在范围内
	 *
	 * @param tag 标签值
	 * @return 是否在范围内
	 */
	public static boolean hasValue(String tag) {

		boolean has = false;
		for (PointMessageTagsEnum tagsEnum : PointMessageTagsEnum.values()) {
			if (tagsEnum.getCode().equals(tag)) {
				has = true;
			}
		}
		return has;
	}
}
