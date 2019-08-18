package com.dlw.study.service;

import com.dlw.study.common.PageVo;
import com.dlw.study.domain.Role;
import com.dlw.study.vo.RoleVo;
import org.springframework.data.domain.Page;

import java.util.Set;

/**
 * @author dengliwen
 * @date 2018/11/11
 */
public interface RoleService {

    PageVo<RoleVo> list(String keywords);

    RoleVo add(RoleVo vo);

    RoleVo update(RoleVo vo);

    void delete(String id);

    Set<RoleVo> roles();

}
