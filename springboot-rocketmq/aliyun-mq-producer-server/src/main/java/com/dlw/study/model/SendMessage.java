package com.dlw.study.model;

import java.io.Serializable;

/**
 * @author dlw
 * @date 2018/5/31
 * @desc
 */
@lombok.Data
public class SendMessage implements Serializable{

    private String address;
    private Data data;
    private int dateTime;
    private int errorcount;
    private String from;
    private int retry;
    private String topic;


    @lombok.Data
    public static class Data implements Serializable{

        /**
         * 全局唯一
         */
        private String messageId;
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
    }
}
