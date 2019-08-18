package com.dlw.study.model;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * @author dengliwen
 * @date 2019/5/29
 * @desc
 */
@Configuration
@Data
@ConfigurationProperties(prefix = "es")
public class EsProperty {

    private String clusterName;
    private String clusterNode;
    private Integer port;
    private String scheme;
    private Integer connectTimeout;
    private Integer socketTimeout;
    private Integer connectRequestTimeout;
    private Integer maxConnectNum;
    private Integer maxConnectPerRoute;
    private String indexName;
    private String type;
}
