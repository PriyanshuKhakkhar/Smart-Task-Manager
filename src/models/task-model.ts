export interface ISubTask {
    id: number;
    title: string;
    description: string;
    priority: string;
    isCompleted: boolean;
    createdAt: string;
    subtasks: ISubTask[];
}

export interface ITask {
    id: number;
    title: string;
    description: string;
    priority: string;
    createdAt: string;
    isCompleted: boolean;
    subtasks: ISubTask[];
}

export interface IImportantTask extends ITask {
    important: boolean;
}

export interface TaskConstructor {
    new(id: number, title: string, description: string, priority: string, createdAt: string, isCompleted?: boolean, subtasks?: ISubTask[]): ITask;
}

export function Task(
    this: ITask,
    id: number,
    title: string,
    description: string,
    priority: string,
    createdAt: string,
    isCompleted: boolean = false,
    subtasks: ISubTask[] = []
) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.priority = priority;
    this.createdAt = createdAt;
    this.isCompleted = isCompleted;
    this.subtasks = subtasks;
}

export function ImportantTask(
    this: IImportantTask,
    id: number,
    title: string,
    description: string,
    priority: string,
    createdAt: string,
    isCompleted: boolean = false,
    subtasks: ISubTask[] = []
) {
    Task.call(this, id, title, description, priority, createdAt, isCompleted, subtasks);
    this.important = true;
}

ImportantTask.prototype = Object.create(Task.prototype);
ImportantTask.prototype.constructor = ImportantTask;
