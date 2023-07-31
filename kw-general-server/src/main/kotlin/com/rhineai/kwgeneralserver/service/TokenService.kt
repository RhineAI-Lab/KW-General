package com.rhineai.kwgeneralserver.service

import com.rhineai.kwgeneralserver.config.CryptoConfig
import com.rhineai.kwgeneralserver.controller.response.Response
import com.rhineai.kwgeneralserver.entry.Token
import com.rhineai.kwgeneralserver.entry.User
import com.rhineai.kwgeneralserver.mapper.LogMapper
import com.rhineai.kwgeneralserver.mapper.TokenMapper
import com.rhineai.kwgeneralserver.mapper.UserMapper
import com.rhineai.kwgeneralserver.utils.CryptUtils
import com.rhineai.kwgeneralserver.utils.DigestUtils
import jakarta.servlet.http.HttpServletRequest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.util.*

@Service
class TokenService {

    @Autowired
    private lateinit var userMapper: UserMapper
    @Autowired
    private lateinit var logMapper: LogMapper
    @Autowired
    private lateinit var tokenMapper: TokenMapper

    @Autowired
    private lateinit var cryptoConfig: com.rhineai.kwgeneralserver.config.CryptoConfig

    companion object {
        const val TOKEN_EXPIRE_TIME = 1000 * 60 * 60 * 24 * 365L
    }

    fun getUser(tokenText: String, checkUser: Boolean = true): Pair<Int, User> {
        val du = User()
        if (tokenText.length < 16) return Pair(10031, du)
        val tokens = tokenMapper.selectByMap(mapOf("token" to tokenText))
        tokens.isEmpty() && return Pair(10032, du)
        val token = tokens[0]
        if (token.status != Token.Status.VALID) return Pair(10033, du)
        token.lastUseTime = Date()
        if (token.expireTime == null || token.expireTime.time < Date().time) {
            tokenMapper.updateById(token)
            return Pair(10033, du)
        }
        tokenMapper.updateById(token)

        val users = userMapper.selectByMap(mapOf("uid" to token.uid))
        users.isEmpty() && return Pair(10034, du)
        val user = users.getOrNull(0)
        if (!checkUser) return Pair(0, du)
        return checkUser(user)
    }

    fun checkUser(user: User?): Pair<Int, User> {
        if (user == null) return Pair(10034, User())
        if (user.permission == User.Permission.BANNED) return Pair(10035, user)
        if (user.permission == User.Permission.CLOSED) return Pair(10036, user)
        return Pair(0, user)
    }

    fun getToken(tokenText: String): Token? {
        val tokens = tokenMapper.selectByMap(mapOf("token" to tokenText))
        tokens.isEmpty() && return null
        return tokens[0]
    }

    fun getUserByRequest(request: HttpServletRequest): User? {
        val cookies = request.cookies
        cookies?: return null
        cookies.isEmpty() && return null
        for (cookie in cookies) {
            if (cookie.name == "token") {
                val tokenText = cookie.value
                val (code, user) = getUser(tokenText)
                if (code == 0) return user
            }
        }
        return null
    }

    fun createToken(uid: Long, ip: String): String {
        val createTime = Date()
        val expireTime = Date(createTime.time + TOKEN_EXPIRE_TIME)

        val salt = "KW-GENERAL-SERVER-TOKEN-SALT-917032"
        var text = "$uid,$ip,${createTime.time},"
        val sign = DigestUtils.md5(text + salt)
        text += sign
        val tokenText = CryptUtils.encrypt(text, cryptoConfig.getAesKey())

        val token = Token(tokenText, uid, ip, createTime, expireTime, createTime)
        val ln = tokenMapper.insert(token)
        if (ln != 1) return ""
        return tokenText
    }

}