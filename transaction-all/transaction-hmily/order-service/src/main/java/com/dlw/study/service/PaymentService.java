package com.dlw.study.service;

import com.dlw.study.domain.Order;

/**
 * @author dengliwen
 * @date 2018/11/24
 */
public interface PaymentService {

    void doPayment(Order order);
}
