package com.dlw.study.controller;

import com.dlw.study.common.PageVo;
import com.dlw.study.domain.Role;
import com.dlw.study.dto.ResultData;
import com.dlw.study.service.RoleService;
import com.dlw.study.vo.RoleVo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

/**
 * @author dengliwen
 * @date 2019/3/7
 */
@Controller
@RequestMapping("/role")
@Slf4j
public class RoleController {

    @Autowired
    private RoleService roleService;

    @PostMapping(value = "/add",produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
    @ResponseBody
    public ResultData add(@RequestBody RoleVo vo) {
        try {
            RoleVo roleVo = roleService.add(vo);
            return new ResultData(0,roleVo);
        }catch (Exception e) {
            log.error(e.getMessage());
            return new ResultData(false, -1,"新增角色失败");
        }

    }

    @PutMapping(value = "/update",produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
    @ResponseBody
    public ResultData update(@RequestBody RoleVo vo) {
        try {
            RoleVo roleVo = roleService.update(vo);
            return new ResultData(0,roleVo);
        }catch (Exception e) {
            log.error(e.getMessage());
            return new ResultData(false, -1,"修改角色失败");
        }

    }

    @DeleteMapping(value = "/delete/{id}",produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
    @ResponseBody
    public ResultData delete(@PathVariable String id) {
        try {
            if (StringUtils.isEmpty(id)) {
                throw new RuntimeException("id为空");
            }
            roleService.delete(id);
            return new ResultData();
        }catch (Exception e) {
            log.error(e.getMessage());
            return new ResultData(false, -1,e.getMessage());
        }

    }


    @GetMapping(value = "/list",produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
    @ResponseBody
    public ResultData<PageVo<RoleVo>> listRoles(@RequestParam String keywords) {
        PageVo<RoleVo> list = roleService.list(keywords);
        return new ResultData(0,list);
    }


    @GetMapping(value = "/roles",produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
    @ResponseBody
    public ResultData<Set<RoleVo>> roles() {
        Set<RoleVo> roles = roleService.roles();
        return new ResultData(0,roles);
    }




}
