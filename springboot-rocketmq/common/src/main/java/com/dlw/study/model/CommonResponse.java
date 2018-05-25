package com.dlw.study.model;


import com.dlw.study.enums.CommonStatusEnum;
import lombok.Data;

import java.io.Serializable;

/**
 * ..
 * 通用返回结果类
 *
 * @author dlw
 * @since 2018-05-24
 */
@Data
public class CommonResponse implements Serializable {

    /**
     * 返回结果标识
     */
    private int returnCode;
    /**
     * 返回提示信息
     */
    private String returnMessage;
    /**
     *
     */
    private String attach;

    /**
     * 返回消息内容
     */
    private Object content;

    /**
     * 构建成功的回复
     *
     * @return 成功的回复
     */
    public static CommonResponse success() {
        CommonResponse commonResponse = new CommonResponse();
        commonResponse.setReturnCode(CommonStatusEnum.SUCCESS.getCode());
        commonResponse.setReturnMessage(CommonStatusEnum.SUCCESS.getMessage());
        return commonResponse;
    }
    /**
     * 构建失败的回复
     *
     * @return 成功的回复
     */
    public static CommonResponse error() {
        CommonResponse commonResponse = new CommonResponse();
        commonResponse.setReturnCode(CommonStatusEnum.ERROR.getCode());
        commonResponse.setReturnMessage(CommonStatusEnum.ERROR.getMessage());
        return commonResponse;
    }
}
