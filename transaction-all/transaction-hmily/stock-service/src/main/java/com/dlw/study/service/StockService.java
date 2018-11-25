package com.dlw.study.service;

import com.dlw.study.domain.Stock;
import com.dlw.study.dto.StockDto;

/**
 * @author dengliwen
 * @date 2018/11/25
 */
public interface StockService {

    void decrease(StockDto stock);

    Stock findByProductId(String productId);
}
