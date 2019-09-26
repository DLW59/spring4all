package com.dlw.study.listener;

import com.alibaba.fastjson.JSON;
import com.dlw.study.enums.MessageStatusEnum;
import com.dlw.study.model.Order;
import com.dlw.study.service.OrderService;
import com.netflix.discovery.converters.Auto;
import lombok.extern.slf4j.Slf4j;
import org.apache.rocketmq.spring.annotation.RocketMQTransactionListener;
import org.apache.rocketmq.spring.core.RocketMQLocalTransactionListener;
import org.apache.rocketmq.spring.core.RocketMQLocalTransactionState;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import sun.rmi.runtime.Log;

/**
 * @author dengliwen
 * @date 2019/9/25
 * @desc
 */
@Slf4j
@RocketMQTransactionListener(txProducerGroup = "order-tx-produce-group", corePoolSize = 5, maximumPoolSize = 10)
public class OrderTransactionListenerImpl implements RocketMQLocalTransactionListener {

    @Autowired
    private OrderService orderService;
    /**
     * 提交本地事务
     */
    @Override
    public RocketMQLocalTransactionState executeLocalTransaction(Message message, Object o) {
        final String body = new String((byte[]) message.getPayload());
        final Order order = JSON.parseObject(body, Order.class);
        orderService.save(order);

        String produce = (String)message.getHeaders().get(MessageStatusEnum.PRODUCE_FAIL.name());
        if (MessageStatusEnum.PRODUCE_FAIL.name().equals(produce)) {
            log.info("订单进程挂了，事务消息没提交");
            throw new RuntimeException("============订单服务器挂了");
        }
        //提交事务消息
        return RocketMQLocalTransactionState.COMMIT;
    }

    /**
     * 事务回查接口
     *
     * 如果事务消息一直没提交，则定时判断订单数据是否已经插入
     *     是：提交事务消息
     *     否：回滚事务消息
     */
    @Override
    public RocketMQLocalTransactionState checkLocalTransaction(Message message) {
        String orderId = (String)message.getHeaders().get("orderId");
        log.info("事务回查");
        //判断之前的事务是否已经提交：订单记录是否已经保存
        int count = 1;
        //select count(1) from t_order where order_id = ${orderId}
       log.info("============事务回查-订单已生成-提交事务消息");
        return count > 0 ? RocketMQLocalTransactionState.COMMIT : RocketMQLocalTransactionState.ROLLBACK;
    }
}
