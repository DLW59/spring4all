package com.dlw.study.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * @author dengliwen
 * @date 2018/11/24
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountDto implements Serializable {

    private static final long serialVersionUID = 4108059796872663224L;
    /**
     * 用户id.
     */
    private String userId;

    /**
     * 扣款金额.
     */
    private BigDecimal amount;
}
