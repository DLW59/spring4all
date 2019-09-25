package org.elasticsearch.xpack.core;

import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.jar.JarInputStream;
import java.util.jar.Manifest;
import org.elasticsearch.common.SuppressForbidden;
import org.elasticsearch.common.io.PathUtils;

/**
 * @author dengliwen
 * @date 2019/9/11
 * @desc
 */
public class XPackBuild {

    public static final XPackBuild CURRENT;

    private String shortHash;

    private String date;

    @SuppressForbidden(reason = "looks up path of xpack.jar directly")

    static Path getElasticsearchCodebase() {

        final URL url = XPackBuild.class.getProtectionDomain().getCodeSource().getLocation();

        try {

            return PathUtils.get(url.toURI());

        }

        catch (URISyntaxException bogus) {

            throw new RuntimeException(bogus);

        }

    }

    XPackBuild(final String shortHash, final String date) {

        this.shortHash = shortHash;

        this.date = date;

    }

    public String shortHash() {

        return this.shortHash;

    }

    public String date() {

        return this.date;

    }

    static {

        final Path path = getElasticsearchCodebase();

        String shortHash = null;

        String date = null;

        Label_0157: {

            shortHash = "Unknown";

            date = "Unknown";

        }

        CURRENT = new XPackBuild(shortHash, date);

    }
}
