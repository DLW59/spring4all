package com.dlw.study.enums;

/**
 * ..
 * 支付服务的消息标签
 *
 * @author dlw
 * @since 2018-05-24
 */
public enum PointMessageTagsEnum {

	NEW("new", "点位可售"),
	DISABLE("disable", "点位不可售"),
	TABOO("taboo", "点位禁忌行业");

	/**
	 * 消息tag标识
	 */
	private String tag;
	/**
	 * 意义
	 */
	private String note;


	public String getTag() {
		return tag;
	}

	public void setTag(String tag) {
		this.tag = tag;
	}

	public String getNote() {
		return note;
	}

	public void setNote(String note) {
		this.note = note;
	}

	PointMessageTagsEnum(String code, String note) {

		this.tag = code;
		this.note = note;
	}

	/**
	 * 根据code获取枚举
	 *
	 * @param tag 标识
	 * @return 对应枚举
	 */
	public static PointMessageTagsEnum getByTag(String tag) {
		for (PointMessageTagsEnum tagsEnum : PointMessageTagsEnum.values()) {
			if (tagsEnum.getTag().equals(tag)) {
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
			if (tagsEnum.getTag().equals(tag)) {
				has = true;
			}
		}
		return has;
	}
}
