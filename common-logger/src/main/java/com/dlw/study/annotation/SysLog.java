package com.dlw.study.annotation;

import com.dlw.study.enums.LogType;
import com.dlw.study.enums.OperationType;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * @author dengliwen
 * @date 2019/11/9
 * @desc 系统日志
 */
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Log(type = LogType.SYSTEM)
public @interface SysLog {

    //应用、服务
    String app() default "";

    //模块
    String module();

    //描述
    String description() default "";
}
