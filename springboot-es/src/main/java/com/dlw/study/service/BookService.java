package com.dlw.study.service;

import com.dlw.study.domain.Book;

import java.io.IOException;

/**
 * @author dengliwen
 * @date 2019/5/29
 * @desc
 */
public interface BookService {

    void add(Book book);

    Book findById(String id) throws IOException;
}
