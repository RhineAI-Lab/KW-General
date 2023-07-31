package com.rhineai.kwgeneralserver.utils

import java.security.PrivateKey
import java.security.PublicKey
import javax.crypto.Cipher
import javax.crypto.spec.SecretKeySpec

//非对称加密RSA加密和解密
object CryptUtils {

    fun encryptByPrivateKey(input: String, privateKey: PrivateKey): String {
        val cipher = Cipher.getInstance("RSA")
        cipher.init(Cipher.ENCRYPT_MODE, privateKey)
        val encrypt = cipher.doFinal(input.toByteArray())
        return Base64.encode(encrypt)
    }

    fun encryptByPublicKey(input: String, publicKey: PublicKey): String {
        val cipher = Cipher.getInstance("RSA")
        cipher.init(Cipher.ENCRYPT_MODE, publicKey)
        val encrypt = cipher.doFinal(input.toByteArray())
        return Base64.encode(encrypt)
    }

    fun decryptByPrivateKey(input: String, privateKey: PrivateKey): String {
        val cipher = Cipher.getInstance("RSA")
        cipher.init(Cipher.DECRYPT_MODE, privateKey)
        val encrypt = cipher.doFinal(Base64.decode(input))
        return String(encrypt)
    }

    fun decryptByPublicKey(input: String, publicKey: PublicKey): String {
        val cipher = Cipher.getInstance("RSA")
        cipher.init(Cipher.DECRYPT_MODE, publicKey)
        val encrypt = cipher.doFinal(Base64.decode(input))
        return String(encrypt)
    }


    fun encrypt(input: String, aesKey: String): String {
        val cipher = Cipher.getInstance("AES")
        val keySpec: SecretKeySpec = SecretKeySpec(aesKey.toByteArray(), "AES")
        cipher.init(Cipher.ENCRYPT_MODE, keySpec)
        val encrypt = cipher.doFinal(input.toByteArray())
        return Base64.encode(encrypt)
    }

    fun decrypt(input: String, aesKey: String): String {
        val cipher = Cipher.getInstance("AES")
        val keySpec: SecretKeySpec = SecretKeySpec(aesKey.toByteArray(), "AES")
        cipher.init(Cipher.DECRYPT_MODE, keySpec)
        val encrypt = cipher.doFinal(Base64.decode(input))
        return String(encrypt)
    }
}
