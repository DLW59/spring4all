package com.dlw.study.domain;

import lombok.Data;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.ManyToMany;
import javax.persistence.Table;
import java.io.Serializable;
import java.util.List;

/**
 * @author dengliwen
 * @date 2018/11/11
 */
@Data
@Entity
@Table(name = "role")
public class Role extends BaseEntity implements Serializable {
    private static final long serialVersionUID = -3181041844282132793L;

    @Column(name = "role_name")
    private String roleName;

    @ManyToMany(mappedBy = "roles")
    private List<User> users;

}
