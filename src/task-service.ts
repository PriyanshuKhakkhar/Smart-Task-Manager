import { type ITask, type ISubTask, Task, ImportantTask, type TaskConstructor } from "./task-model.js";

const TaskFactory = Task as unknown as TaskConstructor;
const ImportantTaskFactory = ImportantTask as unknown as TaskConstructor;

export let tasks: ITask[] = [];
export let taskIdCounter = 1;

export function setTasks(newTasks: ITask[]): void {
    tasks = newTasks;
}

export function setTaskIdCounter(maxId: number): void {
    taskIdCounter = maxId + 1;
}

export function generateId(): number {
    return taskIdCounter++;
}

export function addTask(title: string, description: string, priority: string, createdAt: string, isCompleted: boolean): void {
    const id = generateId();
    let newTask: ITask;
    if (priority === "High") {
        newTask = new ImportantTaskFactory(id, title, description, priority, createdAt, isCompleted);
    } else {
        newTask = new TaskFactory(id, title, description, priority, createdAt, isCompleted);
    }
    tasks.push(newTask);
}

// Recursive helper to find any node by ID
export function findNodeById(nodes: (ITask | ISubTask)[], id: number): ITask | ISubTask | undefined {
    for (const node of nodes) {
        if (node.id === id) return node;
        if (node.subtasks && node.subtasks.length > 0) {
            const found = findNodeById(node.subtasks, id);
            if (found) return found;
        }
    }
    return undefined;
}

export function getTaskById(id: number): ITask | ISubTask | undefined {
    return findNodeById(tasks, id);
}

// Recursive insert subtask
export function addSubtask(parentId: number, title: string, description: string, priority: string, isCompleted: boolean, createdAt: string): void {
    const parentNode = findNodeById(tasks, parentId);
    if (parentNode) {
        if (!parentNode.subtasks) parentNode.subtasks = [];
        parentNode.subtasks.push({
            id: Date.now(),
            title,
            description,
            priority,
            isCompleted,
            createdAt,
            subtasks: []
        });
    }
}

// Recursive helper to delete any node by ID
export function deleteNodeById(nodes: (ITask | ISubTask)[], id: number): boolean {
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node && node.id === id) {
            nodes.splice(i, 1);
            return true;
        }
        if (node && node.subtasks && node.subtasks.length > 0) {
            if (deleteNodeById(node.subtasks, id)) return true;
        }
    }
    return false;
}

export function removeTaskById(id: number): boolean {
    return deleteNodeById(tasks, id);
}

// Toggle completed recursively
export function toggleTaskCompletion(id: number, isCompleted: boolean): void {
    const node = findNodeById(tasks, id);
    if (node) {
        node.isCompleted = isCompleted;
    }
}

export function searchTasks(searchText: string): ITask[] {
    const text = searchText.toLowerCase();
    return tasks.filter(task => task.title.toLowerCase().includes(text));
}
