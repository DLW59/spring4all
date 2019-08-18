package com.dlw.study.dto;

import com.alibaba.fastjson.JSON;
import lombok.Data;

import java.io.Serializable;

/**
 * @author dengliwen
 * @date 2019/3/7
 */
@Data
public class ResultData<T> implements Serializable {

    private static final long serialVersionUID = -8156154093255458770L;
    private boolean status = Boolean.TRUE;
    private int code = 0;
    private T data;
    private String msg;

    public ResultData() {
        this(true,0);
    }

    public ResultData(boolean status, int code) {
        this.status = status;
        this.code = code;
    }

    public ResultData(int code, T data) {
        this.code = code;
        this.data = data;
    }

    public ResultData(boolean status, String msg) {
        this.status = status;
        this.msg = msg;
    }

    public ResultData(boolean status, int code,String msg) {
        this.status = status;
        this.code = code;
        this.msg = msg;
    }

    @Override
    public String toString() {
        return JSON.toJSONString(this);
    }
}
