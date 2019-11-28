package com.dlw.study.domain;

import com.dlw.study.enums.OperationType;
import lombok.Data;

import java.io.Serializable;

/**
 * @author dengliwen
 * @date 2019/11/9
 * @desc
 */
@Data
public class BaseLogVo implements Serializable {

    private String app;

    private String module;

    private String description;

    private String creator;

    private String createTime;

    private String ip;
}
