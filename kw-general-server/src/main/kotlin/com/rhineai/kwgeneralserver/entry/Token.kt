package com.rhineai.kwgeneralserver.entry

import com.baomidou.mybatisplus.annotation.TableId
import com.baomidou.mybatisplus.annotation.TableName
import lombok.AllArgsConstructor
import lombok.Data
import lombok.NoArgsConstructor
import java.util.Date

@Data
@AllArgsConstructor
@NoArgsConstructor
@TableName("token")
class Token (
    @TableId
    val token: String? = null,
    val uid: Long? = null,
    val ip: String? = null,
    val createTime: Date? = null,
    val expireTime: Date? = null,
    var lastUseTime: Date? = null,
    var status: Status? = null,
) {

    enum class Status(val value: String) {
        VALID("VALID"),
        INVALID("INVALID"),
    }

}