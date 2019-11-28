package com.dlw.study.aspect;

import cn.hutool.http.HttpUtil;
import com.dlw.study.annotation.SysLog;
import com.dlw.study.domain.SysLogVo;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.util.Objects;

/**
 * @author dengliwen
 * @date 2019/11/9
 * @desc
 */
@Aspect
@Component
public class SysLogAspect implements LogAspect {

    @Override
    @Around("@annotation(com.dlw.study.annotation.SysLog)")
    public Object around(ProceedingJoinPoint joinPoint) {
        HttpServletRequest request = ((ServletRequestAttributes) Objects
                .requireNonNull(RequestContextHolder.getRequestAttributes())).getRequest();
        SysLogVo sysLogVo = new SysLogVo();
        MethodSignature methodSignature = (MethodSignature) joinPoint.getSignature();
        SysLog sysLog = methodSignature.getMethod().getDeclaredAnnotation(SysLog.class);
        sysLogVo.setApp(sysLog.app());
        sysLogVo.setModule(sysLog.module());
        sysLogVo.setDescription(sysLog.description());
        sysLogVo.setMethod(request.getMethod());
        sysLogVo.setParams(HttpUtil.toParams(request.getParameterMap()));

        return null;
    }
}
