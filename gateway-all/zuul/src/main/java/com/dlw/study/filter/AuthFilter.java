package com.dlw.study.filter;

import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import com.netflix.zuul.exception.ZuulException;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;

/**
 * @author dengliwen
 * @date 2019/9/2
 * @desc 认证过滤器
 */
@Component
@Slf4j
public class AuthFilter extends ZuulFilter {

    @Override
    public String filterType() {
        //在转发到目标地址前执行  用于认证等操作
        return "pre";
    }

    @Override
    public int filterOrder() {
        //优先级，越小越级别高
        return 0;
    }

    //是否要进行过滤
    @Override
    public boolean shouldFilter() {
        RequestContext context = RequestContext.getCurrentContext();
        HttpServletRequest servletRequest = context.getRequest();
        //自定义要过滤的请求路径
        if ("/api/soso/login".equals(servletRequest.getRequestURI())) {
            return true;
        }
        return false;
    }

    //过滤的具体逻辑
    //这里是认证就是认证逻辑
    @Override
    public Object run() throws ZuulException {
        RequestContext context = RequestContext.getCurrentContext();
        HttpServletRequest servletRequest = context.getRequest();
        String token = servletRequest.getHeader("token");
        //token为空
        if (StringUtils.isBlank(token)) {
           token = servletRequest.getParameter("token");
        }
        if (StringUtils.isBlank(token)) {
            log.error("认证失败");
            context.setSendZuulResponse(false);//不放行
            context.setResponseStatusCode(401);//返回一个http状态码
            return null;
        }
        //校验token在redis是否存在、是否正确
        return null;
    }
}
