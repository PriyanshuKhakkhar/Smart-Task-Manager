import { type ITask, Task, ImportantTask, type TaskConstructor } from "../models/task-model.js";
import { generateId } from "./task-service.js";

export interface IApiTodo {
    id: number;
    todo: string;
    completed: boolean;
    userId: number;
}

export interface IApiResponse {
    todos: IApiTodo[];
    total: number;
    skip: number;
    limit: number;
}

const TaskFactory = Task as unknown as TaskConstructor;
const ImportantTaskFactory = ImportantTask as unknown as TaskConstructor;

export function mapApiTaskToAppTask(apiTask: IApiTodo): ITask {
    const priorityOptions = ["Low", "Medium", "High"];
    const randomPriority = priorityOptions[Math.floor(Math.random() * priorityOptions.length)] || "Low";
    const createdAt = new Date().toLocaleString();

    if(randomPriority === "High") {
        return new ImportantTaskFactory(
            generateId(),
            apiTask.todo,
            "Fetched from API",
            randomPriority,
            createdAt,
            apiTask.completed
        );
    }
    return new TaskFactory(
        generateId(),
        apiTask.todo,
        "Fetched from API",
        randomPriority,
        createdAt,
        apiTask.completed
    )
}

// Replace Promise chains with try/catch and async/await
export async function fetchTasksFromAPI(): Promise<ITask[]> {
    try {
        const response = await fetch("https://dummyjson.com/todos?limit=5");
        
        if (!response.ok) {
            throw new Error("Failed to fetch tasks from API");
        }
        
        // Wait for JSON parsing using await and strictly type response data
        const apiData: IApiResponse = await response.json();
        
        // Maintain existing 2-second timeout for loading simulation
        return await new Promise<ITask[]>((resolve) => {
            setTimeout(() => {
                resolve(apiData.todos.map(mapApiTaskToAppTask));
            }, 2000);
        });
    } catch (error) {
        // Forward error cleanly when there is a network/fetch issue
        console.error("Error fetching tasks:", error);
        throw error;
    }
}
