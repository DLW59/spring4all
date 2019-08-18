package com.dlw.study.service.impl;

import com.alibaba.fastjson.JSON;
import com.dlw.study.domain.Book;
import com.dlw.study.listener.IndexListener;
import com.dlw.study.model.EsProperty;
import com.dlw.study.service.BookService;
import lombok.extern.slf4j.Slf4j;
import org.elasticsearch.action.ActionListener;
import org.elasticsearch.action.DocWriteResponse;
import org.elasticsearch.action.get.GetRequest;
import org.elasticsearch.action.get.GetResponse;
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.action.index.IndexResponse;
import org.elasticsearch.action.support.replication.ReplicationResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.common.xcontent.XContentType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.UUID;

/**
 * @author dengliwen
 * @date 2019/5/29
 * @desc
 */
@Service
@Slf4j
public class BookServiceImpl implements BookService {

    @Autowired
    private RestHighLevelClient client;

    @Autowired
    private EsProperty property;

    @Override
    public void add(Book book) {
        book.setId(UUID.randomUUID().toString());
        book.setCreateTime(System.currentTimeMillis());
        String s = book.toString();
        IndexRequest indexRequest = new IndexRequest(property.getIndexName());
        indexRequest.id(book.getId())
                .source(s, XContentType.JSON);
        //异步创建索引
        client.indexAsync(indexRequest, RequestOptions.DEFAULT, new IndexListener());
    }

    @Override
    public Book findById(String id) throws IOException {
        GetRequest getRequest = new GetRequest(property.getIndexName());
        getRequest.id(id);
        GetResponse response = client.get(getRequest, RequestOptions.DEFAULT);
        if (response.isExists()) {
            String source = response.getSourceAsString();
            Book book = JSON.parseObject(source, Book.class);
            return book;
        }
        return null;
    }
}
