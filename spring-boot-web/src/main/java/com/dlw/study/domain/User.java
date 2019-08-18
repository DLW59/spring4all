package com.dlw.study.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Date;

/**
 * @author dengliwen
 * @date 2019/4/5
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@TableName(value = "user")
@ApiModel
public class User implements Serializable {
    private static final long serialVersionUID = 5927921775436626205L;

    @TableId(value = "id",type = IdType.UUID)
    private String id;

    @TableField(value = "username")
    private String username;

    @TableField(value = "password")
    private String password;

    @TableField(value = "create_time")
    @ApiModelProperty(value = "创建时间",hidden = true)
    private Date createTime;

    @TableField(value = "update_time")
    @ApiModelProperty(value = "修改时间",hidden = true)
    private Date updateTime;
}
