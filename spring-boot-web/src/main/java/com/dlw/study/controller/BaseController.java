package com.dlw.study.controller;

import com.dlw.study.domain.User;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

/**
 * @author dengliwen
 * @date 2019/4/11
 */
public abstract class BaseController {

    public HttpSession getSession(HttpServletRequest request) {
        return request.getSession();
    }

    public User getUser(HttpServletRequest request) {
        return (User) getSession(request).getAttribute("user");
    }

    public void setUser(HttpServletRequest request,User user) {
         getSession(request).setAttribute("user", user);
    }

}
