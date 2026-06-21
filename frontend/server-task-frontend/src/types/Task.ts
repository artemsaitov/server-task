export interface Task {
  userId: string;
  taskId: string;
  title: string;
  description: string;
  dueDate: string;
  status: "OPEN" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  imageKey: string;
  imageLabels: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate?: string;
  status?: "OPEN" | "IN_PROGRESS" | "COMPLETED";
  priority?: "LOW" | "MEDIUM" | "HIGH";
}

export interface UpdateTaskInput {
  title: string;
  description?: string;
  dueDate?: string;
  status?: "OPEN" | "IN_PROGRESS" | "COMPLETED";
  priority?: "LOW" | "MEDIUM" | "HIGH";
}

export interface UploadUrlResponse {
  uploadUrl: string;
  imageKey: string;
  expiresIn: number;
}