/**
 * Pollinations AI API Integration
 * Free, unlimited image generation using Flux and Stable Diffusion
 * API Docs: https://pollinations.ai/
 */

import type { ImageGenerationOptions, GeneratedImage, ImageModel } from '@/types/image';

const POLLINATIONS_BASE_URL = 'https://image.pollinations.ai/prompt';

/**
 * Available models with descriptions
 */
export const IMAGE_MODELS: Record<ImageModel, { name: string; description: string }> = {
    'flux': {
        name: 'Flux',
        description: 'Fast, high-quality general purpose model'
    },
    'flux-realism': {
        name: 'Flux Realism',
        description: 'Photorealistic images with enhanced detail'
    },
    'flux-anime': {
        name: 'Flux Anime',
        description: 'Anime and manga style illustrations'
    },
    'flux-3d': {
        name: 'Flux 3D',
        description: '3D rendered style images'
    },
    'turbo': {
        name: 'Turbo',
        description: 'Fastest generation, good quality'
    }
};

/**
 * Generate an image using Pollinations AI
 * @param prompt - Text description of the image to generate
 * @param options - Optional generation parameters
 * @returns GeneratedImage object with URL and metadata
 */
export async function generateImage(
    prompt: string,
    options: ImageGenerationOptions = {}
): Promise<GeneratedImage> {
    if (!prompt || prompt.trim().length === 0) {
        throw new Error('Prompt cannot be empty');
    }

    const {
        width = 1024,
        height = 1024,
        seed,
        model = 'flux',
        nologo = true,
        enhance = true
    } = options;

    // Build URL with parameters
    const encodedPrompt = encodeURIComponent(prompt.trim());
    const params = new URLSearchParams({
        width: width.toString(),
        height: height.toString(),
        model,
        nologo: nologo.toString(),
        enhance: enhance.toString(),
    });

    // Add seed if provided
    if (seed !== undefined) {
        params.append('seed', seed.toString());
    }

    const imageUrl = `${POLLINATIONS_BASE_URL}/${encodedPrompt}?${params.toString()}`;

    // Verify the image loads (optional check)
    try {
        const response = await fetch(imageUrl, { method: 'HEAD' });
        if (!response.ok) {
            throw new Error('Failed to generate image');
        }
    } catch (error) {
        console.error('Image generation error:', error);
        throw new Error('Failed to generate image. Please try again.');
    }

    // Return generated image metadata
    const generatedImage: GeneratedImage = {
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url: imageUrl,
        prompt,
        options: { width, height, seed, model, nologo, enhance },
        timestamp: new Date()
    };

    return generatedImage;
}

/**
 * Get a direct image URL without making a request
 * Useful for immediate rendering while the image loads
 */
export function getImageUrl(prompt: string, options: ImageGenerationOptions = {}): string {
    const {
        width = 1024,
        height = 1024,
        seed,
        model = 'flux',
        nologo = true,
        enhance = true
    } = options;

    const encodedPrompt = encodeURIComponent(prompt.trim());
    const params = new URLSearchParams({
        width: width.toString(),
        height: height.toString(),
        model,
        nologo: nologo.toString(),
        enhance: enhance.toString(),
    });

    if (seed !== undefined) {
        params.append('seed', seed.toString());
    }

    return `${POLLINATIONS_BASE_URL}/${encodedPrompt}?${params.toString()}`;
}

/**
 * Download generated image
 */
export async function downloadImage(imageUrl: string, filename: string): Promise<void> {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Download error:', error);
        throw new Error('Failed to download image');
    }
}
