package com.dlw.study.common;

import lombok.Data;

import java.io.Serializable;

/**
 * @author dengliwen
 * @date 2019/3/31
 * 统一返回对象
 */
@Data
public class R<T> implements Serializable {
    private static final long serialVersionUID = -6448278466608870336L;

    private int code;
    private boolean status;
    private String msg;
    private T data;

    public R(int code, boolean status) {
        this.code = code;
        this.status = status;
    }

    public R(int code, boolean status, String msg) {
        this.code = code;
        this.status = status;
        this.msg = msg;
    }

    public R(int code, boolean status, T data) {
        this.code = code;
        this.status = status;
        this.data = data;
    }
}
