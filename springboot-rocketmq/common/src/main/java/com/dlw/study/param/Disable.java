package com.dlw.study.param;

import com.alibaba.fastjson.JSON;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.List;

/**
 * @author zhangyouwen
 */
@Setter
@Getter
public class Disable implements Serializable {

    private static final long serialVersionUID = 5104970081367583520L;

    private List<String> code;
    private List<Operate> operate;

    @Override
    public String toString() {
        return JSON.toJSONString(this);
    }

}
