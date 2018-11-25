package com.dlw.study.config;

import com.dlw.study.dto.ResponseData;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * @author dengliwen
 * @date 2018/11/25
 */
@ControllerAdvice
public class GlobalExceptionConfig {


    @ResponseBody
    @ExceptionHandler({RuntimeException.class})
    public ResponseData catchException() {

        return ResponseData.fail();
    }
}
