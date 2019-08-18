package com.dlw.study.config;

import com.dlw.study.common.R;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.ReflectionUtils;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.lang.reflect.Field;

/**
 * @author dengliwen
 * @date 2019/4/6
 * 全局异常处理
 */
@Configuration
@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @Value("${spring.application.name}")
    private String serviceName;

    /**
     * 微服务之间异常传递
     * @param e
     * @param response
     * @throws IOException
     */
    /*@ExceptionHandler(Exception.class)
    public void handleException(Exception e, HttpServletResponse response) throws IOException {
        log.error("handleException", e); // 记录日志
        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR); // 500
        // 设置异常元数据到header
        response.setHeader("errClass", e.getClass().getCanonicalName());
        response.setHeader("errService", serviceName);
        response.setHeader("errMsg", e.getMessage());
        Field codeField = ReflectionUtils.findField(e.getClass(), "code");
        if (codeField != null) {
            codeField.setAccessible(true);
            Object codeValue = ReflectionUtils.getField(codeField, e);
            if (codeValue != null) {
                response.setHeader("errCode", codeValue.toString());
            }
        }

        // 序列化异常
        ObjectOutputStream oos = new ObjectOutputStream(response.getOutputStream());
        oos.writeObject(e);
        oos.flush();
    }*/

    @ExceptionHandler(Exception.class)
    @ResponseBody
    public R exceptionHandler(Exception e) {
        log.error("Controller 捕获异常 Exception", e);
        return R.fail(e.getMessage());
    }
}
