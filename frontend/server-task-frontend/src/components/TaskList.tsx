import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import {
  deleteTask,
  getUploadUrl,
  processImage,
  updateTask,
  uploadImageToS3,
} from "../api/tasksApi";
import { Task } from "../types/Task";

interface TaskListProps {
  tasks: Task[];
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (taskId: string) => void;
}

export default function TaskList({
  tasks,
  onTaskUpdated,
  onTaskDeleted,
}: TaskListProps) {
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>(
    {}
  );
  const [uploadingTaskId, setUploadingTaskId] = useState<string | null>(null);

  const handleStatusChange = async (
    task: Task,
    status: "OPEN" | "IN_PROGRESS" | "COMPLETED"
  ) => {
    try {
      const updatedTask = await updateTask(task.taskId, {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        status,
      });

      onTaskUpdated(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task");
    }
  };

  const handleDelete = async (taskId: string) => {
    const confirmed = window.confirm("Delete this task?");
    if (!confirmed) return;

    try {
      await deleteTask(taskId);
      onTaskDeleted(taskId);
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task");
    }
  };

  const handleFileChange = (taskId: string, file: File | null) => {
    setSelectedFiles((currentFiles) => ({
      ...currentFiles,
      [taskId]: file,
    }));
  };

  const handleUploadAndAnalyze = async (task: Task) => {
    const file = selectedFiles[task.taskId];

    if (!file) {
      alert("Please choose an image first");
      return;
    }

    try {
      setUploadingTaskId(task.taskId);

      const uploadUrlResponse = await getUploadUrl(
        task.taskId,
        file.name,
        file.type
      );

      await uploadImageToS3(uploadUrlResponse.uploadUrl, file);

      const updatedTask = await processImage(task.taskId);

      onTaskUpdated(updatedTask);

      alert("Image uploaded and analyzed successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload and analyze image");
    } finally {
      setUploadingTaskId(null);
    }
  };

  if (tasks.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary">
        No tasks yet. Create your first task above.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {tasks.map((task) => (
        <Card key={task.taskId}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Box>
                <Typography variant="h6">{task.title}</Typography>

                <Typography variant="body2" color="text.secondary">
                  {task.description || "No description"}
                </Typography>

                <Typography variant="body2" sx={{ mt: 1 }}>
                  Due date: {task.dueDate || "No due date"}
                </Typography>

                <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                  <Chip label={task.status} size="small" />
                  <Chip label={task.priority} size="small" />
                </Box>

                {task.imageLabels.length > 0 && (
                  <Box
                    sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}
                  >
                    {task.imageLabels.map((label) => (
                      <Chip
                        key={label}
                        label={label}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}

                <Box sx={{ mt: 2 }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      handleFileChange(
                        task.taskId,
                        event.target.files ? event.target.files[0] : null
                      )
                    }
                  />

                  <Button
                    variant="contained"
                    size="small"
                    sx={{ mt: 1, display: "block" }}
                    onClick={() => handleUploadAndAnalyze(task)}
                    disabled={uploadingTaskId === task.taskId}
                  >
                    {uploadingTaskId === task.taskId
                      ? "Uploading..."
                      : "Upload & Analyze Image"}
                  </Button>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  minWidth: 160,
                }}
              >
                <TextField
                  select
                  label="Status"
                  value={task.status}
                  size="small"
                  onChange={(event) =>
                    handleStatusChange(
                      task,
                      event.target.value as
                        | "OPEN"
                        | "IN_PROGRESS"
                        | "COMPLETED"
                    )
                  }
                >
                  <MenuItem value="OPEN">Open</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                </TextField>

                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleDelete(task.taskId)}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}