package com.dlw.study.enums;

/**
 * @author dengliwen
 * @date 2019/6/6
 * @desc 日志操作类型
 */
public enum OperationType {

    NEW("新增"),
    UPDATE("修改"),
    DELETE("删除");

    private String operation;

    OperationType(String operation) {
        this.operation = operation;
    }

    public String getOperation() {
        return operation;
    }
}
