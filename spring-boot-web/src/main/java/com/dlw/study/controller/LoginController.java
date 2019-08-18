package com.dlw.study.controller;

import com.dlw.study.annotation.CheckToken;
import com.dlw.study.annotation.LoginToken;
import com.dlw.study.common.R;
import com.dlw.study.constant.RedisKey;
import com.dlw.study.domain.User;
import com.dlw.study.service.LoginService;
import com.dlw.study.service.RedisService;
import com.dlw.study.service.UserService;
import com.dlw.study.util.JwtUtil;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * @author dengliwen
 * @date 2019/4/5
 */
@Controller
@Api(value = "登录", tags = "登录")
@Slf4j
public class LoginController extends BaseController{

    @Autowired
    private LoginService loginService;

    @GetMapping("/index")
    public String index(HttpServletRequest request){
        User user = getUser(request);
        log.info("当前登录用户信息：{}" ,user);
        return "index";
    }

    @GetMapping(value = {"/login","/"})
    public String loginPage(){
        return "login";
    }

    @PostMapping("/doLogin")
    @LoginToken
    @ApiOperation(value = "用户登录", notes = "使用场景：用户登录")
    public R login(@RequestBody @ApiParam User user, HttpSession session) {
        if (StringUtils.isEmpty(user.getUsername())) {
            return R.fail("用户名为空");
        }
        return loginService.login(user,session);
    }

    @GetMapping("/logout")
    @ApiOperation(value = "用户登出", notes = "使用场景：用户登出")
    public String logout() {
        return "redirect:/login";
    }

}
