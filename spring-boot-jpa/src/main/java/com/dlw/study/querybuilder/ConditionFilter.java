package com.dlw.study.querybuilder;

import com.itfsw.query.builder.SqlQueryBuilderFactory;
import com.itfsw.query.builder.support.builder.SqlBuilder;
import com.itfsw.query.builder.support.model.result.SqlQueryResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;

import java.io.IOException;
import java.util.List;

/**
 * @author dengliwen
 * @date 2019/4/2
 */
public class ConditionFilter {

    private static final Logger log = LoggerFactory.getLogger(ConditionFilter.class);
    JdbcTemplate jdbcTemplate = new JdbcTemplate();

    public static void main(String[] args) throws IOException {
        ConditionFilter c = new ConditionFilter();
        c.test();
    }

    public void test() throws IOException {
        String json = "{\"condition\":\"OR\",\"rules\":[{\"id\":\"name\",\"field\":\"username\",\"type\":\"string\",\"input\":\"text\",\"operator\":\"equal\",\"value\":\"Mistic\"}],\"not\":false,\"valid\":true}";
        // get SqlBuilder
        SqlQueryBuilderFactory sqlQueryBuilderFactory = new SqlQueryBuilderFactory();
        SqlBuilder sqlBuilder = sqlQueryBuilderFactory.builder();

        // build query
        SqlQueryResult sqlQueryResult = sqlBuilder.build(json);
        log.info(sqlQueryResult.getQuery());
        String sql = new StringBuffer("SELECT * FROM `user` WHERE ").append(sqlQueryResult.getQuery()).toString();
        List<Object> params = sqlQueryResult.getParams();
        log.info(params.toString());
        // execute
        jdbcTemplate.query(sql, params.toArray(), rs -> {
            log.info(rs.getString("username"));
        });
    }
}
