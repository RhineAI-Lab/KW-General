package com.rhineai.kwgeneralserver.utils

import org.springframework.beans.factory.annotation.Value
import java.util.*

object Environment {

    @Value("\${spring.profiles.active}")
    private lateinit var env: String

    fun isDev(): Boolean {
//        return env == "dev"
        return isWindows()
    }

    fun isLinux(): Boolean {
        return System.getProperty("os.name").lowercase(Locale.getDefault()).contains("linux")
    }

    fun isWindows(): Boolean {
        return System.getProperty("os.name").lowercase(Locale.getDefault()).contains("windows")
    }
}