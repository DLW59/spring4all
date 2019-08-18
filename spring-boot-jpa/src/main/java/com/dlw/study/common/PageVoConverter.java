package com.dlw.study.common;

import org.springframework.data.domain.Page;

/**
 * @author dengliwen
 * @create 2018/11/3 16:13
 */
public class PageVoConverter {

    public static <T> PageVo<T> convert(Page<T> page) {
        PageVo<T> vo = new PageVo<>();
        vo.setContent(page.getContent());
        copyPage(page, vo);
        return vo;
    }
    
    private static <T, S> void copyPage(Page<S> page, PageVo<T> vo) {
    	vo.setFirst(page.isFirst());
        vo.setLast(page.isLast());
        vo.setNumber(page.getNumber());
        vo.setNumberOfElements(page.getNumberOfElements());
        vo.setSize(page.getSize());
        vo.setTotalElements(page.getTotalElements());
        vo.setTotalPages(page.getTotalPages());
    }

    public static <S, T> PageVo<T> convert(Page<S> page, ListConverter<S, T> converter) {
        PageVo<T> vo = new PageVo<>();
        vo.setContent(converter.convert(page.getContent()));
        copyPage(page, vo);
        return vo;
    }
    

}
