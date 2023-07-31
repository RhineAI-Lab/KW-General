package com.rhineai.kwgeneralserver.mapper

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper

interface BaseMapper<T>: com.baomidou.mybatisplus.core.mapper.BaseMapper<T> {

    fun selectOne(queryWrapper: QueryWrapper<T>): T? {
        val list = selectList(queryWrapper)
        return if (list.isEmpty()) null else list[0]
    }

}