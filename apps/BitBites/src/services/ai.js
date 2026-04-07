import { GoogleGenerativeAI } from '@google/generative-ai'
import { compressImageSimple } from '../utils/imageCompression.js'
import { isCurrentlyBonusTime } from './supabase.js'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

/**
 * Analyzes a meal photo to identify content.
 * @param {File} imageFile - The image file to analyze.
 * @returns {Promise<string>} - The analysis text.
 */
export async function analyzeMeal(imageFile) {
    try {
        const imageData = await fileToGenerativePart(imageFile)
        const prompt = "Analyze this meal. Describe what you see in a short, fun, 8-bit style description. Keep it under 50 words."

        const result = await model.generateContent([prompt, imageData])
        return result.response.text()
    } catch (error) {
        console.error("Error analyzing meal:", error)
        throw error
    }
}

/**
 * Compares before and after photos to calculate a RAW score.
 *
 * 3NF VERSION: Returns rawScore (0-100) and foodType only.
 * Database applies multipliers via views:
 * - food_types.score_multiplier (instant noodles ÷ 2)
 * - food_types.max_score_cap (snacks max 70)
 * - bonus_windows.multiplier (1.5x during bonus)
 *
 * @param {File} beforeImage - The full meal image.
 * @param {File} afterImage - The empty plate image.
 * @returns {Promise<{rawScore: number, foodType: string, commentary: string, isBonusTime: boolean}>}
 */
export async function calculateMealScore(beforeImage, afterImage) {
    try {
        const beforeData = await fileToGenerativePart(beforeImage)
        const afterData = await fileToGenerativePart(afterImage)

        const prompt = `
      Compare these two images:
      Image 1: The meal BEFORE eating.
      Image 2: The meal AFTER eating.

      Task:
      1. VERIFY: Are these images of the SAME meal? (Check if the food type, plate, and setting match)
         - If they are COMPLETELY DIFFERENT foods (e.g., salmon vs noodles), give a score of 0 and say "Nice try! These aren't the same meal 😏"

      2. IDENTIFY the food type:
         - main_course: Rice dishes, pasta (not instant), steak, chicken, fish, curry, stir-fry, etc.
         - instant_noodles: Cup noodles, ramen packets, instant noodles (any brand)
         - snack: Snacks, desserts, drinks, appetizers, fruits, small bites, chips, candy

      3. If they ARE the same meal, estimate what percentage of the food was consumed.

      4. Award a Score from 0 to 100 based on consumption percentage ONLY:
         - 90-100: Plate is clean or nearly clean (great job!)
         - 70-89: Most of the food is gone
         - 50-69: About half eaten
         - 30-49: Only a few bites taken
         - 0-29: Barely touched

         IMPORTANT: Do NOT apply food type penalties or bonus multipliers.
         Return the RAW consumption percentage (0-100).
         The database will handle instant noodle penalties, snack caps, and bonus multipliers.

      5. Write a witty, romantic, retro-gaming style commentary (max 2 sentences).
         - For instant noodles, mention it's a "quick power-up"
         - For snacks, be playfully harsh: "Go eat real food!" "This gives you no XP!"

      Return JSON format: { "rawScore": NUMBER, "commentary": "STRING", "foodType": "main_course|instant_noodles|snack" }
    `

        const result = await model.generateContent([prompt, beforeData, afterData])
        const responseText = result.response.text()

        // Clean up markdown code blocks if present to parse JSON
        const jsonStr = responseText.replace(/```json|```/g, '').trim()
        const parsedResult = JSON.parse(jsonStr)

        // Ensure rawScore is valid 0-100
        let rawScore = Math.max(0, Math.min(100, Math.round(parsedResult.rawScore || parsedResult.score || 0)))

        // Check bonus time (for UI display only - database handles actual multiplier)
        const { isBonus, window } = await isCurrentlyBonusTime()

        return {
            rawScore: rawScore,
            foodType: parsedResult.foodType || 'other',
            commentary: parsedResult.commentary || 'Good meal!',
            isBonusTime: isBonus,
            bonusWindow: window
        }

    } catch (error) {
        console.error("Error scoring meal:", error)
        throw error
    }
}

// Helper to convert File to Base64 for Gemini
async function fileToGenerativePart(file) {
    // Compress image before AI analysis to reduce payload size
    const compressedBlob = await compressImageSimple(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        initialQuality: 0.8,
        targetSize: 1024 * 1024 // 1MB target
    });

    // Convert compressed blob to base64
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Data = reader.result.split(',')[1];
            resolve({
                inlineData: {
                    data: base64Data,
                    mimeType: 'image/jpeg'
                }
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(compressedBlob);
    });
}
