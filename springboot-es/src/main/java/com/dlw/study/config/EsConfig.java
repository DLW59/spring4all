package com.dlw.study.config;

import com.dlw.study.model.EsProperty;
import org.apache.http.HeaderElement;
import org.apache.http.HeaderElementIterator;
import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.message.BasicHeaderElementIterator;
import org.apache.http.protocol.HTTP;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestClientBuilder;
import org.elasticsearch.client.RestHighLevelClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.util.Assert;

import java.util.ArrayList;
import java.util.List;

/**
 * @author dengliwen
 * @date 2019/3/28
 * 用es高级客户端 支持es集群
 */
@Configuration
public class EsConfig {

    @Autowired
    private EsProperty property;

    @Bean("restHighLevelClient")
    public RestHighLevelClient getRestHighLevelClient() {
        List<HttpHost> httpHosts = getHttpHosts();

        HttpHost[] httpHostArr = httpHosts.toArray(new HttpHost[0]);
        RestClientBuilder builder = RestClient.builder(httpHostArr);

        builder.setRequestConfigCallback(requestConfigBuilder -> {
            requestConfigBuilder.setConnectTimeout(property.getConnectTimeout());
            requestConfigBuilder.setSocketTimeout(property.getSocketTimeout());
            requestConfigBuilder.setConnectionRequestTimeout(property.getConnectRequestTimeout());
            return requestConfigBuilder;
        });

        builder.setHttpClientConfigCallback(httpClientBuilder -> {
            httpClientBuilder.setMaxConnTotal(property.getMaxConnectNum());
            httpClientBuilder.setMaxConnPerRoute(property.getMaxConnectPerRoute());
            return httpClientBuilder;
        });
        return new RestHighLevelClient(builder);

    }

    /**
     * 基于x-pack认证客户端
     * @return
     */
    @Primary
    @Bean(name = "xPackRestHighLevelClient")
    public RestHighLevelClient getRestHighLevelClientForXPack() {
        List<HttpHost> httpHosts = getHttpHosts();
        HttpHost[] httpHostArr = httpHosts.toArray(new HttpHost[0]);

        //base认证
        final CredentialsProvider credentialsProvider = new BasicCredentialsProvider();
        credentialsProvider.setCredentials(AuthScope.ANY,
                new UsernamePasswordCredentials(property.getUsername(), property.getPassword()));

        RestClientBuilder builder = RestClient.builder(httpHostArr);

        builder.setRequestConfigCallback(requestConfigBuilder -> {
            requestConfigBuilder.setConnectTimeout(property.getConnectTimeout());
            requestConfigBuilder.setSocketTimeout(property.getSocketTimeout());
            requestConfigBuilder.setConnectionRequestTimeout(property.getConnectRequestTimeout());
            return requestConfigBuilder;
        });

        builder.setHttpClientConfigCallback(httpClientBuilder -> {
            httpClientBuilder.setMaxConnTotal(property.getMaxConnectNum());
            httpClientBuilder.setMaxConnPerRoute(property.getMaxConnectPerRoute());
            httpClientBuilder.disableAuthCaching();
            httpClientBuilder.setKeepAliveStrategy((httpResponse, httpContext) -> {
                final HeaderElementIterator it = new BasicHeaderElementIterator(
                        httpResponse.headerIterator(HTTP.CONN_KEEP_ALIVE));
                while (it.hasNext()) {
                    final HeaderElement he = it.nextElement();
                    final String param = he.getName();
                    final String value = he.getValue();
                    if (value != null && param.equalsIgnoreCase("timeout")) {
                        try {
                            return Long.parseLong(value) * 1000;
                        } catch (final NumberFormatException ignore) {
                        }
                    }
                }
                return 10 * 1000; //默认10秒
            }).setDefaultCredentialsProvider(credentialsProvider);
//            httpClientBuilder.setDefaultCredentialsProvider(credentialsProvider);
            return httpClientBuilder;
        });
        return new RestHighLevelClient(builder);
    }

    /**
     * 获取集群节点
     * @return
     */
    private List<HttpHost> getHttpHosts() {
        List<HttpHost> httpHosts = new ArrayList<>();

        for (String node : property.getClusterNode()) {
            try {
                String[] parts = node.split(":");
                Assert.notNull(parts,"Must defined");
                Assert.state(parts.length == 2, "must be defined as 'host:port'");
                httpHosts.add(new HttpHost(parts[0], Integer.parseInt(parts[1]), property.getScheme()));
            } catch (RuntimeException ex) {
                throw new IllegalStateException("Invalid ES nodes " + "property '" + node + "'", ex);
            }
        }
        return httpHosts;
    }


}
