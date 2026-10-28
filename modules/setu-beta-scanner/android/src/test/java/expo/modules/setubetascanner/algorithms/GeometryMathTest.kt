package expo.modules.setubetascanner.algorithms

import org.junit.Assert.*
import org.junit.Test

class GeometryMathTest {

    @Test
    fun testDistance3D() {
        val p1 = GeometryMath.Point3D(0.0, 0.0, 0.0)
        val p2 = GeometryMath.Point3D(3.0, 4.0, 0.0)

        val distance = GeometryMath.distance3D(p1, p2)
        assertEquals(5.0, distance, 0.001)
    }

    @Test
    fun testDistance2D() {
        val p1 = GeometryMath.Point2D(0.0, 0.0)
        val p2 = GeometryMath.Point2D(3.0, 4.0)

        val distance = GeometryMath.distance2D(p1, p2)
        assertEquals(5.0, distance, 0.001)
    }

    @Test
    fun testAngleDegrees3D_rightAngle() {
        val a = GeometryMath.Point3D(1.0, 0.0, 0.0)
        val vertex = GeometryMath.Point3D(0.0, 0.0, 0.0)
        val c = GeometryMath.Point3D(0.0, 1.0, 0.0)

        val result = GeometryMath.angleDegrees3D(a, vertex, c)
        assertTrue(result is GeometryMath.AngleResult.Valid)
        assertEquals(90.0, (result as GeometryMath.AngleResult.Valid).degrees, 0.1)
    }

    @Test
    fun testAngleDegrees3D_straightLine() {
        val a = GeometryMath.Point3D(1.0, 0.0, 0.0)
        val vertex = GeometryMath.Point3D(0.0, 0.0, 0.0)
        val c = GeometryMath.Point3D(2.0, 0.0, 0.0)

        val result = GeometryMath.angleDegrees3D(a, vertex, c)
        assertTrue(result is GeometryMath.AngleResult.Valid)
        assertEquals(180.0, (result as GeometryMath.AngleResult.Valid).degrees, 0.1)
    }

    @Test
    fun testAngleDegrees3D_acuteAngle() {
        val a = GeometryMath.Point3D(1.0, 0.0, 0.0)
        val vertex = GeometryMath.Point3D(0.0, 0.0, 0.0)
        val c = GeometryMath.Point3D(1.0, 1.0, 0.0)

        val result = GeometryMath.angleDegrees3D(a, vertex, c)
        assertTrue(result is GeometryMath.AngleResult.Valid)
        assertEquals(45.0, (result as GeometryMath.AngleResult.Valid).degrees, 1.0)
    }

    @Test
    fun testAngleDegrees3D_degenerateVectors() {
        val a = GeometryMath.Point3D(0.0, 0.0, 0.0)
        val vertex = GeometryMath.Point3D(0.0, 0.0, 0.0)
        val c = GeometryMath.Point3D(1.0, 0.0, 0.0)

        val result = GeometryMath.angleDegrees3D(a, vertex, c)
        assertTrue(result is GeometryMath.AngleResult.Invalid)
    }

    @Test
    fun testMidpoint3D() {
        val p1 = GeometryMath.Point3D(0.0, 0.0, 0.0)
        val p2 = GeometryMath.Point3D(2.0, 4.0, 6.0)

        val midpoint = GeometryMath.midpoint3D(p1, p2)
        assertEquals(1.0, midpoint.x, 0.001)
        assertEquals(2.0, midpoint.y, 0.001)
        assertEquals(3.0, midpoint.z, 0.001)
    }

    @Test
    fun testDot3D() {
        val a = GeometryMath.Point3D(1.0, 2.0, 3.0)
        val b = GeometryMath.Point3D(4.0, 5.0, 6.0)

        val dot = GeometryMath.dot3D(a, b)
        assertEquals(32.0, dot, 0.001) // 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
    }

    @Test
    fun testNorm3D() {
        val v = GeometryMath.Point3D(3.0, 4.0, 0.0)

        val norm = GeometryMath.norm3D(v)
        assertEquals(5.0, norm, 0.001)
    }

    @Test
    fun testNormalize3D() {
        val v = GeometryMath.Point3D(3.0, 4.0, 0.0)

        val normalized = GeometryMath.normalize3D(v)
        val norm = GeometryMath.norm3D(normalized)
        assertEquals(1.0, norm, 0.001)
    }

    @Test
    fun testSignedAngle2D() {
        val angle = GeometryMath.signedAngle2D(0f, 0f, 1f, 1f)
        assertEquals(45.0, angle, 0.1)
    }
}
