package com.dlw.study.service.impl;

import com.dlw.study.dao.AccountDao;
import com.dlw.study.domain.Account;
import com.dlw.study.dto.AccountDto;
import com.dlw.study.exception.AccountException;
import com.dlw.study.service.AccountService;
import org.dromara.hmily.annotation.Hmily;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

/**
 * @author dengliwen
 * @date 2018/11/25
 */
@Service
public class AccountServiceImpl implements AccountService {

    @Autowired
    private AccountDao accountDao;

    @Override
    @Hmily(confirmMethod = "confirmPayment",cancelMethod = "cancelPayment")
    @Transactional
    public void payment(AccountDto accountDto) {
        Account account = findByUserId(accountDto.getUserId());
        if (account.getBalance().compareTo(accountDto.getAmount()) >= 0) {
            account.setBalance(account.getBalance().subtract(accountDto.getAmount()));
            account.setFreezeAmount(account.getFreezeAmount().add(accountDto.getAmount()));
            account.setUpdateTime(new Date());
            int update = accountDao.update(account);
            if (update != 1) {
                throw new AccountException(-1,"支付失败");
            }
        }else {
            throw new AccountException(-1,"余额不足");
        }
    }

    @Override
    public Account findByUserId(String userId) {

        return accountDao.findByUserId(userId);
    }

    /**
     * 取消支付
     * @param accountDto
     */
    public void confirmPayment(AccountDto accountDto) {
        Account account = findByUserId(accountDto.getUserId());
        account.setBalance(account.getBalance().add(accountDto.getAmount()));
        account.setFreezeAmount(account.getFreezeAmount().subtract(accountDto.getAmount()));
        account.setUpdateTime(new Date());
        int update = accountDao.update(account);
        if (update != 1) {
            throw new AccountException(-1,"支付失败");
        }
    }

    /**
     * 确认支付
     * @param accountDto
     */
    public void cancelPayment(AccountDto accountDto) {
        Account account = findByUserId(accountDto.getUserId());
        account.setFreezeAmount(account.getFreezeAmount().subtract(accountDto.getAmount()));
        account.setUpdateTime(new Date());
        int update = accountDao.update(account);
        if (update != 1) {
            throw new AccountException(-1,"支付失败");
        }
    }
}
