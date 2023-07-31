package com.rhineai.kwgeneralserver

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class KwGeneralServerApplication

fun main(args: Array<String>) {
    runApplication<KwGeneralServerApplication>(*args)
}
