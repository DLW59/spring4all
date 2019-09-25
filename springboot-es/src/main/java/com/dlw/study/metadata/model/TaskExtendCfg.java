package com.dlw.study.metadata.model;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * @author dengliwen
 * @date 2019/9/11
 * @desc 任务配置扩展属性
 */
@Data
public class TaskExtendCfg implements Serializable {
    private static final long serialVersionUID = -7346660935233177648L;

    /**
     * 索引id
     */
    private List<String> dbuserIds;

    /**
     * 采集过滤条件  all采集所有  customer 自定义
     */
    private String collectFilter;

    /**
     采集过滤条件
     *
     */
    private List<CollectFilter> filters;

    public static class CollectFilter {
        /**
         * 操作条件 eg:equal、contain  etc
         */
        private String operation;
        /**
         * 过滤值  按名称过滤
         */
        private String value;

        public String getOperation() {
            return operation;
        }

        public void setOperation(String operation) {
            this.operation = operation;
        }

        public String getValue() {
            return value;
        }

        public void setValue(String value) {
            this.value = value;
        }
    }
}
