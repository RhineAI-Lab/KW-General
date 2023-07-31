package com.rhineai.kwgeneralserver.entry

import com.baomidou.mybatisplus.annotation.IdType
import com.baomidou.mybatisplus.annotation.TableId
import com.baomidou.mybatisplus.annotation.TableName
import lombok.AllArgsConstructor
import lombok.Data
import lombok.NoArgsConstructor
import java.util.*

@Data
@AllArgsConstructor
@NoArgsConstructor
@TableName("log")
class Log (
    var type: Type? = null,
    var msg: String? = null,
    var ip: String? = null,
    var uid: Long? = null,
    var pid: Long? = null,
    var result: Result? = null,
    @TableId(type = IdType.AUTO)
    var lid: Long? = null,
    var time: Date? = null,
    var level: Level? = null,
) {
    enum class Type(val value: String) {
        LOGIN("LOGIN"),
        LOGOUT("LOGOUT"),
        REGISTER("REGISTER"),

        CREATE_PROJECT("CREATE_PROJECT"),
        SAVE_PROJECT("SAVE_PROJECT"),
        DELETE_PROJECT("DELETE_PROJECT"),
        VIEW_PROJECT("VIEW_PROJECT"),
        OTHER("OTHER"),

        CREATE_SESSION("CREATE_SESSION"),
        SAVE_SESSION("SAVE_SESSION"),
        DELETE_SESSION("DELETE_SESSION"),
        VIEW_SESSION("VIEW_SESSION"),
    }

    enum class Level(val value: String) {
        DEBUG("DEBUG"),
        VERBOSE("VERBOSE"),
        LOG("LOG"),
        INFO("INFO"),
        WARN("WARN"),
        ERROR("ERROR"),
    }

    enum class Result(val value: String) {
        SUCCESS("SUCCESS"),
        FAIL("FAIL"),
        UNKNOWN("UNKNOWN"),
    }
}