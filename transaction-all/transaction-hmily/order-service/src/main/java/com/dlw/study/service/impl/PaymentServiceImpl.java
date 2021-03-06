package com.dlw.study.service.impl;

import com.dlw.study.dao.OrderDao;
import com.dlw.study.domain.Order;
import com.dlw.study.dto.AccountDto;
import com.dlw.study.dto.StockDto;
import com.dlw.study.enums.OrderStatusEnum;
import com.dlw.study.exception.OrderException;
import com.dlw.study.feign.AccountFeignClient;
import com.dlw.study.feign.StockFeignClient;
import com.dlw.study.service.OrderService;
import com.dlw.study.service.PaymentService;
import lombok.extern.slf4j.Slf4j;
import org.dromara.hmily.annotation.Hmily;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

/**
 * @author dengliwen
 * @date 2018/11/24
 */
@Service("paymentServiceImpl")
@Slf4j
public class PaymentServiceImpl implements PaymentService {


    private final OrderDao orderDao;

    private final AccountFeignClient accountFeignClient;

    private final StockFeignClient stockFeignClient;

    @Autowired
    public PaymentServiceImpl(OrderDao orderDao, AccountFeignClient accountFeignClient, StockFeignClient stockFeignClient) {
        this.orderDao = orderDao;
        this.accountFeignClient = accountFeignClient;
        this.stockFeignClient = stockFeignClient;
    }

    /**
     * 开启分布式事务
     * @param order
     */
    @Override
    @Hmily(confirmMethod = "confirmOrder",cancelMethod = "cancelOrder")
    public void doPayment(Order order) {
        order.setStatus(OrderStatusEnum.PAYING.getCode());
        int update = orderDao.update(order);
        if (update <= 0) {
            throw new OrderException(-1,"更新订单状态失败");
        }

        AccountDto accountDto = AccountDto.builder().userId(order.getUserId())
                .amount(order.getTotalAmount())
                .build();
        log.debug("===========执行扣减资金接口==========");
        accountFeignClient.payment(accountDto);

        log.debug("===========执行减库存接口==========");
        StockDto stockDto = StockDto.builder()
                .productId(order.getProductId())
                .count(order.getCount())
                .build();
        stockFeignClient.decrease(stockDto);

    }

    /**
     * 执行confirm阶段
     * @param order
     */
    public void confirmOrder(Order order) {
        order.setStatus(OrderStatusEnum.PAY_SUCCESS.getCode());
        orderDao.update(order);
        log.info("=========进行订单confirm操作完成================");
    }

    public void cancelOrder(Order order) {
        order.setStatus(OrderStatusEnum.PAY_FAIL.getCode());
        orderDao.update(order);
        log.info("=========进行订单cancel操作完成================");
    }
}
