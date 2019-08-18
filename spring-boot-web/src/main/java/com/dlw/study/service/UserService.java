package com.dlw.study.service;

import com.dlw.study.domain.User;

/**
 * @author dengliwen
 * @date 2019/4/5
 */
public interface UserService {

    User findByUsername(String username);

    void add(User user);
}
