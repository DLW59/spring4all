package com.dlw.study.service.impl;

import com.dlw.study.dao.OrderDao;
import com.dlw.study.domain.Order;
import com.dlw.study.enums.OrderStatusEnum;
import com.dlw.study.service.OrderService;
import com.dlw.study.service.PaymentService;
import lombok.extern.slf4j.Slf4j;
import org.dromara.hmily.common.utils.IdWorkerUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Date;

/**
 * @author dengliwen
 * @date 2018/11/24
 */
@Service("orderServiceImpl")
@Slf4j
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderDao orderDao;

    @Autowired
    @Qualifier("paymentServiceImpl")
    private PaymentService paymentService;

    @Override
    public void orderPay(int count, BigDecimal amount) {
        Order order = buildOrder(count, amount);
        int save = orderDao.save(order);
        if (save == 1) {
            paymentService.doPayment(order);
        }
    }

    @Override
    public int update(Order order) {

        return orderDao.update(order);
    }

    private Order buildOrder(Integer count, BigDecimal amount) {
        log.debug("构建订单对象");
        Order order = new Order();
        order.setCreateTime(new Date());
        order.setNumber(IdWorkerUtils.getInstance().buildPartNumber());
        //demo中的表里只有商品id为 1的数据
        order.setProductId("1");
        order.setStatus(OrderStatusEnum.NOT_PAY.getCode());
        order.setTotalAmount(amount);
        order.setCount(count);
        //demo中 表里面存的用户id为10000
        order.setUserId("10000");
        return order;
    }
}
