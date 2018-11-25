package com.dlw.study.config;

import feign.Feign;
import feign.InvocationHandlerFactory;
import org.dromara.hmily.springcloud.feign.HmilyFeignHandler;
import org.dromara.hmily.springcloud.feign.HmilyRestTemplateInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

/**
 * @author dengliwen
 * @date 2018/11/24
 */
@Configuration
public class FeignConfig {

    @Bean
    @Scope("prototype")
    public Feign.Builder feignBuilder() {
        return Feign.builder().requestInterceptor(new HmilyRestTemplateInterceptor())
                .invocationHandlerFactory(invocationHandlerFactory());
    }

    @Bean
    public InvocationHandlerFactory invocationHandlerFactory() {
        return (target, dispatch) -> {
            HmilyFeignHandler handler = new HmilyFeignHandler();
            //handler.setTarget(target);
            handler.setHandlers(dispatch);
            return handler;
        };
    }
}
