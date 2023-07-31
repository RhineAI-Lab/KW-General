package com.rhineai.kwgeneralserver.mapper

import com.rhineai.kwgeneralserver.entry.Session
import org.apache.ibatis.annotations.Mapper

@Mapper
interface SessionMapper: BaseMapper<Session> {
}