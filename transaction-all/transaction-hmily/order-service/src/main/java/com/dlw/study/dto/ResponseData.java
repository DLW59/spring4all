package com.dlw.study.dto;

import lombok.Builder;
import lombok.Data;

import java.io.Serializable;

/**
 * @author dengliwen
 * @date 2018/11/24
 */
@Data
@Builder
public class ResponseData<T> implements Serializable {
    private static final long serialVersionUID = 1750316222635425327L;

    private boolean status;
    private int code;
    private String msg;
    private T data;

    public static ResponseData fail() {
        return ResponseData.builder().status(Boolean.FALSE)
                .code(500)
                .build();
    }

    public static ResponseData success() {
        return ResponseData.builder().status(Boolean.TRUE)
                .code(0)
                .build();
    }
}
