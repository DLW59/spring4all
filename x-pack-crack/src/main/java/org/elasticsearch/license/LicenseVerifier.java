package org.elasticsearch.license;


/**
 * @author dengliwen
 * @date 2019/9/11
 * @desc 破解x-pack  版本验证
 */
public class LicenseVerifier {

    public static boolean verifyLicense(final License license, final byte[] encryptedPublicKeyData) {
        return true;
    }

    public static boolean verifyLicense(final License license) {
        return true;
    }
}
