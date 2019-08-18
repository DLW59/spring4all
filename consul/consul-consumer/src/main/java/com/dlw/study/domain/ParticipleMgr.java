package com.dlw.study.domain;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.io.Serializable;
import java.util.Date;

/**
 * @author dengliwen
 * @date 2019/5/21
 * @desc
 */
@Data
@Document(indexName = "participle_mgr",type = "_doc")
public class ParticipleMgr implements Serializable {
    private static final long serialVersionUID = 9191138033208140765L;

    @Id
    private Integer id;

    @Field(type = FieldType.Keyword)
    private String text; //内容

    @Field(type = FieldType.Integer)
    private Integer creatorId; //创建人id

    @Field(type = FieldType.Keyword)
    private String creator; //创建人

    @Field(type = FieldType.Integer)
    private Integer modifierId; //修改人id

    @Field(type = FieldType.Keyword)
    private String modifier; //修改人

    @Field(index = false,type = FieldType.Date)
    private Date createTime; //创建时间

    @Field(index = false,type = FieldType.Date)
    private Date updateTime; //更新时间

}
