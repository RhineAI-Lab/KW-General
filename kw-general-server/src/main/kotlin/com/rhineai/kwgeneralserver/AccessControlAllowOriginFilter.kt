package com.rhineai.kwgeneralserver

import com.rhineai.kwgeneralserver.utils.Environment
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class AccessControlAllowOriginFilter : WebMvcConfigurer {
    override fun addCorsMappings(registry: CorsRegistry) {
        if (Environment.isDev()) {
            registry.addMapping("/*/**")
                .allowedHeaders("*")
                .allowedMethods("*")
                .maxAge(1800)
                .allowedOrigins("*")
            return
        }
    }
}