package com.dlw.study.metadata;

import com.dlw.study.common.R;
import com.dlw.study.metadata.service.EsCollectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * @author dengliwen
 * @date 2019/9/5
 * @desc
 */
@RestController
@RequestMapping("/api/es")
public class EsCollectController {

    @Autowired
    private EsCollectService esCollectService;

    @GetMapping("/collect")
    public R esController(@RequestParam(required = false) String username, @RequestParam(required = false) String password) {
        return esCollectService.collect(username,password);
    }
}
