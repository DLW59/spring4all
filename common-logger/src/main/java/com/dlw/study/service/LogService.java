package com.dlw.study.service;

/**
 * @author dengliwen
 * @date 2019/11/9
 * @desc
 */
public interface LogService<T> {

    /**
     * 保存日志
     * @param t
     */
    void save(T t);

    /**
     * 批量保存
     * @param iterable
     */
    void save(Iterable<T> iterable);
}
