package expo.modules.setubetascanner.algorithms

import kotlin.math.acos
import kotlin.math.sqrt

/**
 * Core mathematical operations for vision algorithms
 * Handles 2D/3D geometry, vectors, angles, and distances
 */
object GeometryMath {
  private const val EPSILON = 1e-9

  /**
   * Calculate Euclidean distance between two 3D points
   */
  fun distance3D(p1: Point3D, p2: Point3D): Double {
    val dx = p1.x - p2.x
    val dy = p1.y - p2.y
    val dz = p1.z - p2.z
    return sqrt(dx * dx + dy * dy + dz * dz)
  }

  /**
   * Calculate Euclidean distance between two 2D points
   */
  fun distance2D(p1: Point2D, p2: Point2D): Double {
    val dx = p1.x - p2.x
    val dy = p1.y - p2.y
    return sqrt(dx * dx + dy * dy)
  }

  /**
   * Calculate signed angle between two 2D points
   * Returns angle in degrees, positive for clockwise rotation
   */
  fun signedAngle2D(x1: Float, y1: Float, x2: Float, y2: Float): Double {
    val dx = x2 - x1
    val dy = y2 - y1
    return Math.toDegrees(kotlin.math.atan2(dy.toDouble(), dx.toDouble()))
  }

  /**
   * Calculate the angle between three points in 3D space
   * Returns degrees in range [0, 180]
   */
  fun angleDegrees3D(a: Point3D, vertex: Point3D, c: Point3D): AngleResult {
    if (!isFinite(a) || !isFinite(vertex) || !isFinite(c)) {
      return AngleResult.Invalid("Non-finite coordinates")
    }

    val ux = a.x - vertex.x
    val uy = a.y - vertex.y
    val uz = a.z - vertex.z

    val vx = c.x - vertex.x
    val vy = c.y - vertex.y
    val vz = c.z - vertex.z

    val normU = sqrt(ux * ux + uy * uy + uz * uz)
    val normV = sqrt(vx * vx + vy * vy + vz * vz)

    if (normU <= EPSILON || normV <= EPSILON) {
      return AngleResult.Invalid("Degenerate joint vectors")
    }

    val dot = ux * vx + uy * vy + uz * vz
    val cosine = (dot / (normU * normV)).coerceIn(-1.0, 1.0)

    val angle = Math.toDegrees(acos(cosine))

    if (!angle.isFinite()) {
      return AngleResult.Invalid("Invalid angle result")
    }

    return AngleResult.Valid(angle)
  }

  /**
   * Calculate midpoint between two 3D points
   */
  fun midpoint3D(p1: Point3D, p2: Point3D): Point3D {
    return Point3D(
      (p1.x + p2.x) / 2.0,
      (p1.y + p2.y) / 2.0,
      (p1.z + p2.z) / 2.0
    )
  }

  /**
   * Calculate midpoint between two 2D points
   */
  fun midpoint2D(p1: Point2D, p2: Point2D): Point2D {
    return Point2D(
      (p1.x + p2.x) / 2.0,
      (p1.y + p2.y) / 2.0
    )
  }

  /**
   * Subtract two 3D vectors
   */
  fun subtract3D(a: Point3D, b: Point3D): Point3D {
    return Point3D(a.x - b.x, a.y - b.y, a.z - b.z)
  }

  /**
   * Calculate dot product of two 3D vectors
   */
  fun dot3D(a: Point3D, b: Point3D): Double {
    return a.x * b.x + a.y * b.y + a.z * b.z
  }

  /**
   * Calculate cross product of two 3D vectors
   */
  fun cross3D(a: Point3D, b: Point3D): Point3D {
    return Point3D(
      a.y * b.z - a.z * b.y,
      a.z * b.x - a.x * b.z,
      a.x * b.y - a.y * b.x
    )
  }

  /**
   * Calculate norm (magnitude) of a 3D vector
   */
  fun norm3D(v: Point3D): Double {
    return sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
  }

  /**
   * Normalize a 3D vector to unit length
   */
  fun normalize3D(v: Point3D): Point3D {
    val norm = norm3D(v)
    if (norm <= EPSILON) {
      return Point3D(0.0, 0.0, 0.0)
    }
    return Point3D(v.x / norm, v.y / norm, v.z / norm)
  }

  /**
   * Check if a point has finite coordinates
   */
  private fun isFinite(p: Point3D): Boolean {
    return p.x.isFinite() && p.y.isFinite() && p.z.isFinite()
  }

  /**
   * Calculate distance between two MediaPipe NormalizedLandmark points
   */
  fun calculateDistance3D(
    p1: com.google.mediapipe.tasks.components.containers.NormalizedLandmark,
    p2: com.google.mediapipe.tasks.components.containers.NormalizedLandmark
  ): Double {
    val dx = (p1.x() - p2.x()).toDouble()
    val dy = (p1.y() - p2.y()).toDouble()
    val dz = (p1.z() - p2.z()).toDouble()
    return sqrt(dx * dx + dy * dy + dz * dz)
  }

  /**
   * Calculate eye aspect ratio (EAR) for blink detection
   * Formula: (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
   */
  fun calculateEyeAspectRatio(
    p1: com.google.mediapipe.tasks.components.containers.NormalizedLandmark,
    p2: com.google.mediapipe.tasks.components.containers.NormalizedLandmark,
    p3: com.google.mediapipe.tasks.components.containers.NormalizedLandmark,
    p4: com.google.mediapipe.tasks.components.containers.NormalizedLandmark,
    p5: com.google.mediapipe.tasks.components.containers.NormalizedLandmark,
    p6: com.google.mediapipe.tasks.components.containers.NormalizedLandmark
  ): Double {
    val vertical1 = calculateDistance3D(p2, p6)
    val vertical2 = calculateDistance3D(p3, p5)
    val horizontal = calculateDistance3D(p1, p4)
    return (vertical1 + vertical2) / (2.0 * horizontal)
  }

  /**
   * Calculate angle at a vertex between three 3D points
   */
  fun calculateAngle(
    a: com.google.mediapipe.tasks.components.containers.NormalizedLandmark,
    vertex: com.google.mediapipe.tasks.components.containers.NormalizedLandmark,
    c: com.google.mediapipe.tasks.components.containers.NormalizedLandmark
  ): Double {
    val ux = (a.x() - vertex.x()).toDouble()
    val uy = (a.y() - vertex.y()).toDouble()
    val uz = (a.z() - vertex.z()).toDouble()

    val vx = (c.x() - vertex.x()).toDouble()
    val vy = (c.y() - vertex.y()).toDouble()
    val vz = (c.z() - vertex.z()).toDouble()

    val normU = sqrt(ux * ux + uy * uy + uz * uz)
    val normV = sqrt(vx * vx + vy * vy + vz * vz)

    if (normU <= EPSILON || normV <= EPSILON) {
      return 0.0
    }

    val dot = ux * vx + uy * vy + uz * vz
    val cosine = (dot / (normU * normV)).coerceIn(-1.0, 1.0)

    return Math.toDegrees(acos(cosine))
  }
}

/**
 * 3D point representation
 */
data class Point3D(val x: Double, val y: Double, val z: Double)

/**
 * 2D point representation
 */
data class Point2D(val x: Double, val y: Double)

/**
 * Result of angle calculation
 */
sealed class AngleResult {
  data class Valid(val degrees: Double) : AngleResult()
  data class Invalid(val reason: String) : AngleResult()
}
