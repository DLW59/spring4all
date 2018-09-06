package com.dlw.study;

import com.aliyun.openservices.shade.com.alibaba.fastjson.JSON;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.List;

/**
 * @author zhangyouwen
 */
@Getter
@Setter
public class Add implements Serializable{

    private static final long serialVersionUID = 6519431219183197153L;
    /**
     * 供应商
     */
    private String supplier;
    private List<Point> point;
    private List<Operate> operate;


    @Override
    public String toString() {
        return JSON.toJSONString(this);
    }

    @Setter
    @Getter
    public static class Point implements Serializable {

        private static final long serialVersionUID = -5086045979153271437L;
        /**
         * 设备类型
         */
        private String type;
        /**
         * 设备编码
         */
        private String code;

        @Override
        public String toString() {
            return JSON.toJSONString(this);
        }
    }

}
