package com.dlw.study.factory;

import com.dlw.study.enums.MessageTopicEnum;
import com.dlw.study.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * ..
 * MQ消费业务服务工厂
 *
 * @author dlw
 * @date 2018-05-24
 */
@Component
public class MessageConsumeServiceFactory {

    @Autowired
    private DevPointMessageService devPointMessageService;

    @Autowired
    private TestPointMessageService testPointMessageService;

    @Autowired
    private PrePointMessageService prePointMessageService;

    @Autowired
    private ProdPointMessageService prodPointMessageService;
    /**
     * 根据主题获取消费者服务
     *
     * @param topicEnum 消息主题
     * @return 消费者服务
     */
    public MqService service(MessageTopicEnum topicEnum) {

        switch (topicEnum) {
            case DEV_SETPOINT_POINT_CHANGE:
                return devPointMessageService;
            case TEST_SETPOINT_POINT_CHANGE:
                return testPointMessageService;
            case PRE_SETPOINT_POINT_CHANGE:
                return prePointMessageService;
            case PROD_SETPOINT_POINT_CHANGE:
                return prodPointMessageService;
            default:
                return null;
        }

    }
}
