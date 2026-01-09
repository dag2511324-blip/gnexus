/**
 * Image Generation Types
 * Type definitions for the Pollinations AI image generation
 */

export type ImageModel = 'flux' | 'flux-realism' | 'flux-anime' | 'flux-3d' | 'turbo';

export interface ImageGenerationOptions {
    width?: number;
    height?: number;
    seed?: number;
    model?: ImageModel;
    nologo?: boolean;
    enhance?: boolean;
}

export interface GeneratedImage {
    url: string;
    prompt: string;
    options: ImageGenerationOptions;
    timestamp: Date;
    id: string;
}

export interface ImageGenerationError {
    message: string;
    code?: string;
}
