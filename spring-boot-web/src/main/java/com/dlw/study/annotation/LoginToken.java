package com.dlw.study.annotation;

import java.lang.annotation.*;

/**
 * @author dengliwen
 * @date 2019/4/5
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE,ElementType.METHOD})
@Documented
@Inherited
public @interface LoginToken {
    boolean required() default true;
}
