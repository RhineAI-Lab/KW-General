package com.rhineai.kwgeneralserver.utils

object Base64 {

    fun encode(input: ByteArray): String {
        return java.util.Base64.getEncoder().encodeToString(input)
    }

    fun decode(input: String): ByteArray {
        return java.util.Base64.getDecoder().decode(input)
    }

}