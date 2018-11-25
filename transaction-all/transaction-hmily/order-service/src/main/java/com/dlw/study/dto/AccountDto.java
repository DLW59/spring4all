package com.dlw.study.dto;

import lombok.Builder;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * @author dengliwen
 * @date 2018/11/24
 */
@Data
@Builder
public class AccountDto implements Serializable {
    private static final long serialVersionUID = -1005882017214542236L;

    /**
     * 用户id.
     */
    private String userId;

    /**
     * 扣款金额.
     */
    private BigDecimal amount;
}
