package com.dlw.study.service.impl;

import com.dlw.study.common.PageVo;
import com.dlw.study.common.PageVoConverter;
import com.dlw.study.domain.Role;
import com.dlw.study.repository.RoleRepository;
import com.dlw.study.service.RoleService;
import com.dlw.study.vo.RoleVo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.persistence.RollbackException;
import javax.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * @author dengliwen
 * @date 2018/11/11
 */
@Service
@Slf4j
public class RoleServiceImpl implements RoleService {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private EntityManager entityManager;

    @Override
    public PageVo<RoleVo> list(String keywords) {
        Sort sort = new Sort(Sort.Direction.DESC,"createTime");
        Page<Role> page = roleRepository.findAll((root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (!StringUtils.isEmpty(keywords)) {
                predicates.add(cb.like(root.get("roleName"), "%" + keywords + "%"));
            }
            cq.where(predicates.toArray(new Predicate[predicates.size()]));
            return cq.getRestriction();
        }, new PageRequest(0, 10,sort));
        return PageVoConverter.convert(page,new RoleVo());

    }

    @Override
    public RoleVo add(RoleVo vo) {
        Role role = new Role();
        BeanUtils.copyProperties(vo,role );
        log.info("新增的role:{}", role);
        Role ro = roleRepository.save(role);
        return RoleVo.transform(ro);
    }

    @Override
    public RoleVo update(RoleVo vo) {
        Role role = new Role();
        BeanUtils.copyProperties(vo,role );
        Role ro = roleRepository.save(role);
        return RoleVo.transform(ro);
    }

    @Override
    @Transactional(rollbackFor=RuntimeException.class)
    public void delete(String id) {
        roleRepository.deleteUserRole(id);
        roleRepository.deleteById(id);

    }

    @Override
    public Set<RoleVo> roles() {
        List<Role> all = roleRepository.findAll();
        List<RoleVo> roles = new RoleVo().convert(all);
        return new HashSet<>(roles);
    }
}
