package com.rhineai.kwgeneralserver.controller.response

object Response {

    fun success(data: Any = emptyMap<String, Any>()): Map<String, Any> {
        return base(0, ErrorCode.get(0), data)
    }

    fun fail(code: Int, message: String = ""): Map<String, Any> {
        return base(code, ErrorCode.get(code), null)
    }

    private fun base(code: Int, message: String, data: Any?): Map<String, Any> {
        val map = mutableMapOf<String, Any>("code" to code)
        if (data != null) map["result"] = data
        if (message.isNotEmpty()) map["message"] = message
        map["timestamp"] = System.currentTimeMillis()
        map["apiVersion"] = "3.0.4"
        return map
    }

}