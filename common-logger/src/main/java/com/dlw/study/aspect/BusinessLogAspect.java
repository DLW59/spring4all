package com.dlw.study.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

/**
 * @author dengliwen
 * @date 2019/11/9
 * @desc
 */
@Aspect
@Component
public class BusinessLogAspect implements LogAspect {

    @Override
    @Around("@annotation(com.dlw.study.annotation.BusinessLog)")
    public Object around(ProceedingJoinPoint joinPoint) {

        return null;
    }
}
