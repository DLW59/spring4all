package com.dlw.study.controller;

import com.dlw.study.dto.ResponseData;
import com.dlw.study.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

/**
 * @author dengliwen
 * @date 2018/11/24
 */
@RestController
@RequestMapping("/order")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/pay")
    public ResponseData orderPay(@RequestParam("count") int count,
                                 @RequestParam("amount") BigDecimal amount) {
        orderService.orderPay(count,amount);
        return ResponseData.success();
    }
}
