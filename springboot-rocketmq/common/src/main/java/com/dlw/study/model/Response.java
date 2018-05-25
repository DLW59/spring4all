package com.dlw.study.model;

import com.alibaba.fastjson.JSON;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

/**
 *
 * @author zhangyouwen
 * @date 2017/7/11
 */
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Response implements Serializable {

    private static final long serialVersionUID = 1445780589326547783L;

    private boolean status = true;
    private String code = ResponseCode.SUCCESS;
    private String msg = null;
    private Object data = null;

    public Response(boolean status, String code) {
        this.status = status;
        this.code = code;
    }

    public Response(boolean status, String code, String msg) {
        this.status = status;
        this.code = code;
        this.msg = msg;
    }

    public Response(String msg, Object data) {
        this.msg = msg;
        this.data = data;
    }

    public Response(Object data) {
        this.data = data;
    }

    @Override
    public String toString() {
        return JSON.toJSONString(this);
    }

}
