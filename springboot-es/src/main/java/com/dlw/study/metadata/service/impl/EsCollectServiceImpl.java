package com.dlw.study.metadata.service.impl;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.dlw.study.common.R;
import com.dlw.study.metadata.service.EsCollectService;
import lombok.SneakyThrows;
import org.apache.commons.codec.binary.Base64;
import org.elasticsearch.action.admin.indices.get.GetIndexRequest;
import org.elasticsearch.action.get.GetRequest;
import org.elasticsearch.action.get.GetResponse;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.rest.action.cat.RestTable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.Base64Utils;
import org.springframework.util.CollectionUtils;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Set;

/**
 * @author dengliwen
 * @date 2019/9/5
 * @desc
 */
@Service
public class EsCollectServiceImpl implements EsCollectService {

    @Autowired
    private RestHighLevelClient restHighLevelClient;

    @Autowired
    private RestTemplate restTemplate;

    @Override
    @SneakyThrows
    public R collect() {
        // 基本的认证头信息  es开启x-pack认证
        String username  = "elastic";
        String password = "123456";
        String msg = username + ":" + password;
        String token = Base64Utils.encodeToString(msg.getBytes(StandardCharsets.UTF_8));
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Basic " + token);
        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
        ResponseEntity<String> exchange = restTemplate.exchange("http://127.0.0.1:9200/soso*", HttpMethod.GET,
                requestEntity, String.class);
        final String object = exchange.getBody();
        final JSONObject jsonObject = JSON.parseObject(object);
        final Set<String> indexNames = jsonObject.keySet();
        final R r = R.ok();
        if (CollectionUtils.isEmpty(indexNames)) {
            return r;
        }
        indexNames.forEach(index -> {
            final JSONObject indexObject = jsonObject.getJSONObject(index);
            final Set<String> strings = indexObject.keySet();
        });
        r.setData(jsonObject);
        System.out.print(System.currentTimeMillis());//时间
        return r;
    }
}
