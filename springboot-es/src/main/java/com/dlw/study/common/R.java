package com.dlw.study.common;


import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * @author dengliwen
 * @date 2019/3/31
 * 统一返回对象
 */
@Data
@NoArgsConstructor
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

    public R(int code, boolean status, String msg, T data) {
        this.code = code;
        this.status = status;
        this.msg = msg;
        this.data = data;
    }


    public static R ok(){
        return new R(0, true);
    }

    public static R ok(String msg){
        return new R(0, true,msg);
    }

    public static R fail(String msg){
        return new R(500, false,msg);
    }

    public static R fail(int code, String msg){
        return new R(code, false,msg);
    }

    public static <T> R success(T data) {
        return new R<>(0, true,data);
    }

    public static R success(String msg) {
        return new R<>(0, true,msg);
    }
}
