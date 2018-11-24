package com.dlw.study.service;

import com.dlw.study.domain.Role;
import org.springframework.data.domain.Page;

/**
 * @author dengliwen
 * @date 2018/11/11
 */
public interface RoleService {

    Page<Role> pageRoles(Long userId);
}
