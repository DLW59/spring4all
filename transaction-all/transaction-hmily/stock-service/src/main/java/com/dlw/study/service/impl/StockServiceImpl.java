package com.dlw.study.service.impl;

import com.dlw.study.domain.Stock;
import com.dlw.study.dao.StockDao;
import com.dlw.study.dto.StockDto;
import com.dlw.study.exception.StockException;
import com.dlw.study.service.StockService;
import lombok.extern.slf4j.Slf4j;
import org.dromara.hmily.annotation.Hmily;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * @author dengliwen
 * @date 2018/11/25
 */
@Service("stockServiceImpl")
@Slf4j
public class StockServiceImpl implements StockService {

    private final StockDao stockDao;

    @Autowired
    public StockServiceImpl(StockDao stockDao) {
        this.stockDao = stockDao;
    }

    @Override
    @Hmily(confirmMethod = "confirmDecrease",cancelMethod = "cancelDecrease")
    @Transactional
    public void decrease(StockDto dto) {
        Stock stock = findByProductId(dto.getProductId());
        if (stock.getTotalInventory() < dto.getCount()) {
            throw new StockException(-1,"库存不足");
        }
        stock.setTotalInventory(stock.getTotalInventory() - dto.getCount());
        stock.setLockInventory(stock.getLockInventory() + dto.getCount());
        stockDao.decrease(stock);
    }

    @Override
    public Stock findByProductId(String productId) {
        return stockDao.findByProductId(productId);
    }

    public void confirmDecrease(StockDto dto) {
        Stock stock = findByProductId(dto.getProductId());
        stock.setLockInventory(stock.getLockInventory() - dto.getCount());
        stockDao.decrease(stock);
    }

    public void cancelDecrease(StockDto dto) {
        Stock stock = findByProductId(dto.getProductId());
        stock.setTotalInventory(stock.getTotalInventory() + dto.getCount());
        stock.setLockInventory(stock.getLockInventory() - dto.getCount());
        stockDao.decrease(stock);
    }
}
