package com.dlw.study.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
@NoArgsConstructor
@AllArgsConstructor
public class Role extends BaseEntity implements Serializable {
    private static final long serialVersionUID = -3181041844282132793L;

    @Column(name = "role_name")
    private String roleName;

    @Column(name = "remark")
    private String remark;

    @Column(name = "role_code")
    private String roleCode;

    @ManyToMany(mappedBy = "roles")
    private List<User> users;



    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        Role role = (Role) o;
        return this.getId() != null && role.getId()!= null && this.getId().equals(role.getId());
    }

    @Override
    public int hashCode() {
        return getId() != null ? getId().hashCode() : 0;
    }
}
