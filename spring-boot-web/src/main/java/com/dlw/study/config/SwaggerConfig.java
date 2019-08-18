package com.dlw.study.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.ParameterBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.schema.ModelRef;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.Parameter;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * @author zhujun
 * @desc SwaggerConfig
 * @time 2018/3/29 18:07
 */
@Configuration
@EnableSwagger2
public class SwaggerConfig {
    /**
     * 注入基本的api文档
     * @return
     */
    @Bean
    public Docket apiDoc() {
        ApiInfo apiInfo = new ApiInfoBuilder().title("web登录模块文档").version("1.0.0").build();
        List<Parameter> globalOperationParameters = new ArrayList<>();
        ParameterBuilder tokenParam = new ParameterBuilder();
        tokenParam.name("token").description("登录后获取的token")
                .modelRef(new ModelRef("string")).parameterType("header")
                .required(false).build();
        globalOperationParameters.add(tokenParam.build());

        Docket docket = new Docket(DocumentationType.SWAGGER_2)
                .groupName("api")
                .apiInfo(apiInfo)
                .useDefaultResponseMessages(false)
                .globalOperationParameters(globalOperationParameters)
                //.directModelSubstitute(Long.class, String.class)
                .directModelSubstitute(Date.class, Long.class)
                .directModelSubstitute(Timestamp.class, Long.class)
                .select()
                .apis(RequestHandlerSelectors.basePackage("com.dlw.study"))
                .build();
        return docket;
    }


    /**
     * 需要认证的api
     * @return
     */
    @Bean
    public Docket authDoc() {
        ApiInfo apiInfo = new ApiInfoBuilder().title("需要认证的api").version("1.0.0").build();
        Docket docket = new Docket(DocumentationType.SWAGGER_2)
                .groupName("oauth")
                .apiInfo(apiInfo).useDefaultResponseMessages(false)
                .select()
//                .apis(RequestHandlerSelectors.basePackage("org.springframework.security.oauth2"))
                .paths(PathSelectors.ant("/oauth/*"))
                .build();
        return docket;
    }
}
