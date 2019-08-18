package com.dlw.study.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.List;

/**
 * Created by defei on 5/18/17.
 */

@Builder
@AllArgsConstructor
@NoArgsConstructor

@Data
public class PageVo<T> {

    /**
     * 数据
     */
    private List<T> content = Collections.emptyList();

    /**
     * 总页数
     */
    private Integer totalPages = 0;

    /**
     * "总记录数"
     */
    private Long totalElements = 0L;

    /**
     * 每页数
     */
    private Integer size = 0;

    /**
     * 当前页数
     */
    private Integer number = 0;

    private Boolean last = true;

    private Boolean first = true;

    private Integer numberOfElements = 0;


}
