package com.dlw.study.metadata.service.impl;

import com.dlw.study.metadata.dao.EsIndexCollectDao;
import com.dlw.study.metadata.domain.EsIndexCollectPo;
import com.dlw.study.metadata.service.EsIndexCollectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collection;

/**
 * @author dengliwen
 * @date 2019/9/11
 * @desc
 */
@Service
public class EsIndexCollectServiceImpl implements EsIndexCollectService {

    @Autowired
    private EsIndexCollectDao esIndexCollectDao;


    @Override
    public void batchAdd(Collection<EsIndexCollectPo> pos) {
        esIndexCollectDao.saveAll(pos);
    }
}
