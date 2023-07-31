package com.rhineai.kwgeneralserver.service

import com.rhineai.kwgeneralserver.mapper.ProjectMapper
import com.rhineai.kwgeneralserver.mapper.TokenMapper
import com.rhineai.kwgeneralserver.utils.Environment
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.io.File
import java.nio.file.Paths

@Service
class ProjectService {

    @Autowired
    private lateinit var tokenMapper: TokenMapper
    @Autowired
    private lateinit var projectMapper: ProjectMapper

    companion object {
        val ROOT_PATH = initRootPath()

        private fun initRootPath(): String {
            return if (Environment.isWindows()) {
                "C:\\xxx"
            } else {
                "/root/xxx"
            }
        }
    }

    fun getProjectPath(uid: Long, pid: Long): String {
        val userPath = Paths.get(ROOT_PATH, "user", uid.toString())
        val projectPath = Paths.get(userPath.toString(), pid.toString())
        return projectPath.toString()
    }

    fun readProjectData(uid: Long, pid: Long): String {
        val file = Paths.get(getProjectPath(uid, pid), "project.json").toFile()
        if (!file.exists()) return ""
        return file.readText()
    }

    fun writeProjectData(uid: Long, pid: Long, data: String) {
        val file = Paths.get(getProjectPath(uid, pid), "project.json").toFile()
        if (!file.exists()) {
            file.parentFile.mkdirs()
            file.createNewFile()
        }
        file.writeText(data)
    }

    fun getProjectCover(uid: Long, pid: Long): File {
        return Paths.get(getProjectPath(uid, pid), "cover.jpg").toFile()
    }


}