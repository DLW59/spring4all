//package com.dlw.study.controller;
//
//import com.dlw.study.common.R;
//import com.dlw.study.domain.Goods;
//import com.dlw.study.service.GoodsService;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
///**
// * @author dengliwen
// * @date 2019/3/30
// */
//@RestController
//@RequestMapping("/es")
//@Slf4j
//public class GoodsController {
//
//    @Autowired
//    private GoodsService goodsService;
//
//    @PostMapping("/add")
//    public R add(@RequestBody Goods goods) {
//        log.info("添加的商品:[{}]", goods);
//        goodsService.add(goods);
//        return new R(0, true);
//    }
//
//    @GetMapping("/get/{id}")
//    public R<Goods> getOne(@PathVariable String id){
//        Goods one = goodsService.findOne(id);
//        return new R<>(0, true,one);
//    }
//
//    @GetMapping("/findAll")
//    public R<List<Goods>> findAll(){
//        List<Goods> one = goodsService.findAll();
//        return new R<>(0, true,one);
//    }
//}
