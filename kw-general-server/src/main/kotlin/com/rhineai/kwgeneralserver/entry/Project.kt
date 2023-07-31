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
@TableName("project")
class Project (
    @TableId(type = IdType.AUTO)
    val pid: Long? = null,
    var uid: Long? = null,
    var title: String? = null,
    var status: Status? = null,
    var readPermission: String? = null,
    var writePermission: String? = null,
    val createTime: Date? = null,
    var editTime: Date? = null,
) {
    enum class Status(val value: String) {
        NORMAL("NORMAL"),
        BAN("BANNED"),
        DELETED("DELETED"),
    }

    enum class Permission(val value: String) {
        PUBLIC("PUBLIC"),
        FRIEND("FRIEND"),
        PRIVATE("PRIVATE"),
    }
}
