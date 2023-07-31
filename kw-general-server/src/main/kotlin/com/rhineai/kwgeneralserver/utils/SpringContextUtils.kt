package com.rhineai.kwgeneralserver.utils

import org.springframework.beans.BeansException
import org.springframework.context.ApplicationContext
import org.springframework.context.ApplicationContextAware
import org.springframework.stereotype.Component


@Component
class SpringContextUtils : ApplicationContextAware {

    @Throws(BeansException::class)
    override fun setApplicationContext(applicationContext: ApplicationContext) {
        Companion.applicationContext = applicationContext
    }

    companion object {

        var applicationContext: ApplicationContext? = null
            private set

        @Throws(BeansException::class)
        fun getBean(name: String?): Any {
            return applicationContext!!.getBean(name!!)
        }

        @Throws(BeansException::class)
        fun <T> getBean(beanClass: Class<T>): T {
            return applicationContext!!.getBean(beanClass)
        }

        val profile: String
            get() = applicationContext!!.environment.activeProfiles[0]
    }
}
