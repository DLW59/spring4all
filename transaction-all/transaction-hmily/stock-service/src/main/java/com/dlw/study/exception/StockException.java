package com.dlw.study.exception;

/**
 * @author dengliwen
 * @date 2018/11/25
 */
public class StockException extends RuntimeException {

    private int code;

    public StockException( int code,String message) {
        super(message);
        this.code = code;
    }
}
