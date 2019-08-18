package com.dlw.study.service.impl;

import com.dlw.study.common.PageVo;
import com.dlw.study.common.PageVoConverter;
import com.dlw.study.domain.Role;
import com.dlw.study.domain.User;
import com.dlw.study.repository.UserRepository;
import com.dlw.study.service.UserService;
import com.dlw.study.vo.UserVo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import javax.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * @author dengliwen
 * @date 2019/3/10
 */
@Service
@Slf4j
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserVo add(UserVo vo) {
        User user = new User();
        BeanUtils.copyProperties(vo, user);
        Set<String> roleIds = vo.getRoleIds();
        if (!CollectionUtils.isEmpty(roleIds)) {
            user.setRoles(roleIds.parallelStream().map(id -> {
                Role role = new Role();
                role.setId(id);
                return role;
            }).collect(Collectors.toList()));
        }
        return UserVo.transform(userRepository.save(user));
    }

    @Override
    public PageVo<UserVo> list(final String keywords) {
        Sort sort = new Sort(Sort.Direction.DESC,"createTime");
        Page<User> page = userRepository.findAll((root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (!StringUtils.isEmpty(keywords)) {
                String key = "%" + keywords.trim() + "%";
                predicates.add(cb.like(root.get("username"), key));
            }
            cq.where(predicates.toArray(new Predicate[predicates.size()]));
            return cq.getRestriction();
        }, PageRequest.of(0, 10, sort));

        return PageVoConverter.convert(page, new UserVo());
    }

    @Override
    public void delete(String id) {
//        User user = userRepository.findById(id).get();
//        user.setRoles(null);
//        userRepository.save(user);
        userRepository.deleteById(id);
    }
}
