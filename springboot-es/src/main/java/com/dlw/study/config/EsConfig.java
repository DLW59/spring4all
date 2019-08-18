package com.dlw.study.config;

import com.dlw.study.model.EsProperty;
import org.apache.http.HttpHost;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.impl.nio.client.HttpAsyncClientBuilder;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestClientBuilder;
import org.elasticsearch.client.RestHighLevelClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * @author dengliwen
 * @date 2019/3/28
 * 用es高级客户端
 */
@Configuration
public class EsConfig {

    @Autowired
    private EsProperty property;

    @Bean
    public RestHighLevelClient restHighLevelClient() {
        RestHighLevelClient client = new RestHighLevelClient(
                RestClient.builder(
                        new HttpHost(property.getClusterNode(), property.getPort(),
                                property.getScheme()))
                        // 主要关于异步httpclient的连接延时配置
                        .setRequestConfigCallback(builder -> {
                            builder.setConnectTimeout(property.getConnectTimeout());
                            builder.setSocketTimeout(property.getSocketTimeout());
                            builder.setConnectionRequestTimeout(property.getConnectRequestTimeout());
                            return builder;
                            // 主要关于异步httpclient的连接数配置
                        }).setHttpClientConfigCallback(httpAsyncClientBuilder -> {
                    httpAsyncClientBuilder.setMaxConnTotal(property.getMaxConnectNum());
                    httpAsyncClientBuilder.setMaxConnPerRoute(property.getMaxConnectPerRoute());
                    return httpAsyncClientBuilder;
                }));
        return client;
    }

}
