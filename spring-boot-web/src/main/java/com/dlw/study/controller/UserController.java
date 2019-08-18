package com.dlw.study.controller;

import com.dlw.study.annotation.CheckToken;
import com.dlw.study.common.R;
import com.dlw.study.domain.User;
import com.dlw.study.service.UserService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author dengliwen
 * @date 2019/4/6
 */
@RestController
@RequestMapping("/api/user")
@Api(value = "用户管理",tags = "用户管理")
public class UserController extends BaseController{

    @Autowired
    private UserService userService;

    @PostMapping(value = "/add",produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
    @CheckToken
    @ApiOperation(value = "添加用户")
    public R add(@RequestBody @ApiParam User user) {
        userService.add(user);
        return R.ok();
    }
}
