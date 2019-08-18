package com.dlw.study.repository;

import com.dlw.study.domain.ParticipleMgr;
import com.dlw.study.domain.SuggestWords;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

/**
 * @author dengliwen
 * @date 2019/5/21
 * @desc
 */
@Repository
public interface SuggestWordsRepository extends ElasticsearchRepository< SuggestWords,Integer> {
}
