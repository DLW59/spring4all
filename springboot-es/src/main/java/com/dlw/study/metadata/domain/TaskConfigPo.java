package com.dlw.study.metadata.domain;

import lombok.Data;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;

/**
 * @author dengliwen
 * @date 2019/9/11
 * @desc
 */
@Data
@Entity
@Table(name = "task_config")
public class TaskConfigPo {

    @Id
    @GeneratedValue(generator = "id")
    @GenericGenerator(strategy = "uuid",name = "id")
    private String id;

    @Column(name = "task_name" ,length = 128,unique=true,nullable = false)
    private String taskName ;

    /**
     * 任务扩展配置，json格式
     */
    @Lob
    @Column(name = "task_extend_cfg")
    private String taskExtendCfg ;

}
