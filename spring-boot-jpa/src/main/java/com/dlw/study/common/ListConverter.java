/**
 * 
 */
package com.dlw.study.common;

import java.util.List;

/**
 * @author dengliwen
 * @date 2018-11-07
 *
 */
public interface ListConverter<S, T> {

	List<T> convert(List<S> source);
	
}
