package expo.modules.setubetascanner.algorithms.audio

/**
 * Analyzes voice characteristics for pitch tracking and formant analysis
 * Uses YIN algorithm for fundamental frequency estimation
 */
class VoiceAnalyzer {

    private val sampleRate: Int = 16000
    private val frameSize: Int = 1024

    fun analyze(audioData: ShortArray): VoiceMetrics {
        // Allocation-free conversion to normalized float/double [-1.0, 1.0]
        val samples = DoubleArray(audioData.size)
        for (i in audioData.indices) {
            samples[i] = audioData[i].toDouble() / 32768.0
        }

        // Calculate RMS
        val rms = calculateRMS(samples)

        // Estimate fundamental frequency using YIN
        val f0 = estimatePitch(samples)

        // Estimate formants (simplified LPC)
        val formants = estimateFormants(samples)

        // Calculate resonance score
        val resonanceScore = calculateResonanceScore(f0, formants)

        // Target frequency based on gender (placeholder)
        val targetFrequency = if (f0 < 150) 100.0 else 180.0

        return VoiceMetrics(
            fundamentalFrequency = f0,
            formantF1 = formants[0],
            formantF2 = formants[1],
            resonanceScore = resonanceScore,
            targetFrequency = targetFrequency
        )
    }

    private fun calculateRMS(samples: DoubleArray): Double {
        var sum = 0.0
        for (sample in samples) {
            sum += sample * sample
        }
        return kotlin.math.sqrt(sum / samples.size)
    }

    private fun estimatePitch(samples: DoubleArray): Double {
        // Simplified YIN algorithm
        val minLag = sampleRate / 400 // 400 Hz max
        val maxLag = sampleRate / 60  // 60 Hz min

        val differenceFunction = calculateDifferenceFunction(samples)
        val cumulativeMean = calculateCumulativeMean(differenceFunction)

        // Find the first dip below threshold
        val threshold = 0.1
        for (lag in minLag until maxLag) {
            if (cumulativeMean[lag] < threshold) {
                // Parabolic interpolation for better precision
                if (lag > 0 && lag < cumulativeMean.size - 1) {
                    val prev = cumulativeMean[lag - 1]
                    val curr = cumulativeMean[lag]
                    val next = cumulativeMean[lag + 1]

                    if (prev > curr && curr < next) {
                        val refinedLag = lag + (prev - next) / (2 * (prev - 2 * curr + next))
                        return sampleRate.toDouble() / refinedLag
                    }
                }
                return sampleRate.toDouble() / lag
            }
        }

        return 0.0 // No clear pitch detected
    }

    private fun calculateDifferenceFunction(samples: DoubleArray): DoubleArray {
        val n = samples.size
        val difference = DoubleArray(n)

        for (tau in 0 until n) {
            var sum = 0.0
            for (i in 0 until n - tau) {
                val delta = samples[i] - samples[i + tau]
                sum += delta * delta
            }
            difference[tau] = sum
        }

        return difference
    }

    private fun calculateCumulativeMean(difference: DoubleArray): DoubleArray {
        val n = difference.size
        val cumulativeMean = DoubleArray(n)

        var runningSum = 0.0
        for (tau in 1 until n) {
            runningSum += difference[tau]
            cumulativeMean[tau] = runningSum / tau
        }

        return cumulativeMean
    }

    private fun estimateFormants(samples: DoubleArray): DoubleArray {
        // Simplified formant estimation using LPC
        // In a real implementation, this would use proper LPC analysis
        // Placeholder values for demonstration
        return doubleArrayOf(500.0, 1500.0, 2500.0)
    }

    private fun calculateResonanceScore(f0: Double, formants: DoubleArray): Double {
        // Higher formant ratios indicate better resonance
        val f1F2Ratio = if (formants[1] > 0) formants[0] / formants[1] else 0.0

        // Ideal resonance has F1 around 500-600 Hz and F1/F2 ratio around 0.3-0.4
        val f1Score = when {
            formants[0] in 450.0..650.0 -> 1.0
            formants[0] in 400.0..700.0 -> 0.8
            else -> 0.5
        }

        val ratioScore = when {
            f1F2Ratio in 0.3..0.4 -> 1.0
            f1F2Ratio in 0.25..0.45 -> 0.8
            else -> 0.5
        }

        return (f1Score + ratioScore) / 2.0
    }
}

data class VoiceMetrics(
    val fundamentalFrequency: Double,
    val formantF1: Double,
    val formantF2: Double,
    val resonanceScore: Double,
    val targetFrequency: Double
)
