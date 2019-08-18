//package com.dlw.study.service.impl;
//
//import com.dlw.study.domain.Goods;
//import com.dlw.study.repository.GoodsRepository;
//import com.dlw.study.service.GoodsService;
//import org.elasticsearch.index.query.IdsQueryBuilder;
//import org.elasticsearch.index.query.QueryBuilder;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.data.elasticsearch.core.ElasticsearchTemplate;
//import org.springframework.data.elasticsearch.core.query.NativeSearchQuery;
//import org.springframework.data.elasticsearch.core.query.SearchQuery;
//import org.springframework.stereotype.Service;
//
//import java.util.ArrayList;
//import java.util.Iterator;
//import java.util.List;
//import java.util.Optional;
//
///**
// * @author dengliwen
// * @date 2019/3/31
// */
//@Service
//public class GoodsServiceImpl implements GoodsService {
//
//    @Autowired
//    private GoodsRepository goodsRepository;
//
//    @Autowired
//    private ElasticsearchTemplate template;
//    @Override
//    public void add(Goods goods) {
//        goodsRepository.save(goods);
//    }
//
//    @Override
//    public Goods findOne(String id) {
//        Optional<Goods> optional = goodsRepository.findById(id);
//        return optional.orElse(null);
//    }
//
//    @Override
//    public List<Goods> findAll() {
////        QueryBuilder builder = new IdsQueryBuilder();
////        ((IdsQueryBuilder) builder).addIds("1");
////        SearchQuery query = new NativeSearchQuery(builder);
////        List<Goods> goods = template.queryForList(query, Goods.class);
////        return goods;
//        Iterable<Goods> iterable = goodsRepository.findAll();
//        Iterator<Goods> iterator = iterable.iterator();
//        List<Goods> goods = new ArrayList<>();
//        while (iterator.hasNext()) {
//            goods.add(iterator.next());
//        }
//        return goods;
//    }
//}
