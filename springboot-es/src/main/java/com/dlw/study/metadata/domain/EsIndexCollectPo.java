package com.dlw.study.metadata.domain;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.io.Serializable;

/**
 * @author dengliwen
 * @date 2019/9/10
 * @desc
 */
@Entity
@Table(name = "es_index_collect")
public class EsIndexCollectPo implements Serializable {

    private static final long serialVersionUID = -3800935341538810878L;

    @Id
    @GeneratedValue(generator = "id")
    @GenericGenerator(strategy = "uuid",name = "id")
    private String id;

    @Column(name = "index_name",nullable = false)
    private String indexName;

    @Column(name = "index_all_info")
    @Lob
    @Basic(fetch = FetchType.LAZY)
    private String indexAllInfo;

    @Column(name = "aliases")
    @Lob
    private String aliases;

    @Column(name = "mappings")
    @Lob
    @Basic(fetch = FetchType.LAZY)
    private String mappings;

    @Column(name = "settings")
    @Lob
    private String settings;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getIndexName() {
        return indexName;
    }

    public void setIndexName(String indexName) {
        this.indexName = indexName;
    }

    public String getIndexAllInfo() {
        return indexAllInfo;
    }

    public void setIndexAllInfo(String indexAllInfo) {
        this.indexAllInfo = indexAllInfo;
    }

    public String getAliases() {
        return aliases;
    }

    public void setAliases(String aliases) {
        this.aliases = aliases;
    }

    public String getMappings() {
        return mappings;
    }

    public void setMappings(String mappings) {
        this.mappings = mappings;
    }

    public String getSettings() {
        return settings;
    }

    public void setSettings(String settings) {
        this.settings = settings;
    }
}
