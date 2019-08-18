package com.dlw.study.dao;

import com.dlw.study.domain.Account;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;
import org.springframework.stereotype.Repository;

/**
 * @author dengliwen
 * @date 2018/11/25
 */
@Repository
@Mapper
public interface AccountDao {

    @Update("UPDATE account SET balance = #{balance},freeze_amount = #{freezeAmount},\n" +
            "update_time = #{updateTime} where user_id = #{userId} and balance > 0")
    int update(Account account);

    Account findByUserId(String userId);
}
