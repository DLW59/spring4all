import com.dlw.study.EsApplication;
import com.dlw.study.model.Index;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.elasticsearch.action.admin.indices.get.GetIndexRequest;
import org.elasticsearch.action.admin.indices.get.GetIndexResponse;
import org.elasticsearch.client.*;
import org.elasticsearch.cluster.metadata.AliasMetaData;
import org.elasticsearch.cluster.metadata.MappingMetaData;
import org.elasticsearch.common.collect.ImmutableOpenMap;
import org.elasticsearch.common.settings.Settings;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author dengliwen
 * @date 2019/9/24
 * @desc
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = EsApplication.class)
@Slf4j
public class EsTest {

    @Autowired
    @Qualifier("xPackRestHighLevelClient")
    private RestHighLevelClient client;

    @Test
    @SneakyThrows
    public void getIndex() {
        //获取所有index
        final IndicesClient indices = client.indices();

        GetIndexRequest getIndexRequest = new GetIndexRequest();
        getIndexRequest = getIndexRequest.indices("soso_user_log_back_201909");
        final GetIndexResponse getIndexResponse = indices.get(getIndexRequest, RequestOptions.DEFAULT);
        final ImmutableOpenMap<String, List<AliasMetaData>> aliases = getIndexResponse.getAliases();
        final ImmutableOpenMap<String, ImmutableOpenMap<String, MappingMetaData>> mappings = getIndexResponse.getMappings();
        final ImmutableOpenMap<String, Settings> settings = getIndexResponse.getSettings();

        Map<String,Object> map = new HashMap<>();
        final String[] indices1 = getIndexResponse.getIndices();
        for (String index : indices1) {
            final Index build = Index.builder()
                    .aliases(aliases.get(index))
                    .mappings(mappings.get(index))
                    .settings(settings.get(index))
                    .build();
            map.put(index,build);
            log.info("索引【{}】的元数据信息：\n{}",index,map);
        }
    }


}
