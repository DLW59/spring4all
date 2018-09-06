package com.dlw.study.springbootkafka.message;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * @author dlw
 * @date 2018/9/2
 * @desc
 */
@Data
@AllArgsConstructor
public class Message1 {

    private String id;
    private String content;
    private Long time;
}
