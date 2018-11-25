package com.dlw.study.service;

import com.dlw.study.domain.Order;

import java.math.BigDecimal;

/**
 * @author dengliwen
 * @date 2018/11/24
 */
public interface OrderService {

    void orderPay(int count, BigDecimal amount);

    int update(Order order);
}
