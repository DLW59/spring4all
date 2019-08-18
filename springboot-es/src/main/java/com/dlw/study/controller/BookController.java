package com.dlw.study.controller;

import com.dlw.study.domain.Book;
import com.dlw.study.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

/**
 * @author dengliwen
 * @date 2019/5/29
 * @desc
 */
@RestController
@RequestMapping("/es")
public class BookController {

    @Autowired
    private BookService bookService;

    @PostMapping("/add")
    public void add(@RequestBody Book book) {
        bookService.add(book);
    }

    @GetMapping("/search/{id}")
    public Book findById(@PathVariable String id) throws IOException {
        return bookService.findById(id);
    }

    @PostMapping("/list")
    public List<Book> listBook(){
        return null;
    }
}
