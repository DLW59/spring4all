package com.dlw.study.service.impl;

import com.dlw.study.common.R;
import com.dlw.study.constant.RedisKey;
import com.dlw.study.domain.User;
import com.dlw.study.service.LoginService;
import com.dlw.study.service.RedisService;
import com.dlw.study.service.UserService;
import com.dlw.study.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * @author dengliwen
 * @date 2019/4/6
 */
@Service
public class LoginServiceImpl implements LoginService {

    @Autowired
    private UserService userService;

    @Autowired
    private RedisService redisService;


    @Override
    public R login(User user, HttpSession session) {
        User u = userService.findByUsername(user.getUsername());
        if (null == u) {
            return R.fail("用户不存在");
        }
        if (!u.getPassword().equals(user.getPassword())) {
            return R.fail("用户密码错误");
        }
        session.setAttribute("user",u );
        String token = JwtUtil.createJWT(user.getUsername());
        Map<String,String> map = new HashMap<>();
        map.put("token",token );
        redisService.putMap(RedisKey.TOKEN_KEY_PREFIX +user.getUsername() , map, 2, TimeUnit.HOURS);
        return R.success(map);
    }
}
