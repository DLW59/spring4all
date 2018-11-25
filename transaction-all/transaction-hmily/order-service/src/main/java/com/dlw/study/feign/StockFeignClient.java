package com.dlw.study.feign;

import com.dlw.study.config.FeignConfig;
import com.dlw.study.dto.AccountDto;
import com.dlw.study.dto.StockDto;
import org.dromara.hmily.annotation.Hmily;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * @author dengliwen
 * @date 2018/11/24
 */
@FeignClient(name = "stock-service",path = "stock",configuration = FeignConfig.class)
public interface StockFeignClient {

    /**
     * 减库存
     * @param stockDto
     * @return
     */
    @RequestMapping("decrease")
    @Hmily
    Boolean decrease(@RequestBody StockDto stockDto);
}
