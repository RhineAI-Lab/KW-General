package com.rhineai.kwgeneralserver.entry

import com.baomidou.mybatisplus.annotation.IdType
import com.baomidou.mybatisplus.annotation.TableId
import com.baomidou.mybatisplus.annotation.TableName
import lombok.AllArgsConstructor
import lombok.Data
import lombok.NoArgsConstructor
import java.util.Date

@Data
@AllArgsConstructor
@NoArgsConstructor
@TableName("session")
class Session (
    @TableId(type = IdType.AUTO)
    val sid: Long? = null,
    var uid: Long? = null,
    var content: String? = null,
    var status: Status? = null,
    val createTime: Date? = null,
    var editTime: Date? = null,
) {
    enum class Status(val value: String) {
        NORMAL("NORMAL"),
        BANNED("BANNED"),
        DELETED("DELETED"),
    }
}
