package com.dlw.study.exception;

/**
 * @author dengliwen
 * @date 2018/11/24
 */
public class OrderException extends RuntimeException {

    private int code;

    private String msg;

    public OrderException(int code,String msg) {
        super();
        this.code = code;
        this.msg = msg;
    }

    public OrderException(String message) {
        super(message);
    }


}
