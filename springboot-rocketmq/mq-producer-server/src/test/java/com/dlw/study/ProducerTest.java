package com.dlw.study;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.serializer.SerializerFeature;
import com.dlw.study.model.CommonMessage;
import com.dlw.study.model.CommonResponse;
import com.dlw.study.param.Add;
import com.dlw.study.service.MqService;
import lombok.extern.slf4j.Slf4j;
import org.apache.rocketmq.client.exception.MQBrokerException;
import org.apache.rocketmq.client.exception.MQClientException;
import org.apache.rocketmq.remoting.exception.RemotingException;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

/**
 * @author dlw
 * @date 2018-05-24
 * @description
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = MqProducerApplication.class)
@Slf4j
public class ProducerTest {

    @Autowired
    private MqService mqService;

    @Test
    public void testSend() throws InterruptedException, RemotingException, MQClientException, MQBrokerException {
        CommonMessage message;
        int a = 3;
        for (int i=1;i<=1000000;i++) {
            message = new CommonMessage();
            message.setTopic("point-status-change");
            message.setTag(String.valueOf((i % a)));
            message.setKey(String.valueOf(i));
            message.setMessage("第" + i + "条消息");
            message.setOrderId(i);
            mqService.send(message);
        }
    }

    @Test
    public void testNew() throws InterruptedException, RemotingException, MQClientException, MQBrokerException {
        CommonMessage message = new CommonMessage();
        Add add = new Add();
        add.setSupplier("001");
        List<Add.Point> points = new ArrayList<>();
        Add.Point point = new Add.Point();
        point.setType("1");
        point.setCode("cd001");
        points.add(point);
        add.setPoint(points);
        message.setTopic("dev_setpoint_point_change");
        message.setTag("0");
        message.setKey("新增点位");
        message.setMessage(JSON.toJSONString(add/*, SerializerFeature.WriteMapNullValue*/));
        message.setOrderId(1);
        mqService.send(message);
    }

    @Test
    public void call() {

    }
}
