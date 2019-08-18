package com.dlw.study.controller;

import com.alibaba.fastjson.JSON;
import com.dlw.study.config.RabbitMqProducer;
import com.dlw.study.dto.ParticipleMgr;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;
import java.util.Random;

/**
 * @author dengliwen
 * @date 2019/5/21
 * @desc
 */
@RestController
@RequestMapping("/mq")
public class MqProducerController {

    @Autowired
    private RabbitMqProducer producer;

    @GetMapping("/produce")
    public void produce() {
        producer.produce(JSON.toJSONString(getParticipleMgr()));
    }

    private ParticipleMgr getParticipleMgr() {
        ParticipleMgr mgr = new ParticipleMgr();
        mgr.setId(new Random().nextInt(10000));
        mgr.setText("嘻嘻");
        mgr.setCreator("dlw");
        mgr.setCreateTime(new Date());
        mgr.setCreatorId(1);
        return mgr;
    }
}
