package expo.modules.localai

import android.content.Context
import java.io.File
import java.io.InputStream
import java.security.MessageDigest

object AssetModelExtractor {

  private const val MODELS_DIR_NAME = "local_ai_models"

  fun getModelsDirectory(context: Context): File {
    val dir = File(context.filesDir, MODELS_DIR_NAME)
    if (!dir.exists()) {
      dir.mkdirs()
    }
    return dir
  }

  /**
   * Resolves a model path from either an on-disk path (e.g. from post-install download),
   * or a bundled APK asset.
   */
  fun resolveModelPath(
    context: Context,
    modelPathOrAsset: String,
    isAssetExplicit: Boolean = false
  ): File {
    val cleanPath = modelPathOrAsset.removePrefix("file://")

    // Case 1: Direct absolute file on device
    val directFile = File(cleanPath)
    if (!isAssetExplicit && directFile.isAbsolute && directFile.exists() && directFile.isFile) {
      return directFile
    }

    // Case 2: Asset bundled in APK
    val assetFileName = File(cleanPath).name
    val destinationFile = File(getModelsDirectory(context), assetFileName)

    var assetStream: InputStream? = null
    try {
      assetStream = try {
        context.assets.open(cleanPath)
      } catch (_: Exception) {
        context.assets.open("models/$cleanPath")
      }

      val assetLength = try {
        context.assets.openFd(cleanPath).length
      } catch (_: Exception) {
        -1L
      }

      if (destinationFile.exists() && destinationFile.length() > 0) {
        if (assetLength <= 0 || destinationFile.length() == assetLength) {
          assetStream.close()
          return destinationFile
        }
      }

      destinationFile.parentFile?.mkdirs()
      destinationFile.outputStream().use { out ->
        assetStream.copyTo(out, bufferSize = 64 * 1024)
      }

      return destinationFile
    } catch (e: Exception) {
      if (directFile.exists()) {
        return directFile
      }
      throw IllegalArgumentException(
        "Could not resolve model '$modelPathOrAsset'. It is neither an existing file nor an APK asset: ${e.message}"
      )
    } finally {
      try {
        assetStream?.close()
      } catch (_: Exception) {}
    }
  }

  /**
   * Computes SHA-256 checksum of a file for integrity verification.
   */
  fun computeSha256(file: File): String {
    val digest = MessageDigest.getInstance("SHA-256")
    file.inputStream().use { input ->
      val buffer = ByteArray(64 * 1024)
      var read: Int
      while (input.read(buffer).also { read = it } != -1) {
        digest.update(buffer, 0, read)
      }
    }
    return digest.digest().joinToString("") { "%02x".format(it) }
  }

  /**
   * Lists all local models in the models directory.
   */
  fun listCachedModels(context: Context): List<Map<String, Any>> {
    val dir = getModelsDirectory(context)
    val files = dir.listFiles { file ->
      file.isFile && (file.extension.equals("gguf", ignoreCase = true) || file.extension.equals("bin", ignoreCase = true))
    } ?: return emptyList()

    return files.map { file ->
      mapOf(
        "name" to file.name,
        "path" to file.absolutePath,
        "sizeBytes" to file.length(),
        "sizeMb" to (file.length() / (1024 * 1024)),
        "lastModified" to file.lastModified()
      )
    }
  }

  /**
   * Deletes a model from the models directory.
   */
  fun deleteCachedModel(context: Context, fileName: String): Boolean {
    val file = File(getModelsDirectory(context), fileName)
    return if (file.exists() && file.isFile) {
      file.delete()
    } else {
      false
    }
  }
}
