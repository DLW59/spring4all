package com.dlw.study.dao;

import com.dlw.study.domain.Stock;
import org.springframework.stereotype.Repository;

/**
 * @author dengliwen
 * @date 2018/11/25
 */
@Repository
public interface StockDao {

    void decrease(Stock stock);

    Stock findByProductId(String productId);
}
