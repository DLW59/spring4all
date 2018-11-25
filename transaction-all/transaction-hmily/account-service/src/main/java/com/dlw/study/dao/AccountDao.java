package com.dlw.study.dao;

import com.dlw.study.domain.Account;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

/**
 * @author dengliwen
 * @date 2018/11/25
 */
@Repository
public interface AccountDao {

    int update(@Param("account") Account account);

    Account findByUserId(String userId);
}
