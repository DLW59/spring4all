package com.dlw.study.domain;

import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;

/**
 * @author dengliwen
 * @date 2018/11/11
 */
@Data
@MappedSuperclass
public class BaseEntity implements Serializable {
    private static final long serialVersionUID = 1401971294273138997L;

    @Id
    private Long id;
}
