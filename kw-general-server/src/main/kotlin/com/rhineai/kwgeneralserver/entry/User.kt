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
@TableName("user")
class User(
    @TableId(type = IdType.AUTO)
    val uid: Long? = null,
    val name: String? = null,
    val phone: String? = null,
    val password: String? = null,
    val permission: Permission? = null,
    val registerTime: Date? = null,
    val checked: Checked? = null,

    val introduce: String? = null,
    val tags: String? = null,
    val photo: String? = null,
    val birthday: Date? = null,
) {
    companion object {
        fun createNewUser(
            phone: String,
            password: String,
            name: String = phone,
            permission: Permission = Permission.USER,
            registerTime: Date = Date(),
            checked: Checked = Checked.NOT_VERIFIED,
            photo: String? = "",
        ): User {
            return User(
                name = name,
                phone = phone,
                password = password,
                permission = permission,
                registerTime = registerTime,
                checked = checked,
                photo = photo
            )
        }
    }

    enum class Permission(val value: String) {
        ADMIN("ADMIN"),
        MANAGER("MANAGER"),
        VIP("VIP"),
        USER("USER"),
        BANNED("BANNED"),
        CLOSED("CLOSED"),
    }

    enum class Checked(val value: String) {
        NOT_VERIFIED("NOT_VERIFIED"),
        VERIFIED_ALL("VERIFIED_ALL"),
    }
}
