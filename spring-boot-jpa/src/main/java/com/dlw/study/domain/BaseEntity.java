package com.dlw.study.domain;

import lombok.Data;
import org.hibernate.annotations.*;

import javax.persistence.*;
import java.io.Serializable;
import java.sql.Timestamp;
import java.util.UUID;

/**
 * @author dengliwen
 * @date 2018/11/11
 */
@Data
@MappedSuperclass
public class BaseEntity implements Serializable {
    private static final long serialVersionUID = 1401971294273138997L;

    /**
     * GenericGenerator 代表生成器 也可以自定义id生成策略只需把strategy属性值改成自己的id生成类就行
     */
    @Id
    @GenericGenerator(name = "all_id",strategy = "com.dlw.study.util.IdGenerator")
//    @GenericGenerator(name = "all_id",strategy = "uuid")
    @GeneratedValue(generator = "all_id") //与GenericGenerator的name一致
    @Column(name = "id",unique = true,length = 32,nullable = false)
    private String id;

    @CreationTimestamp
    private Timestamp createTime = new Timestamp(System.currentTimeMillis());

    @UpdateTimestamp
    private Timestamp updateTime;

}
