package com.dlw.study.service.impl;

import com.dlw.study.model.Order;
import com.dlw.study.service.OrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * @author dengliwen
 * @date 2019/9/25
 * @desc
 */
@Service
@Slf4j
public class OrderServiceImpl implements OrderService {
    @Override
    public void save(Order order) {
        log.info("保存订单成功，订单号：【{}】",order.getOrderNo());
    }
}
