import { useEffect, useState } from "react";
import { Container, CssBaseline, Typography } from "@mui/material";
import AppHeader from "./components/AppHeader";
import CreateTask from "./components/CreateTask";
import TaskList from "./components/TaskList";
import { getTasks } from "./api/tasksApi";
import { Task } from "./types/Task";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error("Error loading tasks:", error);
      alert("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleTaskCreated = (task: Task) => {
    setTasks((currentTasks) => [task, ...currentTasks]);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.taskId === updatedTask.taskId ? updatedTask : task
      )
    );
  };

  const handleTaskDeleted = (taskId: string) => {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.taskId !== taskId)
    );
  };

  return (
    <>
      <CssBaseline />
      <AppHeader />

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Task Dashboard
        </Typography>

        <CreateTask onTaskCreated={handleTaskCreated} />

        <Typography variant="h5" gutterBottom>
          Tasks
        </Typography>

        {loading ? (
          <Typography>Loading tasks...</Typography>
        ) : (
          <TaskList
            tasks={tasks}
            onTaskUpdated={handleTaskUpdated}
            onTaskDeleted={handleTaskDeleted}
          />
        )}
      </Container>
    </>
  );
}

export default App;