package com.dlw.study.dto;

import lombok.Builder;
import lombok.Data;

import java.io.Serializable;

/**
 * @author dengliwen
 * @date 2018/11/24
 */
@Data
@Builder
public class StockDto implements Serializable {
    private static final long serialVersionUID = -16360003691787719L;

    /**
     * 商品id.
     */
    private String productId;


    /**
     * 数量.
     */
    private Integer count;
}
