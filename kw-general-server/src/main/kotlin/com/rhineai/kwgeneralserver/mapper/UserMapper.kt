package com.rhineai.kwgeneralserver.mapper

import com.rhineai.kwgeneralserver.entry.User
import org.apache.ibatis.annotations.Mapper

@Mapper
interface UserMapper: BaseMapper<User> {

}
