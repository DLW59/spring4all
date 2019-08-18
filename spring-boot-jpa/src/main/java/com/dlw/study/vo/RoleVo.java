package com.dlw.study.vo;

import com.dlw.study.common.ListConverter;
import com.dlw.study.domain.Role;
import lombok.Data;
import org.springframework.beans.BeanUtils;
import org.springframework.util.CollectionUtils;

import java.io.Serializable;
import java.util.*;
import java.util.stream.Collectors;

/**
 * @author dengliwen
 * @date 2019/3/8
 */
@Data
public class RoleVo implements Serializable, ListConverter<Role,RoleVo> {
    private static final long serialVersionUID = -3011975534513126246L;

    private String id;
    private String roleName;
    private String roleCode;
    private String remark;
    private String createTime;

    public static RoleVo transform(Role ro) {
        RoleVo vo = new RoleVo();
        BeanUtils.copyProperties(ro, vo);
        vo.setId(ro.getId());
        vo.setCreateTime(ro.getCreateTime().toString());
        return vo;
    }

    @Override
    public List<RoleVo> convert(List<Role> source) {
        List<RoleVo> list = new ArrayList<>();
        if (CollectionUtils.isEmpty(source)) {
            return list;
        }
        return source.parallelStream().map(RoleVo::transform).collect(Collectors.toList());
    }
}
