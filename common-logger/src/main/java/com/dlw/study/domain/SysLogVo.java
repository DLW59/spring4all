package com.dlw.study.domain;

import lombok.Data;

/**
 * @author dengliwen
 * @date 2019/11/9
 * @desc
 */
@Data
public class SysLogVo extends BaseLogVo {

    private String requestUrl;

    private String method;

    private String params;

    private String methodType;
}
