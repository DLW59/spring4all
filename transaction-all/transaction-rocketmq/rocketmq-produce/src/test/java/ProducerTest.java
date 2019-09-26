import cn.hutool.core.util.RandomUtil;
import com.dlw.study.RocketMqTxProducerApplication;
import com.dlw.study.model.Order;
import com.dlw.study.service.ProducerService;
import lombok.extern.slf4j.Slf4j;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.UUID;

/**
 * @author dengliwen
 * @date 2019/9/26
 * @desc
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = RocketMqTxProducerApplication.class)
@Slf4j
public class ProducerTest {

    @Autowired
    private ProducerService producerService;

    @Test
    public void produce() {
        int n = 10;
        for (int i = 1; i <= n; i++) {
            if (i % 3 == 0) {
                //带tag的消息
                producerService.send(new Order(UUID.randomUUID().toString(), RandomUtil.randomString(4)),"tag1");
            }else {
                producerService.send("消息"+ i);
            }
        }
    }
}
