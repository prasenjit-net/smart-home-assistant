import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

interface ConversationSession {
    id: string;
    messages: OpenAI.Chat.ChatCompletionMessageParam[];
    createdAt: Date;
    lastAccessedAt: Date;
}

@Injectable()
export class SessionService {
    private sessions: Map<string, ConversationSession> = new Map();
    private readonly MAX_MESSAGES = 20; // Keep last 20 messages to control token usage
    private readonly SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

    constructor() {
        // Clean up expired sessions every 5 minutes
        setInterval(() => this.cleanupExpiredSessions(), 5 * 60 * 1000);
    }

    /**
     * Generate a new unique session ID
     */
    generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Create a new session with system prompt
     */
    createSession(systemPrompt: string): string {
        const sessionId = this.generateSessionId();
        const session: ConversationSession = {
            id: sessionId,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
            ],
            createdAt: new Date(),
            lastAccessedAt: new Date(),
        };

        this.sessions.set(sessionId, session);
        console.log(`Created new session: ${sessionId}`);
        return sessionId;
    }

    /**
     * Get or create a session
     */
    getOrCreateSession(sessionId: string | undefined, systemPrompt: string): string {
        if (!sessionId || !this.sessions.has(sessionId)) {
            return this.createSession(systemPrompt);
        }

        // Update last accessed time
        const session = this.sessions.get(sessionId)!;
        session.lastAccessedAt = new Date();
        return sessionId;
    }

    /**
     * Get conversation history for a session
     */
    getMessages(sessionId: string): OpenAI.Chat.ChatCompletionMessageParam[] {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return [];
        }

        session.lastAccessedAt = new Date();
        return [...session.messages]; // Return a copy
    }

    /**
     * Add a message to the session
     */
    addMessage(
        sessionId: string,
        message: OpenAI.Chat.ChatCompletionMessageParam,
    ): void {
        const session = this.sessions.get(sessionId);
        if (!session) {
            console.warn(`Session not found: ${sessionId}`);
            return;
        }

        session.messages.push(message);
        session.lastAccessedAt = new Date();

        // Trim messages if exceeding limit (keep system message + last N messages)
        if (session.messages.length > this.MAX_MESSAGES + 1) {
            const systemMessage = session.messages[0];
            const recentMessages = session.messages.slice(-(this.MAX_MESSAGES));
            session.messages = [systemMessage, ...recentMessages];
            console.log(`Trimmed session ${sessionId} to ${session.messages.length} messages`);
        }
    }

    /**
     * Set all messages for a session (used after OpenAI responses)
     */
    setMessages(
        sessionId: string,
        messages: OpenAI.Chat.ChatCompletionMessageParam[],
    ): void {
        const session = this.sessions.get(sessionId);
        if (!session) {
            console.warn(`Session not found: ${sessionId}`);
            return;
        }

        session.messages = messages;
        session.lastAccessedAt = new Date();

        // Trim messages if exceeding limit
        if (session.messages.length > this.MAX_MESSAGES + 1) {
            const systemMessage = session.messages[0];
            const recentMessages = session.messages.slice(-(this.MAX_MESSAGES));
            session.messages = [systemMessage, ...recentMessages];
        }
    }

    /**
     * Clear a session's conversation history (keep system prompt)
     */
    resetSession(sessionId: string): boolean {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return false;
        }

        // Keep only the system message
        const systemMessage = session.messages[0];
        session.messages = [systemMessage];
        session.lastAccessedAt = new Date();
        console.log(`Reset session: ${sessionId}`);
        return true;
    }

    /**
     * Delete a session completely
     */
    deleteSession(sessionId: string): boolean {
        const deleted = this.sessions.delete(sessionId);
        if (deleted) {
            console.log(`Deleted session: ${sessionId}`);
        }
        return deleted;
    }

    /**
     * Get all active sessions
     */
    getActiveSessions(): string[] {
        return Array.from(this.sessions.keys());
    }

    /**
     * Get session info
     */
    getSessionInfo(sessionId: string): {
        id: string;
        messageCount: number;
        createdAt: Date;
        lastAccessedAt: Date;
    } | null {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return null;
        }

        return {
            id: session.id,
            messageCount: session.messages.length,
            createdAt: session.createdAt,
            lastAccessedAt: session.lastAccessedAt,
        };
    }

    /**
     * Clean up expired sessions
     */
    private cleanupExpiredSessions(): void {
        const now = Date.now();
        let cleanedCount = 0;

        for (const [sessionId, session] of this.sessions.entries()) {
            const timeSinceLastAccess = now - session.lastAccessedAt.getTime();
            if (timeSinceLastAccess > this.SESSION_TIMEOUT_MS) {
                this.sessions.delete(sessionId);
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            console.log(`Cleaned up ${cleanedCount} expired sessions`);
        }
    }

    /**
     * Get total number of sessions
     */
    getSessionCount(): number {
        return this.sessions.size;
    }
}
