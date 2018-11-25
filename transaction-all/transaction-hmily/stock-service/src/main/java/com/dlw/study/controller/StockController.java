package com.dlw.study.controller;

import com.dlw.study.dto.StockDto;
import com.dlw.study.service.StockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author dengliwen
 * @date 2018/11/25
 */
@RestController
@RequestMapping("/stock")
public class StockController {

    @Autowired
    private StockService stockService;

    @PostMapping("/decrease")
    public void decrease(@RequestBody StockDto dto) {
        stockService.decrease(dto);
    }
}
