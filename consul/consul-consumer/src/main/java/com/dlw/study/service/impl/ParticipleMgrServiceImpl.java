package com.dlw.study.service.impl;

import com.dlw.study.domain.ParticipleMgr;
import com.dlw.study.repository.ParticipleMgrRepository;
import com.dlw.study.service.ParticipleMgrService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * @author dengliwen
 * @date 2019/5/21
 * @desc
 */
@Service
@Slf4j
public class ParticipleMgrServiceImpl implements ParticipleMgrService {

    @Autowired
    private ParticipleMgrRepository participleMgrRepository;

    @Override
    public void add(ParticipleMgr mgr) {
        participleMgrRepository.save(mgr);
    }
}
