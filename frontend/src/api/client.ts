import axios from 'axios';
import type { Session, XDMOutput, ChatResponse, XDMGenerateRequest } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

export const createSession = async (): Promise<Session> => {
  const res = await api.post<Session>('/sessions');
  return res.data;
};

export const sendMessage = async (sessionId: string, message: string): Promise<ChatResponse> => {
  const res = await api.post<ChatResponse>('/chat', { session_id: sessionId, message });
  return res.data;
};

export const getChatHistory = async (sessionId: string) => {
  const res = await api.get(`/chat/${sessionId}/history`);
  return res.data;
};

export const generateXDM = async (sessionId: string): Promise<XDMOutput> => {
  const res = await api.post<XDMOutput>('/xdm/generate', { session_id: sessionId } as XDMGenerateRequest);
  return res.data;
};

export const getXDMOutput = async (sessionId: string): Promise<XDMOutput> => {
  const res = await api.get<XDMOutput>(`/xdm/${sessionId}`);
  return res.data;
};

export const askCopilot = async (sessionId: string, question: string): Promise<{ question: string; answer: string }> => {
  const res = await api.post('/xdm/copilot', { session_id: sessionId, question });
  return res.data;
};
