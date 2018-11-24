package com.dlw.study.repository;

import com.dlw.study.domain.Role;
import com.dlw.study.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

/**
 * @author dengliwen
 * @date 2018/11/11
 */
@Repository
public interface RoleRepository extends JpaRepository<Role,Long>{


}
