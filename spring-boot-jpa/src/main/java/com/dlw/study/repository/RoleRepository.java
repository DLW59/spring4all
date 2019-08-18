package com.dlw.study.repository;

import com.dlw.study.domain.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * @author dengliwen
 * @date 2018/11/11
 */
@Repository
public interface RoleRepository extends JpaRepository<Role,String>,JpaSpecificationExecutor{


    @Query(value = "delete from user_role where role_id = :id",nativeQuery = true)
    @Modifying
    void deleteUserRole(@Param("id") String id);
}
