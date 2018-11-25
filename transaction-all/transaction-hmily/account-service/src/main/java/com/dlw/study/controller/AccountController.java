package com.dlw.study.controller;

import com.dlw.study.dto.AccountDto;
import com.dlw.study.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author dengliwen
 * @date 2018/11/25
 */
@RestController
@RequestMapping("/account")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @PostMapping("/payment")
    public void payment(@RequestBody AccountDto dto) {
        accountService.payment(dto);
    }


}
