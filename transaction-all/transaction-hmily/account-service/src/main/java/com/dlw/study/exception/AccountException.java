package com.dlw.study.exception;

/**
 * @author dengliwen
 * @date 2018/11/25
 */
public class AccountException extends RuntimeException {

    private int code;

    public AccountException(int code,String message) {
        super(message);
        this.code = code;
    }
}
