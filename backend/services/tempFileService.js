const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

async function writeBufferToTempFile(buffer, originalName) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "pocketdesk-"));
  try {
    const safeName = String(originalName || "upload")
      .replace(/[^a-zA-Z0-9._-]/g, "_");
    const tempPath = path.join(
      tempDir,
      `${crypto.randomUUID()}-${safeName}`
    );

    await fs.writeFile(tempPath, buffer);

    return {
      tempDir,
      tempPath
    };
  } catch (error) {
    await cleanupTempFile(null, tempDir);
    throw error;
  }
}

async function cleanupTempFile(tempPath, tempDir) {
  if (tempPath) {
    await fs.unlink(tempPath).catch(() => {});
  }

  if (tempDir) {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

module.exports = {
  writeBufferToTempFile,
  cleanupTempFile
};
