package com.dlw.study.metadata.domain;

import lombok.Data;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.io.Serializable;

/**
 * @author dengliwen
 * @date 2019/9/11
 * @desc
 */
@Data
@Entity
@Table(name = "es_config")
public class EsConfigPo implements Serializable {

    private static final long serialVersionUID = 632529472521035283L;
    @Id
    @GeneratedValue(generator = "id")
    @GenericGenerator(strategy = "uuid",name = "id")
    private String id;

    /**
     * 索引名称
     */
    @Column(name = "es_name", length = 64,nullable = false)
    private String esName;

    /**
     * 索引中文名
     */
    @Column(name = "es_cn_name", length = 64)
    private String esCnName;

    /**
     * es结点地址 <ip1>:<host1>,<ip2>:<host2> 集群逗号隔开
     */
    @Column(name = "es_addr",nullable = false)
    private String esAddr;

    /**
     * 开启x-pack认证的用户名
     */
    @Column(name = "username")
    private String username;

    /**
     * 开启x-pack认证的密码
     */
    @Column(name = "password")
    private String password;
}
