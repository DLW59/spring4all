package com.dlw.study.service;

import java.math.BigDecimal;

/**
 * @author dengliwen
 * @date 2018/11/24
 */
public interface OrderService {

    void orderPay(int count, BigDecimal amount);
}
