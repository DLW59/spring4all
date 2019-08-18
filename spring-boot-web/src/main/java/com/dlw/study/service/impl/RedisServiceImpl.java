package com.dlw.study.service.impl;

import com.dlw.study.service.RedisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * @author dengliwen
 * @date 2019/4/5
 */
@Service
public class RedisServiceImpl implements RedisService {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Override
    public void setString(String key, String value) {
        redisTemplate.opsForValue().set(key, value);
    }

    @Override
    public void setString(String key, String value, int expired, TimeUnit timeUnit) {
        redisTemplate.opsForValue().set(key, value, expired, timeUnit);
    }

    @Override
    public String getString(String key) {
        return redisTemplate.opsForValue().get(key);
    }

    @Override
    public void setSet(String key, String... value) {
        redisTemplate.opsForSet().add(key, value);
    }

    @Override
    public void setSet(String key, String value, int expired, TimeUnit timeUnit) {
        setSet(key, value);
        redisTemplate.expire(key, expired, timeUnit);
    }

    @Override
    public void removeSet(String key, String value) {
        redisTemplate.opsForSet().remove(key, value);
    }

    @Override
    public void clearSet(String key) {
        redisTemplate.delete(key);
    }

    @Override
    public Set<String> getSet(String key) {
        return redisTemplate.opsForSet().members(key);
    }

    @Override
    public boolean inSet(String key, String value) {
        return redisTemplate.opsForSet().isMember(key, value);
    }

    @Override
    public void delete(String key) {
        redisTemplate.delete(key);
    }

    @Override
    public void delete(Collection<String> keys) {
        redisTemplate.delete(keys);
    }

    @Override
    public boolean hasKey(String key) {
        return redisTemplate.hasKey(key);
    }

    @Override
    public void putMap(String key, Map<String, String> value) {
        redisTemplate.opsForHash().putAll(key, value);
    }

    @Override
    public void putMap(String key, String mapKey, String mapValue) {
        redisTemplate.opsForHash().put(key, mapKey, mapValue);
    }

    @Override
    public void putMap(String key, Map<String, String> value, int expired, TimeUnit timeUnit) {
        putMap(key, value);
        redisTemplate.expire(key, expired, timeUnit);
    }

    @Override
    public void delMapKey(String key, String... mapKey) {
        redisTemplate.opsForHash().delete(key, mapKey);
    }

    @Override
    public Map<Object, Object> getMap(String key) {
        return redisTemplate.opsForHash().entries(key);
    }

    @Override
    public List<Object> getMap(String key, Collection<Object> mapKey) {
        return redisTemplate.opsForHash().multiGet(key, mapKey);
    }

    @Override
    public String getMap(String key, String mapKey) {
        return (String) redisTemplate.opsForHash().get(key, mapKey);
    }

    @Override
    public long getExpire(String key) {
        return redisTemplate.getExpire(key);
    }

    @Override
    public String getAndSet(String key, String value) {
        return redisTemplate.opsForValue().getAndSet(key, value);
    }

    @Override
    public void expired(String key, int expired, TimeUnit timeUnit) {
        redisTemplate.expire(key, expired, timeUnit);
    }

    @Override
    public Set<String> keys(String pattern){
        return redisTemplate.keys(pattern);
    }

}
