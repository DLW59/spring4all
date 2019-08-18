//package com.dlw.study.domain;
//
//import lombok.Data;
//import org.springframework.data.annotation.Id;
//import org.springframework.data.elasticsearch.annotations.Document;
//import org.springframework.data.elasticsearch.annotations.Field;
//import org.springframework.data.elasticsearch.annotations.FieldType;
//
//import java.io.Serializable;
//
///**
// * @author dengliwen
// * @date 2019/3/28
// * 商品信息
// */
//@Data
//@Document(indexName = "es1",type = "doc",shards = 1)
//public class Goods implements Serializable {
//    private static final long serialVersionUID = -6309025525353885422L;
//
//    @Id
//    private String id;
//    @Field(type = FieldType.Text,analyzer = "ik_max_word")
//    private String title; //标题
//    @Field(type = FieldType.Keyword)
//    private String category;// 分类
//    @Field(type = FieldType.Keyword)
//    private String brand; // 品牌
//    @Field(type = FieldType.Double)
//    private Double price; // 价格
//    @Field(index = false, type = FieldType.Keyword)
//    private String imgUrl; // 图片地址
//}
