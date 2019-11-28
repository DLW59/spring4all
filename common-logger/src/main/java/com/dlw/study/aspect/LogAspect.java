package com.dlw.study.aspect;

import org.aspectj.lang.ProceedingJoinPoint;

/**
 * @author dengliwen
 * @date 2019/11/9
 * @desc
 */
public interface LogAspect {

    Object around(ProceedingJoinPoint joinPoint);
}
