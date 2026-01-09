import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add request interceptor to attach auth token
        this.client.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Add response interceptor to handle token refresh
        this.client.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                // If 401 and not already retried, try to refresh token
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const refreshToken = localStorage.getItem('refreshToken');
                        if (refreshToken) {
                            const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                                refreshToken,
                            });

                            localStorage.setItem('accessToken', data.accessToken);
                            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

                            return this.client(originalRequest);
                        }
                    } catch (refreshError) {
                        // Refresh failed, logout user
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        window.location.href = '/login';
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    // Auth endpoints
    async register(data: {
        email: string;
        password: string;
        username: string;
        firstName?: string;
        lastName?: string;
    }) {
        const response = await this.client.post('/auth/register', data);
        return response.data;
    }

    async login(email: string, password: string) {
        const response = await this.client.post('/auth/login', { email, password });
        return response.data;
    }

    async logout(refreshToken: string) {
        const response = await this.client.post('/auth/logout', { refreshToken });
        return response.data;
    }

    async getCurrentUser() {
        const response = await this.client.get('/auth/me');
        return response.data;
    }

    async refreshToken(refreshToken: string) {
        const response = await this.client.post('/auth/refresh', { refreshToken });
        return response.data;
    }

    // Conversation endpoints
    async getConversations(params?: {
        page?: number;
        limit?: number;
        archived?: boolean;
        starred?: boolean;
        search?: string;
    }) {
        const response = await this.client.get('/conversations', { params });
        return response.data;
    }

    async getConversation(id: string) {
        const response = await this.client.get(`/conversations/${id}`);
        return response.data;
    }

    async createConversation(data: { title: string; model: string }) {
        const response = await this.client.post('/conversations', data);
        return response.data;
    }

    async updateConversation(
        id: string,
        data: {
            title?: string;
            isStarred?: boolean;
            isArchived?: boolean;
            tags?: string[];
        }
    ) {
        const response = await this.client.patch(`/conversations/${id}`, data);
        return response.data;
    }

    async deleteConversation(id: string) {
        const response = await this.client.delete(`/conversations/${id}`);
        return response.data;
    }

    async sendMessage(conversationId: string, content: string, model?: string) {
        const response = await this.client.post(`/conversations/${conversationId}/messages`, {
            content,
            model,
        });
        return response.data;
    }

    // Stream message (Server-Sent Events)
    async streamMessage(
        conversationId: string,
        content: string,
        onChunk: (chunk: string) => void,
        onComplete: (message: any) => void,
        onError: (error: Error) => void
    ) {
        const token = localStorage.getItem('accessToken');

        const eventSource = new EventSource(
            `${API_BASE_URL}/conversations/${conversationId}/messages/stream`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            } as any
        );

        // Send the message data
        await this.client.post(`${API_BASE_URL}/conversations/${conversationId}/messages/stream`, {
            content,
        });

        eventSource.onmessage = (event) => {
            if (event.data === '[DONE]') {
                eventSource.close();
                return;
            }

            try {
                const data = JSON.parse(event.data);

                if (data.type === 'chunk') {
                    onChunk(data.content);
                } else if (data.type === 'complete') {
                    onComplete(data.message);
                    eventSource.close();
                }
            } catch (error) {
                console.error('Error parsing SSE:', error);
            }
        };

        eventSource.onerror = (error) => {
            eventSource.close();
            onError(new Error('Stream connection failed'));
        };

        return eventSource;
    }
}

export const api = new ApiClient();
export default api;
