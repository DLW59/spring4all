package com.dlw.study.controller;

import com.dlw.study.domain.User;
import com.dlw.study.dto.ResultData;
import com.dlw.study.repository.UserRepository;
import com.dlw.study.service.RoleService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

/**
 * @author dengliwen
 * @date 2019/3/6
 */
@Controller
@Slf4j
public class IndexController {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleService roleService;

    @RequestMapping(value = {"/", "/index"})
    public String index() {
        return "index";
    }

    @RequestMapping("/demo1")
    public String demo1(@RequestParam(required = false) String request, Pageable pageable) {
        System.out.println(request);
        return "demo1";
    }

//    ==================完整demo代码========================

    @RequestMapping("/role")
    public String role() {
        return "role";
    }

    @RequestMapping("/user")
    public String user() {
        return "user";
    }

    @GetMapping("/send")
    public void send(){
        restTemplate.getForObject("http://localhost:9000/sms/send", String.class);
    }




}
