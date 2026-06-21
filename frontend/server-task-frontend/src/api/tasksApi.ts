import axios from "axios";
import { CreateTaskInput, Task, UpdateTaskInput, UploadUrlResponse } from "../types/Task";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get<Task[]>("/tasks");
  return response.data;
};

export const getTask = async (taskId: string): Promise<Task> => {
  const response = await api.get<Task>(`/tasks/${taskId}`);
  return response.data;
};

export const createTask = async (task: CreateTaskInput): Promise<Task> => {
  const response = await api.post<Task>("/tasks", task);
  return response.data;
};

export const updateTask = async (
  taskId: string,
  task: UpdateTaskInput
): Promise<Task> => {
  const response = await api.put<Task>(`/tasks/${taskId}`, task);
  return response.data;
};

export const deleteTask = async (taskId: string): Promise<void> => {
  await api.delete(`/tasks/${taskId}`);
};

export const getUploadUrl = async (
  taskId: string,
  fileName: string,
  contentType: string
): Promise<UploadUrlResponse> => {
  const response = await api.post<UploadUrlResponse>(`/tasks/${taskId}/upload-url`, {
    fileName,
    contentType,
  });

  return response.data;
};

export const uploadImageToS3 = async (
  uploadUrl: string,
  file: File
): Promise<void> => {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Image upload failed with status ${response.status}`);
  }
};

export const processImage = async (taskId: string): Promise<Task> => {
  const response = await api.post(`/tasks/${taskId}/process-image`);
  return response.data.task;
};