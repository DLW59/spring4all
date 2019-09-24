package com.dlw.study.model;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.serializer.SerializerFeature;
import lombok.Builder;
import lombok.Data;

import java.io.Serializable;

/**
 * @author dengliwen
 * @date 2019/9/24
 * @desc
 */
@Data
@Builder
public class Index implements Serializable {
    private static final long serialVersionUID = 6331842040123978510L;

    private Object aliases;
    private Object mappings;
    private Object settings;

//    @Override
//    public String toString() {
//        return JSON.toJSONString(this, SerializerFeature.WriteMapNullValue);
//    }
}
