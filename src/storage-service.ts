import { type ITask, type ISubTask, Task, ImportantTask, type TaskConstructor } from "./task-model.js";
import { generateId, tasks, setTasks, setTaskIdCounter } from "./task-service.js";

const TaskFactory = Task as unknown as TaskConstructor;
const ImportantTaskFactory = ImportantTask as unknown as TaskConstructor;

export function instantiateTask(taskData: Partial<ITask> & { important?: boolean }): ITask {
    const id = taskData.id || generateId();
    const title = taskData.title || "";
    const desc = taskData.description || "";
    const prio = taskData.priority || "Low";
    const created = taskData.createdAt || new Date().toLocaleString();
    const comp = taskData.isCompleted || false;
    const subs = taskData.subtasks || [];

    if (prio === "High" || taskData.important) {
        return new ImportantTaskFactory(id, title, desc, prio, created, comp, subs);
    } else {
        return new TaskFactory(id, title, desc, prio, created, comp, subs);
    }
}

export function loadTasks(): void {
    try {
        const storedTasks = localStorage.getItem("tasks");
        if (storedTasks) {
            const parsedTasks = JSON.parse(storedTasks);
            const instantiated = parsedTasks.map((t: Partial<ITask> & { important?: boolean }) => instantiateTask(t));

            setTasks(instantiated);

            let maxId = 0;
            instantiated.forEach((task: ITask) => {
                if (task.id > maxId) maxId = task.id;
            });
            setTaskIdCounter(maxId);
        }
    } catch (error) {
        console.error("Error loading tasks from localStorage:", error);
        setTasks([]);
        setTaskIdCounter(0);
    }
}

export function saveTasks(): void {
    try {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    } catch (error) {
        console.error("Error saving tasks to localStorage:", error);
    }
}
