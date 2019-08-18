package com.dlw.study.feign;

import com.dlw.study.config.FeignConfig;
import com.dlw.study.dto.AccountDto;
import org.dromara.hmily.annotation.Hmily;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 * @author dengliwen
 * @date 2018/11/24
 */
@FeignClient(name = "account-service",path = "account",configuration = FeignConfig.class)
public interface AccountFeignClient {

    /**
     * 扣账户余额
     * @param accountDto
     * @return
     */
    @RequestMapping(value = "payment",method = RequestMethod.POST)
    @Hmily
    Boolean payment(@RequestBody AccountDto accountDto);
}
