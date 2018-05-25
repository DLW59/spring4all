package com.dlw.study;

import com.dlw.study.param.Add;
import lombok.extern.slf4j.Slf4j;
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
@SpringBootTest(classes = MqConsumerApplication.class)
@Slf4j
public class ConsumerTest {

    @Autowired
    private RestTemplate restTemplate;

    @Test
    public void call() {
        Add add = new Add();
        add.setSupplier("001");
        List<Add.Point> points = new ArrayList<>();
        Add.Point point = new Add.Point();
        point.setType("1");
        point.setCode("cd001");
        points.add(point);
        add.setPoint(points);
        restTemplate.put("http://127.0.0.1:9001/ssp/point/new",add);
    }

}
