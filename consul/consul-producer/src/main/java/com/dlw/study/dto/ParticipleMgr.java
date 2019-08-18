package com.dlw.study.dto;

import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * @author dengliwen
 * @date 2019/5/21
 * @desc
 */
@Data
public class ParticipleMgr implements Serializable {
    private static final long serialVersionUID = 9191138033208140765L;

    private Integer id;

    private String text; //内容

    private Integer creatorId; //创建人id

    private String creator; //创建人

    private Integer modifierId; //修改人id

    private String modifier; //修改人

    private Date createTime; //创建时间

    private Date updateTime; //更新时间

}
