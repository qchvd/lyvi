// Same steps as "react-static-prerender --with-build", plus a reliable end on Windows:
// 1. build (buildCommand of prerender.config.js), 2. empty static-pages/,
// 3. prerender every route, 4. copy the build files (JS, CSS, images, locales...) next to the pages.
// Why a wrapper: on Windows the library cannot stop the temporary "serve" server it starts
// (process.kill(-pid) is not supported there), so the original command could hang forever.
import { execSync } from "child_process"
import fs from "fs/promises"
import path from "path"
import { prerender } from "react-static-prerender/src/index.js"
import config from "../prerender.config.js"

const serveDir = path.resolve(config.serveDir)
const outDir = path.resolve(config.outDir)

// Copies every built file except HTML (the pages come from the prerender)
async function copyBuildAssets(src, dest) {
    const stat = await fs.stat(src)
    if (stat.isDirectory()) {
        await fs.mkdir(dest, { recursive: true })
        for (const entry of await fs.readdir(src)) await copyBuildAssets(path.join(src, entry), path.join(dest, entry))
    } else if (!src.endsWith(".html")) {
        await fs.copyFile(src, dest)
    }
}

// Stops the temporary server started by the library ("serve -s dist -l <port>") on Windows
function stopTemporaryServer() {
    if (process.platform !== "win32") return
    try {
        execSync(
            `powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'serve' -and $_.CommandLine -match '-s ${config.serveDir} -l' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"`,
            { stdio: "ignore" }
        )
    } catch {
        // Nothing left to stop
    }
}

let exitCode = 0
try {
    execSync(config.buildCommand, { stdio: "inherit" })
    await fs.rm(outDir, { recursive: true, force: true })
    await prerender(config)
    await copyBuildAssets(serveDir, outDir)
    console.log(`✅ Copied build files from ${config.serveDir} to ${config.outDir}`)
} catch (error) {
    console.error("❌ Prerendering failed:", error)
    exitCode = 1
} finally {
    stopTemporaryServer()
    process.exit(exitCode)
}
