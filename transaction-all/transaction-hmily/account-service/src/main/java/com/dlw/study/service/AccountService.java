package com.dlw.study.service;

import com.dlw.study.domain.Account;
import com.dlw.study.dto.AccountDto;

/**
 * @author dengliwen
 * @date 2018/11/25
 */
public interface AccountService {

    void payment(AccountDto accountDto);

    Account findByUserId(String userId);
}
