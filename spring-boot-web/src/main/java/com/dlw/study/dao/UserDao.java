package com.dlw.study.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.dlw.study.domain.User;
import org.springframework.stereotype.Repository;

/**
 * @author dengliwen
 * @date 2019/4/6
 */
@Repository
public interface UserDao extends BaseMapper<User> {
}
