package com.dlw.study.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * @author dengliwen
 * @date 2019/9/25
 * @desc
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order implements Serializable {
    private static final long serialVersionUID = 4373339955347054343L;

    private String orderId;
    private String orderNo;
}
