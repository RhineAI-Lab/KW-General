package com.rhineai.kwgeneralserver.controller

import com.rhineai.kwgeneralserver.controller.response.ErrorCode
import com.rhineai.kwgeneralserver.controller.response.Response
import com.rhineai.kwgeneralserver.entry.Log
import com.rhineai.kwgeneralserver.entry.Token
import com.rhineai.kwgeneralserver.entry.User
import com.rhineai.kwgeneralserver.mapper.LogMapper
import com.rhineai.kwgeneralserver.mapper.TokenMapper
import com.rhineai.kwgeneralserver.mapper.UserMapper
import com.rhineai.kwgeneralserver.service.TokenService
import jakarta.servlet.http.HttpServletRequest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/user")
class UserController {

    @Autowired
    private lateinit var userMapper: UserMapper
    @Autowired
    private lateinit var logMapper: LogMapper
    @Autowired
    private lateinit var tokenMapper: TokenMapper

    @Autowired
    private lateinit var tokenService: TokenService

    @GetMapping("/login")
    fun login(
        @RequestParam(defaultValue = "") phone: String,
        @RequestParam(defaultValue = "") password: String,
        @RequestParam(defaultValue = "") code: String,
        request: HttpServletRequest
    ): Map<String, Any> {
        phone.isEmpty()  && return Response.fail(10001)
        (password.isEmpty() && code.isEmpty())  && return Response.fail(10004)

        val users = userMapper.selectByMap(mapOf("phone" to phone))
        users.isEmpty() && return Response.fail(10034)
        val user = users[0]
        if (user.permission == User.Permission.BANNED) return Response.fail(10035)
        if (user.permission == User.Permission.CLOSED) return Response.fail(10036)

        val ip = request.remoteAddr
        if (user.password != password) {
            logMapper.insert(Log(Log.Type.LOGIN, ErrorCode.get(10012), ip, user.uid, result = Log.Result.FAIL))
            return Response.fail(10012)
        }
        val token = tokenService.createToken(user.uid!!, ip)
        if (token.isEmpty()) {
            logMapper.insert(Log(Log.Type.LOGIN, ErrorCode.get(10011), ip, user.uid, result = Log.Result.FAIL))
            return Response.fail(10011)
        }
        logMapper.insert(Log(Log.Type.LOGIN, "Login success. Token: $token.", ip, user.uid, result = Log.Result.SUCCESS))
        return Response.success(mapOf(
            "token" to token,
            "phone" to user.phone,
            "name" to user.name,
            "permission" to user.permission
        ))
    }

    @GetMapping("/register")
    fun register(
        @RequestParam(defaultValue = "") phone: String,
        @RequestParam(defaultValue = "") password: String,
        @RequestParam(defaultValue = "") code: String,
        request: HttpServletRequest
    ): Map<String, Any> {
        phone.isEmpty()  && return Response.fail(10001)
        password.isEmpty()  && return Response.fail(10002)
//        code.isEmpty()  && return Response.fail(10003) // TODO: Add code support.
        if (phone.length != 11 || phone[0] != '1') return Response.fail(10006)

        val users = userMapper.selectByMap(mapOf("phone" to phone))
        if (users.isNotEmpty()) return Response.fail(10021)

        var user = User.createNewUser(phone, password)
        userMapper.insert(user)
        val ip = request.remoteAddr
        logMapper.insert(Log(Log.Type.REGISTER, "Register success.", ip, user.uid, result = Log.Result.SUCCESS))

        // 进行登录
        user = userMapper.selectByMap(mapOf("phone" to phone))[0]
        val token = tokenService.createToken(user.uid!!, ip)
        if (token.isEmpty()) {
            logMapper.insert(Log(Log.Type.LOGIN, ErrorCode.get(10011), ip, user.uid, result = Log.Result.FAIL))
            return Response.fail(10011)
        }
        logMapper.insert(Log(Log.Type.LOGIN, "Login when register success. Token: $token.", ip, user.uid, result = Log.Result.SUCCESS))
        return Response.success(mapOf(
            "token" to token,
            "phone" to user.phone,
            "name" to user.name,
            "permission" to user.permission
        ))
    }

    @GetMapping("/logout")
    fun logout(
        @RequestHeader("Authorization", defaultValue = "") tokenText: String,
        request: HttpServletRequest
    ): Map<String, Any> {
        if (tokenText.isEmpty() || tokenText.length < 32) return Response.fail(10031)
        val (code, user) = tokenService.getUser(tokenText, false)
        if (code != 0) return Response.fail(code)
        val ip = request.remoteAddr
        val token = tokenService.getToken(tokenText)
        token?: return Response.fail(10032)
        if (token.status == Token.Status.VALID) {
            token.status = Token.Status.INVALID
            tokenMapper.updateById(token)
        } else {
            return Response.fail(10033)
        }
        logMapper.insert(Log(Log.Type.LOGOUT, "Logout success.", ip, user.uid, result = Log.Result.SUCCESS))
        return Response.success()
    }

    // TODO 设置用户介绍信息

    @GetMapping("/check")
    fun check(
        @RequestHeader("Authorization", defaultValue = "") tokenText: String,
        request: HttpServletRequest
    ): Map<String, Any> {
        val (code, user) = tokenService.getUser(tokenText)
        if (code != 0) return Response.fail(code)
        return Response.success(mapOf(
            "phone" to user.phone,
            "name" to user.name,
            "permission" to user.permission
        ))
    }

    fun printAllUsersInfo() {
        val user = userMapper.selectList(null)
        println("All users:")
        println("uid name phone password permission registerTime")
        user.forEach {
            println("${it.uid} ${it.name} ${it.phone} ${it.password} ${it.permission} ${it.registerTime}")
        }
    }
}
