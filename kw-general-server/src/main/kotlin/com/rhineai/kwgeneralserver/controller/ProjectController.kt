package com.rhineai.kwgeneralserver.controller

import com.alibaba.fastjson2.JSONArray
import com.alibaba.fastjson2.JSONObject
import com.rhineai.kwgeneralserver.controller.response.Response
import com.rhineai.kwgeneralserver.entry.Project
import com.rhineai.kwgeneralserver.mapper.ProjectMapper
import com.rhineai.kwgeneralserver.service.ProjectService
import com.rhineai.kwgeneralserver.service.TokenService
import jakarta.servlet.http.HttpServletRequest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.io.FileSystemResource
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.io.File
import java.util.*


@RestController
@RequestMapping("/api/project")
class ProjectController {

    @Autowired
    private lateinit var projectMapper: ProjectMapper
    @Autowired
    private lateinit var projectService: ProjectService
    @Autowired
    private lateinit var tokenService: TokenService

    @GetMapping("/list")
    fun list(
        @RequestHeader("Authorization", defaultValue = "") tokenText: String,
        request: HttpServletRequest
    ): Map<String, Any> {
        val (code, user) = tokenService.getUser(tokenText)
        if (code != 0) return Response.fail(code)
        val projects = projectMapper.selectByMap(mapOf(
            "uid" to user.uid,
            "status" to "NORMAL"
        ))
        return Response.success(mapOf("projects" to projects))
    }

    @GetMapping("/create")
    fun create(
        @RequestHeader("Authorization", defaultValue = "") tokenText: String,
        request: HttpServletRequest,
        @RequestParam("title", defaultValue = "新项目") title: String,
    ): Map<String, Any> {
        val (code, user) = tokenService.getUser(tokenText)
        if (code != 0) return Response.fail(code)
        val project = Project(null, user.uid, title)
        val ln = projectMapper.insert(project)
        if (ln != 1) return Response.fail(10112, "Create project failed.")
        return Response.success(mapOf("project" to project))
    }

    @GetMapping("/delete")
    fun delete(
        @RequestHeader("Authorization", defaultValue = "") tokenText: String,
        request: HttpServletRequest,
        @RequestParam("pid", defaultValue = "") pid: String,
    ): Map<String, Any> {
        val (code, user) = tokenService.getUser(tokenText)
        user?: return Response.fail(10121, "User not found.")
        val project = getProject(tokenText, pid, user.uid!!)
        if (project !is Project) return project as Map<String, Any>

        project.status = Project.Status.DELETED
        val ln = projectMapper.updateById(project)
        if (ln != 1) return Response.fail(10122, "Delete project failed.")
        val projects = projectMapper.selectByMap(mapOf(
            "uid" to user.uid,
            "status" to "NORMAL"
        ))
        return Response.success(mapOf("projects" to projects))
    }

    @GetMapping("/load")
    fun load(
        @RequestHeader("Authorization", defaultValue = "") tokenText: String,
        request: HttpServletRequest,
        @RequestParam("pid", defaultValue = "") pid: String,
    ): Map<String, Any> {
        val project = getProject(tokenText, pid)
        if (project !is Project) return project as Map<String, Any>
        val data = projectService.readProjectData(project.uid!!, project.pid!!)
        return Response.success(mapOf("project" to project, "data" to data))
    }

    @PostMapping("/update")
    fun update(
        @RequestHeader("Authorization", defaultValue = "") tokenText: String,
        request: HttpServletRequest,
        @RequestParam("pid", defaultValue = "") pid: String,
        @RequestBody(required = true) data: String,
    ): Map<String, Any> {
        val project = getProject(tokenText, pid)
        if (project !is Project) return project as Map<String, Any>
        try {
            val json = JSONObject.parseObject(data)
            if (json == null || json.isEmpty()) return Response.fail(464, "Invalid data.")
            project.title = json.getString("title") ?: return Response.fail(465, "Params missing in data. (Missing: title)")
            val rp = json.getJSONObject("permission").get("read")
            if (rp is JSONArray) {
                project.readPermission = rp.joinToString(",")
            } else if (rp is String) {
                project.readPermission = rp
            } else {
                return Response.fail(10131, "Params missing in data. (Missing: permission.read)")
            }
            val wp = json.getJSONObject("permission").get("write")
            if (wp is JSONArray) {
                project.writePermission = wp.joinToString(",")
            } else if (wp is String) {
                project.writePermission = wp
            } else {
                return Response.fail(10132, "Params missing in data. (Missing: permission.write)")
            }
        } catch (e: Exception) {
            return Response.fail(10133, "Invalid data. (Parse error)")
        }
        projectService.writeProjectData(project.uid!!, project.pid!!, data)
        project.editTime = Date()
        val ln = projectMapper.updateById(project)
        if (ln != 1) return Response.fail(10134, "Save project failed.")
        return Response.success(mapOf("project" to project))
    }

    @GetMapping("/cover")
    fun cover(
        request: HttpServletRequest,
        @RequestParam("pid", defaultValue = "") pid: String,
    ): ResponseEntity<FileSystemResource?> {
        val pn = pid.toLongOrNull() ?: return ResponseEntity(HttpStatus.NOT_FOUND)
        val projects = projectMapper.selectByMap(mapOf(
            "pid" to pn,
            "status" to "NORMAL"
        ))
        if (projects.isEmpty()) return ResponseEntity(HttpStatus.NOT_FOUND)
        val project = projects[0]
        if (project !is Project) return ResponseEntity(HttpStatus.NOT_FOUND)
        val file = projectService.getProjectCover(project.uid!!, project.pid!!)
        return export(file)
    }

    fun export(file: File): ResponseEntity<FileSystemResource?> {
        val headers = HttpHeaders()
        headers.add("Content-Type", "image/jpeg")
        headers.add("Cache-Control", "no-cache, no-store, must-revalidate")
        headers.add("Content-Disposition", "attachment; filename=cover.jpg")
        headers.add("Pragma", "no-cache")
        headers.add("Expires", "0")
        headers.add("Last-Modified", Date().toString())
        headers.add("ETag", System.currentTimeMillis().toString())
        return ResponseEntity.ok().headers(headers).contentLength(file.length())
            .contentType(MediaType.parseMediaType("application/octet-stream"))
            .body<FileSystemResource>(FileSystemResource(file))
    }


    fun getProject(token: String, pid: String, uid: Long = -1): Any {
        val pn = pid.toLongOrNull() ?: return Response.fail(10141, "Invalid pid.")
        var nUid = uid
        if (uid == -1L) {
            val (code, user) = tokenService.getUser(token)
            user?: return Response.fail(10142, "User not found.")
            nUid = user.uid!!
        }
        val projects = projectMapper.selectByMap(mapOf(
            "uid" to nUid,
            "pid" to pn,
            "status" to "NORMAL"
        ))
        projects.isEmpty() && return Response.fail(10143, "Project not found.")
        return projects[0]
    }
}

