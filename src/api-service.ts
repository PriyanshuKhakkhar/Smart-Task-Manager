import { type ITask, Task, ImportantTask, type TaskConstructor } from "./task-model.js";
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

export function fetchTasksFromAPI(): Promise<ITask[]> {
    return fetch("https://dummyjson.com/todos?limit=5")
    .then((response) => {
        if(!response.ok) {
            throw new Error("Failed to fetch tasks from API");
        }
        return response.json();
    })
    .then((data: unknown) => {
        const apiData = data as IApiResponse;
        return new Promise<ITask[]>((resolve) => {
            setTimeout(() => {
                resolve(apiData.todos.map(mapApiTaskToAppTask));
            }, 2000);
        });
    });
}
