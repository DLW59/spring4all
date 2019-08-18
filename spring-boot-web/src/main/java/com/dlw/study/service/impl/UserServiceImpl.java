package com.dlw.study.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.dlw.study.dao.UserDao;
import com.dlw.study.domain.User;
import com.dlw.study.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;

/**
 * @author dengliwen
 * @date 2019/4/5
 */
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserDao userDao;

    @Override
    public User findByUsername(String username) {
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.lambda().eq(User::getUsername, username);
        return userDao.selectOne(wrapper);
    }

    @Override
    public void add(User user) {
        user.setCreateTime(new Date());
        user.setUpdateTime(null);
        userDao.insert(user);
    }
}
