package com.dlw.study.config;

import com.dlw.study.annotation.CheckToken;
import com.dlw.study.annotation.LoginToken;
import com.dlw.study.domain.User;
import com.dlw.study.service.UserService;
import com.dlw.study.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.lang.reflect.Method;

/**
 * @author dengliwen
 * @date 2019/4/5
 * token 拦截器
 */

public class TokenInterceptor implements HandlerInterceptor {

    @Autowired
    UserService userService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 如果不是映射到方法直接通过
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        Method method = handlerMethod.getMethod();
        //检查是否有LoginToken注释，有则跳过认证
        if (method.isAnnotationPresent(LoginToken.class)) {
            LoginToken loginToken = method.getAnnotation(LoginToken.class);
            return loginToken.required();
        }

        String token = request.getParameter("token");
        if (StringUtils.isEmpty(token)) {
            token = request.getHeader("token");
        }
        //检查有没有需要用户权限的注解
        if (method.isAnnotationPresent(CheckToken.class)) {
            CheckToken checkToken = method.getAnnotation(CheckToken.class);
            if (checkToken.required()) {
                // 执行认证
                if (StringUtils.isEmpty(token)) {
                    throw new RuntimeException("无token，请重新登录");
                }
                // 获取 token 中的 user name
                String username;
                try {
                    username = (String) JwtUtil.parseJWT(token).get("username");
                } catch (Exception e) {
                    throw new RuntimeException("访问异常！");
                }
                User user = userService.findByUsername(username);
                if (user == null) {
                    throw new RuntimeException("用户不存在，请重新登录");
                }
                boolean verify = JwtUtil.isVerify(token);
                if (verify) {
                    throw new RuntimeException("非法访问！");
                }
                return true;
            }
        }
        return true;
    }


}
