package com.dlw.study.model;

/**
 *
 * @author zhangyouwen
 * @date 2017/7/11
 */
public class ResponseCode {

    public static final String SUCCESS = "000";     // 操作成功
    public static final String FAILED = "001";      // 操作失败
    public static final String ERROR = "002";       // 操作错误（异常）

    public static final String INVALID_PARAM = "003";     // 无效参数

    public static final String ASYNC_DONE = "100";  // 异步操作处理完成
    public static final String FILE_CREATE_DOING = "101"; // 文件生成中
    public static final String FILE_CREATE_DONE = "102"; // 文件生成完成

    public static final String SET_POINT_DOING = "201"; // 选点中...
    public static final String SET_POINT_DONE = "202";  // 选点完成

    public static final String NO_CONDITION_PLAN = "301";     // 没有符合条件的方案
    public static final String EXIST_ORDER_PLAN = "302";     // 当前时间存在保留方案
    public static final String NO_PUBLIC_AD = "303";     // 没有公益广告

}
