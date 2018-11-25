package com.dlw.study.dao;

import com.dlw.study.domain.Order;
import org.springframework.stereotype.Repository;

/**
 * @author dengliwen
 * @date 2018/11/24
 */
@Repository
public interface OrderDao {

    int save(Order order);

    int update(Order order);
}
