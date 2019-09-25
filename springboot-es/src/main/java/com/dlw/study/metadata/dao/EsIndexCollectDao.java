package com.dlw.study.metadata.dao;

import com.dlw.study.metadata.domain.EsIndexCollectPo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * @author dengliwen
 * @date 2019/9/11
 * @desc
 */
@Repository
public interface EsIndexCollectDao extends JpaRepository<EsIndexCollectPo,String> {
}
