package com.rhineai.kwgeneralserver.config

import com.rhineai.kwgeneralserver.utils.Base64
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component
import java.security.KeyFactory
import java.security.PrivateKey
import java.security.PublicKey
import java.security.spec.PKCS8EncodedKeySpec
import java.security.spec.X509EncodedKeySpec

@Component
@ConfigurationProperties(prefix = "crypto")
class CryptoConfig {
    private lateinit var privateKey: String
    private lateinit var publicKey: String
    val kf: KeyFactory = KeyFactory.getInstance("RSA")

    private var privateKeyInstance: PrivateKey? = null
    private var publicKeyInstance: PublicKey? = null

    private lateinit var aesKey: String
    private lateinit var passwordSalt: String

    @Synchronized
    fun getPrivateKey(): PrivateKey {
        if (this.privateKeyInstance == null) {
            this.privateKeyInstance = kf.generatePrivate(PKCS8EncodedKeySpec(Base64.decode(this.privateKey)))
        }
        return privateKeyInstance!!
    }

    fun setPrivateKey(privateKey: String) {
        this.privateKey = privateKey
    }

    @Synchronized
    fun getPublicKey(): PublicKey {
        if (this.publicKeyInstance == null) {
            this.publicKeyInstance = kf.generatePublic(X509EncodedKeySpec(Base64.decode(this.publicKey)))
        }
        return publicKeyInstance!!
    }

    fun setPublicKey(publicKey: String) {
        this.publicKey = publicKey
    }

    fun getAesKey(): String {
        return this.aesKey
    }

    fun setAesKey(aesKey: String) {
        this.aesKey = aesKey
    }
}