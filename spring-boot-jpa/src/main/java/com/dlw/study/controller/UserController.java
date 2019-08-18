package com.dlw.study.controller;

import com.dlw.study.common.PageVo;
import com.dlw.study.dto.ResultData;
import com.dlw.study.service.UserService;
import com.dlw.study.vo.UserVo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;


/**
 * @author dengliwen
 * @date 2019/3/10
 */
@RequestMapping("/user")
@Controller
@Slf4j
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping(value = "/add",produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
    @ResponseBody
    public ResultData add(@RequestBody UserVo vo) {
        try {
            UserVo userVo = userService.add(vo);
            return new ResultData(0, userVo);
        }catch (Exception e) {
            return new ResultData(false,-1,"添加用户失败");
        }
    }

    @GetMapping(value = "/list",produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
    @ResponseBody
    public ResultData<PageVo<UserVo>> listUsers(@RequestParam String keywords) {
        PageVo<UserVo> list = userService.list(keywords);
        return new ResultData(0,list);
    }

    @DeleteMapping(value = "/delete/{id}",produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
    @ResponseBody
    public ResultData delete(@PathVariable String id) {
        try {
            if (StringUtils.isEmpty(id)) {
                throw new RuntimeException("id为空");
            }
            userService.delete(id);
            return new ResultData(0,id);
        }catch (Exception e) {
            log.error(e.getMessage());
            return new ResultData(false, -1,e.getMessage());
        }

    }

}
