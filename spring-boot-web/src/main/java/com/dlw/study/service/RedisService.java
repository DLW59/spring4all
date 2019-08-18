package com.dlw.study.service;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * @author dengliwen
 * @date 2019/4/5
 */
public interface RedisService {

    void setString(String key, String value);

    void setString(String key, String value, int expired, TimeUnit timeUnit);

    String getString(String key);

    void setSet(String key, String... value);

    void setSet(String key, String value, int expired, TimeUnit timeUnit);

    void removeSet(String key, String value);

    void clearSet(String key);

    Set<String> getSet(String key);

    boolean inSet(String key, String value);

    void delete(String key);

    void delete(Collection<String> keys);

    boolean hasKey(String key);

    void putMap(String key, Map<String, String> value);

    void putMap(String key, String mapKey, String mapValue);

    void putMap(String key, Map<String, String> value, int expired, TimeUnit timeUnit);

    Map<Object, Object> getMap(String key);

    List<Object> getMap(String key, Collection<Object> mapKey);

    void delMapKey(String key, String... mapKey);

    String getMap(String key, String mapKey);

    long getExpire(String key);

    String getAndSet(String key, String value);

    void expired(String key, int expired, TimeUnit timeUnit);

    Set<String> keys(String pattern);
}
