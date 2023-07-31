package com.rhineai.kwgeneralserver.utils

import java.security.MessageDigest
import java.util.*

object DigestUtils {

    fun md5(str: String): String {
        val digest = MessageDigest.getInstance("MD5")
        val result = digest.digest(str.toByteArray())
        return toHex(result)
    }

    private fun toHex(byteArray: ByteArray): String {
        val result = with(StringBuilder()) {
            byteArray.forEach {
                val hex = it.toInt() and (0xFF)
                val hexStr = Integer.toHexString(hex)
                if (hexStr.length == 1) {
                    this.append("0").append(hexStr)
                } else {
                    this.append(hexStr)
                }
            }
            this.toString()
        }
        return result.uppercase(Locale.getDefault())
    }

    fun sha1(str:String): String {
        val digest = MessageDigest.getInstance("SHA-1")
        val result = digest.digest(str.toByteArray())
        return toHex(result)
    }

    fun sha256(str:String): String {
        val digest = MessageDigest.getInstance("SHA-256")
        val result = digest.digest(str.toByteArray())
        return toHex(result)
    }
}
