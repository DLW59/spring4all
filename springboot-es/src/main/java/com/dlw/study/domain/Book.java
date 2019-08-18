package com.dlw.study.domain;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.serializer.SerializerFeature;
import lombok.Data;
import org.springframework.boot.json.JacksonJsonParser;

import java.io.Serializable;

/**
 * @author dengliwen
 * @date 2019/5/29
 * @desc
 */
@Data
public class Book implements Serializable {
    private static final long serialVersionUID = 2992279063406017061L;

    private String id;         //  图书ID

    private String name;        //  图书名称

    private String author;      //  作者

    private Double price;       //  图书价格

    private Long createTime;      //  创建时间

    private Integer status;     //  状态（1：可售，0：不可售）

    @Override
    public String toString() {
        return JSON.toJSONString(this, SerializerFeature.NotWriteDefaultValue);
    }
}
