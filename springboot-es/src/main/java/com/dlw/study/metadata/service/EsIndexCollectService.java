package com.dlw.study.metadata.service;

import com.dlw.study.metadata.domain.EsIndexCollectPo;

import java.util.Collection;

/**
 * @author dengliwen
 * @date 2019/9/11
 * @desc
 */
public interface EsIndexCollectService {

    void batchAdd(Collection<EsIndexCollectPo> pos);
}
