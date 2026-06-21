import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { createTask } from "../api/tasksApi";
import { Task } from "../types/Task";

interface CreateTaskProps {
  onTaskCreated: (task: Task) => void;
}

export default function CreateTask({ onTaskCreated }: CreateTaskProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [loading, setLoading] = useState(false);

  const handleCreateTask = async () => {
    if (!title.trim()) {
      alert("Task title is required");
      return;
    }

    try {
      setLoading(true);

      const newTask = await createTask({
        title,
        description,
        dueDate,
        status: "OPEN",
        priority,
      });

      onTaskCreated(newTask);

      setTitle("");
      setDescription("");
      setDueDate("");
      setPriority("MEDIUM");
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Create New Task
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Task title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            fullWidth
          />

          <TextField
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            fullWidth
            multiline
            rows={3}
          />

          <TextField
            label="Due date"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            select
            label="Priority"
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as "LOW" | "MEDIUM" | "HIGH")
            }
          >
            <MenuItem value="LOW">Low</MenuItem>
            <MenuItem value="MEDIUM">Medium</MenuItem>
            <MenuItem value="HIGH">High</MenuItem>
          </TextField>

          <Button
            variant="contained"
            onClick={handleCreateTask}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Task"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}