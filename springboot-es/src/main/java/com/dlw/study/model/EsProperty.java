package com.dlw.study.model;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

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
    private List<String> clusterNode;
    private String scheme;
    private String username;
    private String password;
    private Integer connectTimeout;
    private Integer socketTimeout;
    private Integer connectRequestTimeout;
    private Integer maxConnectNum;
    private Integer maxConnectPerRoute;
    private String indexName;
    private String type;
}
