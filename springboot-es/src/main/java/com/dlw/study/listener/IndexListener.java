package com.dlw.study.listener;

import lombok.extern.slf4j.Slf4j;
import org.elasticsearch.action.ActionListener;
import org.elasticsearch.action.DocWriteResponse;
import org.elasticsearch.action.index.IndexResponse;
import org.elasticsearch.action.support.replication.ReplicationResponse;
import org.springframework.stereotype.Component;

/**
 * @author dengliwen
 * @date 2019/5/29
 * @desc 创建索引监听器
 */
@Slf4j
public class IndexListener implements ActionListener<IndexResponse> {

    @Override
    public void onResponse(IndexResponse indexResponse) {
        String index = indexResponse.getIndex();
        String type = indexResponse.getType();
        String id = indexResponse.getId();
        long version = indexResponse.getVersion();
        log.info("Index: {}, Type: {}, Id: {}, Version: {}", index, type, id, version);
        if (indexResponse.getResult() == DocWriteResponse.Result.CREATED) {
            log.info("写入文档");
        } else if (indexResponse.getResult() == DocWriteResponse.Result.UPDATED) {
            log.info("修改文档");
        }
        ReplicationResponse.ShardInfo shardInfo = indexResponse.getShardInfo();
        if (shardInfo.getTotal() != shardInfo.getSuccessful()) {
            log.warn("部分分片写入成功");
        }
        if (shardInfo.getFailed() > 0) {
            for (ReplicationResponse.ShardInfo.Failure failure : shardInfo.getFailures()) {
                String reason = failure.reason();
                log.warn("失败原因: {}", reason);
            }
        }
    }

    @Override
    public void onFailure(Exception e) {
        log.error(e.getMessage());
    }
}
