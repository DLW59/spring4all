package com.dlw.study.vo;

import com.dlw.study.common.ListConverter;
import com.dlw.study.domain.User;
import lombok.Data;
import org.springframework.beans.BeanUtils;
import org.springframework.util.CollectionUtils;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * @author dengliwen
 * @date 2019/3/10
 */
@Data
public class UserVo implements Serializable , ListConverter<User,UserVo> {
    private static final long serialVersionUID = -3079188030749600518L;

    private String id;
    private String username;
    private String sex;
    private int age;
    private String createTime;
    private Set<String> roleIds;

    @Override
    public List<UserVo> convert(List<User> source) {
        List<UserVo> list = new ArrayList<>();
        if (CollectionUtils.isEmpty(source)) {
            return list;
        }
        return source.parallelStream().map(UserVo::transform).collect(Collectors.toList());
    }

    public static UserVo transform(User ro) {
        UserVo vo = new UserVo();
        BeanUtils.copyProperties(ro, vo);
        vo.setId(ro.getId());
//        vo.setCreateTime(ro.getCreateTime().toString());
        return vo;
    }
}
