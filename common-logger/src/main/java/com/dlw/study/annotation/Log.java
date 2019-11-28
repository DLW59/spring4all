package com.dlw.study.annotation;


import com.dlw.study.enums.LogType;

import java.lang.annotation.*;

/**
 * @author dengliwen
 * @date 2019/5/23
 * @desc
 */
@Target({ElementType.METHOD,ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
public @interface Log {
    LogType type();
}
