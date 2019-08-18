package com.dlw.study.domain;

import com.alibaba.fastjson.JSON;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NonNull;
import org.hibernate.validator.constraints.Length;
import org.springframework.boot.json.GsonJsonParser;

import javax.persistence.*;
import javax.validation.Valid;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.util.List;

/**
 * @author dengliwen
 * @date 2018/11/11
 */
@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@Table(name = "user")
public class User extends BaseEntity implements Serializable {
    private static final long serialVersionUID = 5927921775436626205L;

    @Column(name = "username",length = 40)
    private String username;

    @Column(name = "age",length = 3)
    @Min(0)
    @Max(999)
    private Integer age;

    @Column(name = "sex",length = 2)
    private String sex;

    @JsonIgnoreProperties(value = { "users" })
    @ManyToMany
    @JoinTable(name = "user_role",joinColumns = @JoinColumn(name = "user_id"),
    inverseJoinColumns = @JoinColumn(name = "role_id"))
    private List<Role> roles;

    public String toJson() {
        return JSON.toJSONString(this);
    }
}
