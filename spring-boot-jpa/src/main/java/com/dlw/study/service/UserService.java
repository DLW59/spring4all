package com.dlw.study.service;

import com.dlw.study.common.PageVo;
import com.dlw.study.vo.UserVo;

/**
 * @author dengliwen
 * @date 2019/3/10
 */
public interface UserService {

    UserVo add(UserVo vo);

    PageVo<UserVo> list(String keywords);

    void delete(String id);
}
