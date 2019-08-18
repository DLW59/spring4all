package com.dlw.study.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author dengliwen
 * @date 2019/5/21
 * @desc
 */
@RestController
public class ProducerController {


    @GetMapping("/produce")
    public String produce() {
        return "producing...";
    }
}
