package com.dlw.study.param;

import com.alibaba.fastjson.JSON;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

/**
 * @author zhangyouwen
 */
@Setter
@Getter
public class Taboo implements Serializable{

    private static final long serialVersionUID = 4817702181397696365L;
    private String code;
    private String[] taboo;

    @Override
    public String toString() {
        return JSON.toJSONString(this);
    }
}
