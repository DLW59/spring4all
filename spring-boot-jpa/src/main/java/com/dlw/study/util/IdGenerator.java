package com.dlw.study.util;

import org.hibernate.MappingException;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.Configurable;
import org.hibernate.id.IdentifierGenerator;
import org.hibernate.service.ServiceRegistry;
import org.hibernate.type.Type;

import java.io.Serializable;
import java.util.Properties;
import java.util.UUID;

/**
 * @author dengliwen
 * @date 2019/3/10
 * id 生成器
 */
public class IdGenerator implements IdentifierGenerator, Configurable {

    /**
     * 一定要有空构造方法  默认也有空构造方法
     */
    public IdGenerator() {
    }

    @Override
    public Serializable generate(SharedSessionContractImplementor s, Object obj) {
        return IdFormat.format(UUID.randomUUID().toString());
    }

    @Override
    public void configure(Type type, Properties properties, ServiceRegistry serviceRegistry) throws MappingException {

    }
}
