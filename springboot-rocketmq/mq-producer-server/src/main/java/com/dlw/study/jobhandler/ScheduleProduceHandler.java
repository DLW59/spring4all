//package com.dlw.study.jobhandler;
//
//import com.alibaba.fastjson.JSON;
//import com.dlw.study.model.CommonMessage;
//import com.dlw.study.param.Add;
//import com.dlw.study.service.MqService;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Component;
//
//import java.util.ArrayList;
//import java.util.List;
//
///**
// * @author dlw
// * @date 2018/5/27
// * @desc 定时生产消息
// */
//@JobHandler(value = "schedule_produce_handler")
//@Component
//@Slf4j
//public class ScheduleProduceHandler extends IJobHandler {
//
//    @Autowired
//    private MqService mqService;
//    @Override
//    public ReturnT<String> execute(String s) throws Exception {
//        log.info("获取的参数：{}",s);
//        XxlJobLogger.log("获取参数==》"+s);
//        CommonMessage message = new CommonMessage();
//        Add add = new Add();
//        add.setSupplier("a0001");
//        List<Add.Point> points = new ArrayList<>();
//        Add.Point point = new Add.Point();
//        point.setType("1");
//        point.setCode("cd001");
//        points.add(point);
//        add.setPoint(points);
//        message.setTopic("dev_setpoint_point_change");
//        message.setTag("new");
//        message.setKey(message.getTopic() + "_" + point.getCode() + "_" + System.currentTimeMillis());
//        message.setMessage(JSON.toJSONString(add));
//        message.setOrderId(1);
//        mqService.send(message);
//        return SUCCESS;
//    }
//}
