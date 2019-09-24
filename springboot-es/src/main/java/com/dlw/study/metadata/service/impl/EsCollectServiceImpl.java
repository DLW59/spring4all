package com.dlw.study.metadata.service.impl;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.dlw.study.common.R;
import com.dlw.study.metadata.constant.EsIndexPropertiesConstant;
import com.dlw.study.metadata.domain.EsIndexCollectPo;
import com.dlw.study.metadata.service.EsCollectService;
import com.dlw.study.metadata.service.EsIndexCollectService;
import com.dlw.study.model.EsProperty;
import lombok.SneakyThrows;
import org.elasticsearch.client.RestHighLevelClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.Base64Utils;
import org.springframework.util.CollectionUtils;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * @author dengliwen
 * @date 2019/9/5
 * @desc
 */
@Service
public class EsCollectServiceImpl implements EsCollectService {

    private static final String SCHEMA = "http://";
    private static final String SEPARATOR = "/";
    private static final String WILDCARD = "*";

    @Autowired
    private EsProperty esProperty;

    @Autowired
    private RestHighLevelClient restHighLevelClient;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private EsIndexCollectService esIndexCollectService;

    @Override
    @SneakyThrows
    public R collect(String username,String password) {
        // 基本的认证头信息  es开启x-pack认证
//        String username  = "elastic";
//        String password = "123456";
        String msg = username + ":" + password;
        String token = Base64Utils.encodeToString(msg.getBytes(StandardCharsets.UTF_8));
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Basic " + token);
        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
        final List<String> clusterNode = esProperty.getClusterNode();
        //todo 应该加一个负载算法避免每次都访问同一个节点
        final String url = clusterNode.get(0);
        ResponseEntity<String> exchange = restTemplate.exchange(SCHEMA + url + SEPARATOR + "soso*", HttpMethod.GET,
                requestEntity, String.class);
        final String object = exchange.getBody();
        final JSONObject jsonObject = JSON.parseObject(object);
        final Set<String> indexNames = jsonObject.keySet();
        final R r = R.ok();
        if (CollectionUtils.isEmpty(indexNames)) {
            return r;
        }
        List<EsIndexCollectPo> pos = new ArrayList<>(indexNames.size() + 1);
        indexNames.forEach(index -> {
            EsIndexCollectPo po = new EsIndexCollectPo();
            final JSONObject indexObject = jsonObject.getJSONObject(index);
            final JSONObject aliases = indexObject.getJSONObject(EsIndexPropertiesConstant.ALIASES);
            final JSONObject mappings = indexObject.getJSONObject(EsIndexPropertiesConstant.MAPPINGS);
            final JSONObject settings = indexObject.getJSONObject(EsIndexPropertiesConstant.SETTINGS);
            po.setAliases(aliases.toJSONString());
            po.setMappings(mappings.toJSONString());
            po.setSettings(settings.toJSONString());
            po.setIndexAllInfo(indexObject.toJSONString());
            po.setIndexName(index);
            pos.add(po);
        });
        esIndexCollectService.batchAdd(pos);
        r.setData(pos);
        return r;
    }
}
