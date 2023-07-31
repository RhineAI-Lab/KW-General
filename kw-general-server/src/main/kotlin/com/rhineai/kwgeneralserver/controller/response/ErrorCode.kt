package com.rhineai.kwgeneralserver.controller.response

object ErrorCode {

    private val DATA_TEXT = """
        
        0 - Success.
        20000 - Unknown error.
        
        10001 - Phone is needed.
        10002 - Password is needed.
        10003 - Code is needed.
        10004 - Password or code is needed.
        10005 - Login type is needed.
        10006 - Phone is invalid.
        
        10011 - Create token failed.
        10012 - Phone or password is incorrect.
        
        10021 - Phone has been registered.
        
        10031 - Token is invalid.
        10032 - Token not found.
        10033 - Token is expired.
        10034 - User not found.
        10035 - User is banned.
        10036 - User had closed.
        10037 - User permission denied.
        
        10101 - Session not found.
        10102 - Session is banned.
        10103 - Session is deleted.
        10104 - Session permission denied.
        
        10111 - Nothing to update.
        10112 - Content is too long.
        
    """.trimIndent()

    var data: Array<Map<Int, String>> = emptyArray()

    private fun makeData() {
        DATA_TEXT.split("\n").forEach {
            val items = it.trim().split(" - ")
            if (items.size == 2) {
                val code = items[0].trim().toIntOrNull()
                if (code != null) {
                    data += mapOf(code to items[1].trim())
                }
            }
        }
    }

    fun get(code: Int): String {
        if (data.isEmpty()) makeData()
        return data.firstOrNull { it.containsKey(code) }?.get(code) ?: "Unknown error."
    }

}