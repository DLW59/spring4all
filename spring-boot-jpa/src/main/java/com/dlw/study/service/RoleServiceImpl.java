package com.dlw.study.service;

import com.dlw.study.domain.Role;
import com.dlw.study.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.util.List;

/**
 * @author dengliwen
 * @date 2018/11/11
 */
@Service
public class RoleServiceImpl implements RoleService {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private EntityManager entityManager;

    @Override
    public Page<Role> pageRoles(Long userId) {
        String sql = "select r.id,r.role_name from role r left join user_role ur on r.id = ur.role_id ";
        StringBuilder builder = new StringBuilder(sql);
        if (!StringUtils.isEmpty(userId)) {
            builder.append("where ur.user_id = ").append(userId);
        }
        Query query = entityManager.createNativeQuery(sql)
                .setFirstResult(0)
                .setMaxResults(10);
        List<Object[]> list = query.getResultList();
        return null;
    }
}
