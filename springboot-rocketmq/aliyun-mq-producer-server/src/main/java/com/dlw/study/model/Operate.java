package com.dlw.study.model;

import com.alibaba.fastjson.JSON;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

/**
 * @author zhangyouwen
 */
@Setter
@Getter
public class Operate implements Serializable {

    private static final long serialVersionUID = -9018219269574176608L;

    /**
     * SSP点位所在的表
     */
    private String tableName;
    /**
     * 点位ID
     */
    private String id;
    /**
     * 点位状态
     */
    private String status;

    @Override
    public String toString() {
        return JSON.toJSONString(this);
    }

}
