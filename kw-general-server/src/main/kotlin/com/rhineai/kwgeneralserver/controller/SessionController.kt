package com.rhineai.kwgeneralserver.controller

import com.google.gson.Gson
import com.rhineai.kwgeneralserver.controller.response.ErrorCode
import com.rhineai.kwgeneralserver.controller.response.Response
import com.rhineai.kwgeneralserver.entry.Log
import com.rhineai.kwgeneralserver.entry.Session
import com.rhineai.kwgeneralserver.entry.User
import com.rhineai.kwgeneralserver.mapper.LogMapper
import com.rhineai.kwgeneralserver.mapper.SessionMapper
import com.rhineai.kwgeneralserver.service.ProjectService
import com.rhineai.kwgeneralserver.service.SessionService
import com.rhineai.kwgeneralserver.service.TokenService
import jakarta.servlet.http.HttpServletRequest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/session")
class SessionController {

    @Autowired
    private lateinit var projectService: ProjectService
    @Autowired
    private lateinit var tokenService: TokenService
    @Autowired
    private lateinit var sessionService: SessionService

    @Autowired
    private lateinit var sessionMapper: SessionMapper
    @Autowired
    private lateinit var logMapper: LogMapper

    @PostMapping("")
    fun create(
        @RequestHeader("Authorization", defaultValue = "") token: String,
        request: HttpServletRequest,
        @RequestBody body: Map<String, Any>,
    ): Map<String, Any> {
        val (code, user) = tokenService.getUser(token)
        if (code != 0) return Response.fail(code)

        var content = "{\"title\": \"新对话\"}"
        if (body["content"] != null) {
            content = body["content"] as String
            if (content.length > 16777215) return Response.fail(10112)
        }
        val session = Session(null, user.uid, content, Session.Status.NORMAL)
        val line = sessionMapper.insert(session)
        if (line != 1) return Response.fail(20000)
        log(Log.Type.CREATE_SESSION, 0, request, user, session)

        return Response.success(mapOf(
            "sid" to session.sid
        ))
    }

    @GetMapping("/{sid}")
    fun get(
        @RequestHeader("Authorization", defaultValue = "") token: String,
        request: HttpServletRequest,
        @PathVariable("sid") sid: Long,
    ): Map<String, Any> {
        val (code, user, session) = getSessionAndUser(sid, token)
        if (code != 0) return Response.fail(code)

        return Response.success(mapOf(
            "sid" to session.sid,
            "content" to session.content,
            "createTime" to session.createTime!!.time,
            "editTime" to session.editTime!!.time,
        ))
    }

    @GetMapping("")
    fun list(
        @RequestHeader("Authorization", defaultValue = "") token: String,
        request: HttpServletRequest,
    ): Map<String, Any> {
        val (code, user) = tokenService.getUser(token)
        if (code != 0) return Response.fail(code)

        var result: Array<Map<String, Any>> = emptyArray()
        val sessions = sessionMapper.selectByMap(mapOf(
            "uid" to user.uid
        ))
        for (session in sessions) {
            if (session.status == Session.Status.DELETED) continue
            if (session.status == Session.Status.BANNED) continue
            result += mapOf<String, Any>(
                "sid" to session.sid!!,
                "createTime" to session.createTime!!.time,
                "editTime" to session.editTime!!.time,
            )
        }
        return Response.success(result)
    }

    @PutMapping("/{sid}")
    fun update(
        @RequestHeader("Authorization", defaultValue = "") token: String,
        request: HttpServletRequest,
        @PathVariable("sid") sid: Long,
        @RequestBody body: Map<String, Any>,
    ): Map<String, Any> {
        val (code, user, session) = getSessionAndUser(sid, token)
        if (code != 0) return Response.fail(code)

        if ("content" in body) {
            session.content = body["content"] as String
            sessionMapper.updateById(session)
            return Response.success()
        } else {
            return Response.fail(10111)
        }
    }

    @DeleteMapping("/{sid}")
    fun delete(
        @RequestHeader("Authorization", defaultValue = "") token: String,
        request: HttpServletRequest,
        @PathVariable("sid") sid: Long,
    ): Map<String, Any> {
        val (code, user, session) = getSessionAndUser(sid, token)
        if (code != 0) return Response.fail(code)

        log(Log.Type.DELETE_SESSION, 0, request, user, session)
        session.status = Session.Status.DELETED
        sessionMapper.updateById(session)
        return Response.success()
    }

    fun justCode(code: Int): Triple<Int, User, Session> {
        return Triple(code, User(), Session())
    }
    fun getSessionAndUser(sid: Long, token: String): Triple<Int, User, Session> {
        val (code, user) = tokenService.getUser(token)
        if (code != 0) return justCode(code)
        val session = sessionMapper.selectById(sid) ?: return justCode(10101)
        if (session.status == Session.Status.BANNED) return justCode(10102)
        if (session.status == Session.Status.DELETED) return justCode(10103)
        if (session.uid != user.uid && user.permission != User.Permission.ADMIN) return justCode(10104)
        return Triple(0, user, session)
    }

    fun log(type: Log.Type, code: Int, request: HttpServletRequest, user: User? = null, session: Session? = null) {
        logMapper.insert(Log(
            type,
            ErrorCode.get(code),
            request.remoteAddr,
            user?.uid ?: -1,
            session?.sid ?: -1,
            if (code == 0) Log.Result.SUCCESS else Log.Result.FAIL,
        ))
    }

}