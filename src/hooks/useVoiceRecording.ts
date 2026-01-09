/**
 * Voice Recording Hook
 * 
 * Provides voice recording functionality with Web Speech API and fallback
 */

import { useState, useRef, useCallback } from 'react';
import { speechToText } from '@/lib/ai';

// =============================================================================
// TYPES
// =============================================================================

interface UseVoiceRecordingOptions {
    onTranscript?: (text: string) => void;
    onError?: (error: string) => void;
    language?: string;
}

interface VoiceRecordingState {
    isRecording: boolean;
    transcript: string;
    error: string | null;
    isProcessing: boolean;
}

// =============================================================================
// HOOK
// =============================================================================

export function useVoiceRecording({
    onTranscript,
    onError,
    language = 'en-US',
}: UseVoiceRecordingOptions = {}) {
    const [state, setState] = useState<VoiceRecordingState>({
        isRecording: false,
        transcript: '',
        error: null,
        isProcessing: false,
    });

    const recognitionRef = useRef<any>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Check if Web Speech API is available
    const isWebSpeechAvailable = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

    /**
     * Start recording using Web Speech API (Chrome, Edge, Safari)
     */
    const startWebSpeech = useCallback(() => {
        try {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;

            if (!SpeechRecognition) {
                throw new Error('Web Speech API not supported');
            }

            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = language;

            recognition.onstart = () => {
                setState(prev => ({
                    ...prev,
                    isRecording: true,
                    error: null,
                    transcript: '',
                }));
            };

            recognition.onresult = (event: any) => {
                const transcript = Array.from(event.results)
                    .map((result: any) => result[0].transcript)
                    .join('');

                setState(prev => ({ ...prev, transcript }));
            };

            recognition.onend = () => {
                const finalTranscript = state.transcript;

                setState(prev => ({ ...prev, isRecording: false }));

                if (finalTranscript) {
                    onTranscript?.(finalTranscript);
                }
            };

            recognition.onerror = (event: any) => {
                const errorMessage = event.error === 'no-speech'
                    ? 'No speech detected. Please try again.'
                    : `Speech recognition error: ${event.error}`;

                setState(prev => ({
                    ...prev,
                    isRecording: false,
                    error: errorMessage,
                }));

                onError?.(errorMessage);
            };

            recognitionRef.current = recognition;
            recognition.start();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to start voice recording';
            setState(prev => ({ ...prev, error: message }));
            onError?.(message);
        }
    }, [language, onTranscript, onError, state.transcript]);

    /**
     * Start recording using MediaRecorder API (fallback)
     */
    const startMediaRecorder = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mediaRecorder = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

                setState(prev => ({ ...prev, isProcessing: true }));

                // Send to Hugging Face STT
                const result = await speechToText(audioBlob);

                setState(prev => ({ ...prev, isProcessing: false, isRecording: false }));

                if (result.success && result.data) {
                    setState(prev => ({ ...prev, transcript: result.data! }));
                    onTranscript?.(result.data);
                } else {
                    const message = result.error || 'Speech recognition failed';
                    setState(prev => ({ ...prev, error: message }));
                    onError?.(message);
                }

                // Clean up
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.onerror = () => {
                const message = 'Recording failed';
                setState(prev => ({ ...prev, isRecording: false, error: message }));
                onError?.(message);
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();

            setState(prev => ({
                ...prev,
                isRecording: true,
                error: null,
                transcript: '',
            }));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Microphone access denied';
            setState(prev => ({ ...prev, error: message }));
            onError?.(message);
        }
    }, [onTranscript, onError]);

    /**
     * Start voice recording (automatically chooses best method)
     */
    const startRecording = useCallback(async () => {
        if (state.isRecording) return;

        // Prefer Web Speech API for better UX (real-time transcription)
        if (isWebSpeechAvailable) {
            startWebSpeech();
        } else {
            // Fallback to MediaRecorder + Hugging Face STT
            await startMediaRecorder();
        }
    }, [isWebSpeechAvailable, startWebSpeech, startMediaRecorder, state.isRecording]);

    /**
     * Stop voice recording
     */
    const stopRecording = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }

        setState(prev => ({ ...prev, isRecording: false }));
    }, []);

    /**
     * Toggle recording
     */
    const toggleRecording = useCallback(() => {
        if (state.isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }, [state.isRecording, startRecording, stopRecording]);

    /**
     * Clear transcript and error
     */
    const reset = useCallback(() => {
        setState({
            isRecording: false,
            transcript: '',
            error: null,
            isProcessing: false,
        });
    }, []);

    return {
        ...state,
        startRecording,
        stopRecording,
        toggleRecording,
        reset,
        isSupported: isWebSpeechAvailable || ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices),
    };
}
