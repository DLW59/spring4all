package com.dlw.study.domain;

import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;
import java.util.List;

/**
 * @author dengliwen
 * @date 2018/11/11
 */
@Data
@Entity
@Table(name = "user")
public class User extends BaseEntity implements Serializable {
    private static final long serialVersionUID = 5927921775436626205L;

    @Column(name = "username")
    private String username;

    @ManyToMany
    @JoinTable(name = "user_role",joinColumns = @JoinColumn(name = "user_id"),
    inverseJoinColumns = @JoinColumn(name = "role_id"))
    private List<Role> roles;
}
