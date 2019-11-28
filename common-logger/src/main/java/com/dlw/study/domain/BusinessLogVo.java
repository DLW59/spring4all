package com.dlw.study.domain;

import com.dlw.study.enums.OperationType;
import lombok.Data;

/**
 * @author dengliwen
 * @date 2019/11/9
 * @desc
 */
@Data
public class BusinessLogVo extends BaseLogVo {

    private OperationType operationType;

    /**
     * 操作的内容
     */
    private String content;
}
