package com.dlw.study.service;

import com.dlw.study.common.R;
import com.dlw.study.domain.User;

import javax.servlet.http.HttpSession;

/**
 * @author dengliwen
 * @date 2019/4/6
 */
public interface LoginService {

    R login(User user, HttpSession session);
}
