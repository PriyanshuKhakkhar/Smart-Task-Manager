interface ISubTask {
    id: number;
    title: string;
    description: string;
    priority: string;
    isCompleted: boolean;
    createdAt: string;
    subtasks: ISubTask[];
}

interface ITask {
    id: number;
    title: string;
    description: string;
    priority: string;
    createdAt: string;
    isCompleted: boolean;
    subtasks: ISubTask[];
}

interface IApiTodo {
    id: number;
    todo: string;
    completed: boolean;
    userId: number;
}

interface IApiResponse {
    todos: IApiTodo[];
    total: number;
    skip: number;
    limit: number;
}

const TaskManager = (function() {
    const addBtn = document.getElementById("add-btn") as HTMLButtonElement | null;
    const clearbtn = document.getElementById("clear-btn") as HTMLButtonElement | null;
    const taskTitleInput = document.getElementById("task-title") as HTMLInputElement | null;
    const taskDescInput = document.getElementById("task-desc") as HTMLInputElement | null;
    const taskPriorityInput = document.getElementById("task-priority") as HTMLInputElement | null;
    const taskDateInput = document.getElementById("task-date") as HTMLInputElement | null;
    const taskList = document.getElementById("task-list") as HTMLInputElement | null;
    const searchInput = document.getElementById("search-task") as HTMLInputElement | null;
    
    // Subtask Modal Elements
    const subtaskModal = document.getElementById("subtask-modal");
    const subtaskTitleInput = document.getElementById("subtask-title") as HTMLInputElement | null;
    const subtaskDescInput = document.getElementById("subtask-desc") as HTMLTextAreaElement | null;
    const subtaskPriorityInput = document.getElementById("subtask-priority") as HTMLSelectElement | null;
    const addSubtaskBtn = document.getElementById("add-subtask-btn") as HTMLButtonElement | null;
    const closeSubtaskBtn = document.getElementById("close-subtask-btn") as HTMLButtonElement | null;
    const clearSubtaskBtn = document.getElementById("clear-subtask-btn") as HTMLButtonElement | null;
    const subtaskParentIdInput = document.getElementById("subtask-parent-id") as HTMLInputElement | null;
    const subtaskTitleError = document.getElementById("subtask-title-error");
    const subtaskPriorityError = document.getElementById("subtask-priority-error");
    const subtaskStatusError = document.getElementById("subtask-status-error");

    let tasks: ITask[] = [];
    let taskIdCounter = 1;
    let TASK_API_URL = "https://dummyjson.com/todos?limit=5";

    // 1. Task Constructor
    class Task implements ITask {
        public id: number;
        public title: string;
        public description: string;
        public priority: string;
        public createdAt: string;
        public isCompleted: boolean;
        public subtasks: ISubTask[];

        constructor(
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
    }

    // 2. ImportantTask Constructor (Prototype Inheritance)
    class ImportantTask extends Task {
        public important: boolean;

        constructor(
            id: number,
            title: string,
            description: string,
            priority: string,
            createdAt: string,
            isCompleted: boolean = false,
            subtasks: ISubTask[] = []
        ) {
            super(id, title, description, priority, createdAt, isCompleted, subtasks);
            this.important = true;
        }
    }

    function generateId(): number {
        return taskIdCounter++;
    }

    // Helper to restore loaded objects into true class instances
    function instantiateTask(taskData: Partial<ITask> & { important?: boolean }): ITask {
        const id = taskData.id || generateId();
        const title = taskData.title || "";
        const desc = taskData.description || "";
        const prio = taskData.priority || "Low";
        const created = taskData.createdAt || new Date().toLocaleString();
        const comp = taskData.isCompleted || false;
        const subs = taskData.subtasks || [];

        if (prio === "High" || taskData.important) {
            return new ImportantTask(id, title, desc, prio, created, comp, subs);
        } else {
            return new Task(id, title, desc, prio, created, comp, subs);
        }
    }

    function mapApiTaskToAppTask(apiTask: IApiTodo): ITask {
        const priorityOptions = ["Low", "Medium", "High"];
        const randomPriority = priorityOptions[Math.floor(Math.random() * priorityOptions.length)] || "Low";
        const createdAt = new Date().toLocaleString();

        if(randomPriority === "High") {
            return new ImportantTask(
                generateId(),
                apiTask.todo,
                "Fetched from API",
                randomPriority,
                createdAt,
                apiTask.completed
            );
        }
        return new Task(
            generateId(),
            apiTask.todo,
            "Fetched from API",
            randomPriority,
            createdAt,
            apiTask.completed
        )
    }

    function fetchTasksFromAPI(): Promise<ITask[]> {
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

    function loadTasks() {
        const storedTasks = localStorage.getItem("tasks");
        if (storedTasks) {
            const parsedTasks = JSON.parse(storedTasks);
            tasks = parsedTasks.map(instantiateTask);
            
            let maxId = 0;
            tasks.forEach(task => {
                if (task.id > maxId) maxId = task.id;
            });
            taskIdCounter = maxId + 1;
        }
    }

    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function getTaskStatus(): boolean | null {
        const selectedStatus = document.querySelector('input[name="task-status"]:checked') as HTMLInputElement | null;
        if (!selectedStatus) return null;
        return selectedStatus.value === "true";
    }

    function clearForm() {
        if (taskTitleInput) taskTitleInput.value = "";
        if (taskDescInput) taskDescInput.value = "";
        if (taskPriorityInput) taskPriorityInput.value = "";
        if (taskDateInput) taskDateInput.value = "";
        
        const pendingRadio = document.getElementById("pending") as HTMLInputElement | null;
        const completedRadio = document.getElementById("completed") as HTMLInputElement | null;
        if (pendingRadio) pendingRadio.checked = false;
        if (completedRadio) completedRadio.checked = false;

        const titleError = document.getElementById("title-error");
        const priorityError = document.getElementById("priority-error");
        const statusError = document.getElementById("status-error");
        if (titleError) titleError.classList.add("d-none");
        if (priorityError) priorityError.classList.add("d-none");
        if (statusError) statusError.classList.add("d-none");
    }

    // Recursive helper to find any node by ID
    function findNodeById(nodes: (ITask | ISubTask)[], id: number): ITask | ISubTask | undefined {
        for (const node of nodes) {
            if (node.id === id) return node;
            if (node.subtasks && node.subtasks.length > 0) {
                const found = findNodeById(node.subtasks, id);
                if (found) return found;
            }
        }
        return undefined;
    }

    // Recursive helper to delete any node by ID
    function deleteNodeById(nodes: (ITask | ISubTask)[], id: number): boolean {
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
    
    // Recursive helper to render nested subtasks
    function renderSubtasksHtml(subtasks: ISubTask[], depth: number = 0): string {
        if (!subtasks || subtasks.length === 0) return "";
        let html = `<ul style="list-style-type: none; margin: 0; padding: ${depth === 0 ? '16px 24px' : '0 0 0 24px'};">`;
        subtasks.forEach((st, index) => {
            const isLast = index === subtasks.length - 1;
            const borderStyle = isLast && (!st.subtasks || st.subtasks.length === 0) ? 'border-bottom: none;' : 'border-bottom: 1px solid #eee;';
            html += `
                <li style="display: flex; flex-direction: column; padding: 12px 0; ${borderStyle}">
                    <div style="display: flex; align-items: start; justify-content: space-between; width: 100%;">
                        <label style="display: flex; align-items: start; gap: 12px; cursor: pointer; ${st.isCompleted ? 'text-decoration: line-through; color: #9ca3af;' : 'color: #374151;'}">
                            <input type="checkbox" class="subtask-checkbox" data-id="${st.id}" ${st.isCompleted ? 'checked' : ''} style="margin-top: 2px; width: 16px; height: 16px; accent-color: #6366f1;">
                            <div>
                                <div style="font-weight: 500; font-size: 14px;">${st.title}</div>
                                ${st.description ? `<div style="font-size: 13px; color: #6b7280; margin-top: 4px;">${st.description}</div>` : ''}
                            </div>
                        </label>
                        <div style="display: flex; gap: 16px; align-items: center; font-size: 13px;">
                            <span class="badge priority-${st.priority ? st.priority.toLowerCase() : 'low'}">${st.priority || 'Low'}</span>
                            <span class="badge status-${st.isCompleted ? 'completed' : 'pending'}">${st.isCompleted ? 'Completed' : 'Pending'}</span>
                            <span style="color: #6b7280;">${st.createdAt || ''}</span>
                            <div class="action-buttons d-flex gap-2">
                                <button class="btn btn-subtask btn-add-nested-subtask" data-id="${st.id}" style="padding: 2px 6px; font-size: 12px; border-radius: 4px;">Subtask</button>
                                <button class="btn btn-delete btn-delete-nested-subtask" data-id="${st.id}" style="padding: 2px 6px; font-size: 12px; border-radius: 4px;">Delete</button>
                            </div>
                        </div>
                    </div>
                    ${renderSubtasksHtml(st.subtasks, depth + 1)}
                </li>
            `;
        });
        html += `</ul>`;
        return html;
    }

    function renderTasks(tasksToRender: ITask[] = tasks): void {
        if (!taskList) return;
        taskList.innerHTML = "";

        tasksToRender.forEach(task => {
            const tr = document.createElement("tr");
            tr.className = "task-item";

            const titleStyle = task.isCompleted ? 'text-decoration: line-through; color: #9ca3af;' : 'color: #374151; font-weight: 500;';
            
            tr.innerHTML = `
                <td style="font-weight: 600; color: #4b5563;">#${task.id}</td>
                <td style="${titleStyle}">${task.title}</td>
                <td style="color: #6b7280;">${task.description || '-'}</td>
                <td><span class="badge priority-${task.priority ? task.priority.toLowerCase() : 'low'}">${task.priority || 'Low'}</span></td>
                <td><span class="badge status-${task.isCompleted ? 'completed' : 'pending'}">${task.isCompleted ? "Completed" : "Pending"}</span></td>
                <td style="color: #6b7280;">${task.createdAt || "N/A"}</td>
                <td class="action-buttons">
                    <button class="btn btn-complete">Completed</button>
                    <button class="btn btn-subtask">Subtask</button>
                    <button class="btn btn-delete">Delete</button>
                </td>
            `;

            const deleteBtn = tr.querySelector(".btn-delete");
            if (deleteBtn) {
                deleteBtn.addEventListener("click", (e: Event) => {
                    e.stopPropagation();
                    deleteNodeById(tasks, task.id);
                    saveTasks();
                    renderTasks();
                });
            }

            const completeBtn = tr.querySelector(".btn-complete");
            if (completeBtn) {
                completeBtn.addEventListener("click", (e: Event) => {
                    e.stopPropagation();
                    task.isCompleted = true;
                    saveTasks();
                    renderTasks();
                });
            }
            
            const btnSubtask = tr.querySelector(".btn-subtask");
            if (btnSubtask) {
                btnSubtask.addEventListener("click", (e: Event) => {
                    e.stopPropagation();
                    openSubtaskModal(task.id);
                });
            }

            taskList.appendChild(tr);

            // Render subtasks if any
            if (task.subtasks && task.subtasks.length > 0) {
                const subTr = document.createElement("tr");
                subTr.className = "subtasks-row";
                subTr.innerHTML = `
                    <td colspan="7" style="padding: 0; background: #fafafa; border-bottom: 2px solid #e5e7eb;">
                        ${renderSubtasksHtml(task.subtasks, 0)}
                    </td>
                `;
                
                subTr.querySelectorAll('.subtask-checkbox').forEach(checkbox => {
                    checkbox.addEventListener('change', (e: Event) => {
                        const target = e.target as HTMLInputElement;
                        const stId = parseInt(target.getAttribute('data-id') || "0", 10);
                        const node = findNodeById(tasks, stId);
                        if (node) {
                            node.isCompleted = target.checked;
                            saveTasks();
                            renderTasks();
                        }
                    });
                });

                subTr.querySelectorAll('.btn-add-nested-subtask').forEach(btn => {
                    btn.addEventListener('click', (e: Event) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const target = e.target as HTMLElement;
                        const stId = parseInt(target.getAttribute('data-id') || "0", 10);
                        openSubtaskModal(stId);
                    });
                });

                subTr.querySelectorAll('.btn-delete-nested-subtask').forEach(btn => {
                    btn.addEventListener('click', (e: Event) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const target = e.target as HTMLElement;
                        const stId = parseInt(target.getAttribute('data-id') || "0", 10);
                        deleteNodeById(tasks, stId);
                        saveTasks();
                        renderTasks();
                    });
                });

                taskList.appendChild(subTr);
            }
        });
    }

    function clearSubtaskForm(): void {
        if (subtaskTitleInput) subtaskTitleInput.value = "";
        if (subtaskDescInput) subtaskDescInput.value = "";
        if (subtaskPriorityInput) subtaskPriorityInput.value = "";
        const subtaskPending = document.getElementById("subtask-pending") as HTMLInputElement | null;
        const subtaskCompleted = document.getElementById("subtask-completed") as HTMLInputElement | null;
        if (subtaskPending) subtaskPending.checked = false;
        if (subtaskCompleted) subtaskCompleted.checked = false;
        
        if (subtaskTitleError) subtaskTitleError.classList.add("d-none");
        if (subtaskPriorityError) subtaskPriorityError.classList.add("d-none");
        if (subtaskStatusError) subtaskStatusError.classList.add("d-none");
    }

    function openSubtaskModal(taskId: number): void {
        if (!subtaskModal) return;
        if (subtaskParentIdInput) subtaskParentIdInput.value = taskId.toString();
        clearSubtaskForm();
        subtaskModal.classList.add("active");
    }

    function closeSubtaskModal() {
        if (!subtaskModal) return;
        subtaskModal.classList.remove("active");
    }

    function debounce(fn: () => void, delay: number): () => void {
        let timer: ReturnType<typeof setTimeout>;
        return function () {
            clearTimeout(timer);
            timer = setTimeout(() => {
                fn();
            }, delay);
        };
    }

    function searchTasks(): void {
        if (!searchInput) return;
        const searchText = searchInput.value.toLowerCase();
        const filteredTasks = tasks.filter(task =>
            task.title.toLowerCase().includes(searchText)
        );
        renderTasks(filteredTasks);
    }

    function throttle<T extends (...args: unknown[]) => void>(fn: T, delay: number): (...args: Parameters<T>) => void {
        let lastCall = 0;
        return function(this: unknown, ...args: Parameters<T>) {
            const now = Date.now();
            if(now - lastCall >= delay) {
                lastCall = now;
                fn.apply(this, args);
            }
        }
    }

    function logTaskAction(): void {
        console.log("User interacting with Tasks...");
    }

    const throttleLog = throttle(logTaskAction, 2000);

    if (addBtn) {
        addBtn.addEventListener("click", () => {
            const title = taskTitleInput ? taskTitleInput.value.trim() : "";
            const description = taskDescInput ? taskDescInput.value.trim() : "";
            const priority = taskPriorityInput ? taskPriorityInput.value : "";
            const date = taskDateInput ? taskDateInput.value : "";
            
            let isValid = true;
            const titleError = document.getElementById("title-error");
            const priorityError = document.getElementById("priority-error");
            const statusError = document.getElementById("status-error");

            if (!title) {
                if (titleError) titleError.classList.remove("d-none");
                isValid = false;
            } else {
                if (titleError) titleError.classList.add("d-none");
            }

            if (!priority) {
                if (priorityError) priorityError.classList.remove("d-none");
                isValid = false;
            } else {
                if (priorityError) priorityError.classList.add("d-none");
            }

            const selectedStatus = document.querySelector('input[name="task-status"]:checked') as HTMLInputElement | null;
            if (!selectedStatus) {
                if (statusError) statusError.classList.remove("d-none");
                isValid = false;
            } else {
                if (statusError) statusError.classList.add("d-none");
            }

            if (!isValid) return;

            const status = selectedStatus ? selectedStatus.value === "true" : false;
            const createdAt = date || new Date().toLocaleString();

            let newTask: ITask;
            if (priority === "High") {
                newTask = new ImportantTask(generateId(), title, description, priority, createdAt, status);
            } else {
                newTask = new Task(generateId(), title, description, priority, createdAt, status);
            }

            tasks.push(newTask);
            saveTasks();
            renderTasks();

            clearForm();
        });
    }

    if (taskTitleInput) {
        taskTitleInput.addEventListener("input", () => {
            const titleError = document.getElementById("title-error");
            if (titleError && taskTitleInput.value.trim() !== "") {
                titleError.classList.add("d-none");
            }
        });
    }
    
    if (taskPriorityInput) {
        taskPriorityInput.addEventListener("change", () => {
            const priorityError = document.getElementById("priority-error");
            if (priorityError && taskPriorityInput.value !== "") {
                priorityError.classList.add("d-none");
            }
        });
    }
    
    const radioInputs = document.querySelectorAll<HTMLInputElement>('input[name="task-status"]');
    radioInputs.forEach(radio => {
        radio.addEventListener("change", () => {
            const statusError = document.getElementById("status-error");
            if (statusError) statusError.classList.add("d-none");
        });
    });

    if (closeSubtaskBtn) closeSubtaskBtn.addEventListener("click", closeSubtaskModal);
    if (clearSubtaskBtn) clearSubtaskBtn.addEventListener("click", clearSubtaskForm);
    
    if (addSubtaskBtn) {
        addSubtaskBtn.addEventListener("click", () => {
            const title = subtaskTitleInput ? subtaskTitleInput.value.trim() : "";
            const description = subtaskDescInput ? subtaskDescInput.value.trim() : "";
            const priority = subtaskPriorityInput ? subtaskPriorityInput.value : "";
            const selectedStatus = document.querySelector('input[name="subtask-status"]:checked') as HTMLInputElement | null;
            
            let isValid = true;

            if (!title) {
                if (subtaskTitleError) subtaskTitleError.classList.remove("d-none");
                isValid = false;
            } else {
                if (subtaskTitleError) subtaskTitleError.classList.add("d-none");
            }

            if (!priority) {
                if (subtaskPriorityError) subtaskPriorityError.classList.remove("d-none");
                isValid = false;
            } else {
                if (subtaskPriorityError) subtaskPriorityError.classList.add("d-none");
            }

            if (!selectedStatus) {
                if (subtaskStatusError) subtaskStatusError.classList.remove("d-none");
                isValid = false;
            } else {
                if (subtaskStatusError) subtaskStatusError.classList.add("d-none");
            }

            if (!isValid) return;

            const completed = selectedStatus ? selectedStatus.value === "true" : false;
            const createdAt = new Date().toLocaleString();
            
            const taskIdRaw = subtaskParentIdInput ? subtaskParentIdInput.value : "0";
            const parentId = parseInt(taskIdRaw, 10);
            const parentNode = findNodeById(tasks, parentId);
            
            if (parentNode) {
                if (!parentNode.subtasks) parentNode.subtasks = [];
                parentNode.subtasks.push({
                    id: Date.now(),
                    title,
                    description,
                    priority,
                    isCompleted: completed,
                    createdAt,
                    subtasks: []
                });
                saveTasks();
                renderTasks();
            }
            closeSubtaskModal();
        });
    }

    if (subtaskTitleInput) {
        subtaskTitleInput.addEventListener("input", () => {
            if (subtaskTitleError && subtaskTitleInput.value.trim() !== "") {
                subtaskTitleError.classList.add("d-none");
            }
        });
    }

    if (subtaskPriorityInput) {
        subtaskPriorityInput.addEventListener("change", () => {
            if (subtaskPriorityError && subtaskPriorityInput.value !== "") {
                subtaskPriorityError.classList.add("d-none");
            }
        });
    }

    const subtaskRadioInputs = document.querySelectorAll<HTMLInputElement>('input[name="subtask-status"]');
    subtaskRadioInputs.forEach(radio => {
        radio.addEventListener("change", () => {
            if (subtaskStatusError) subtaskStatusError.classList.add("d-none");
        });
    });

    if (clearbtn) clearbtn.addEventListener("click", clearForm);
    if (searchInput) searchInput.addEventListener("input", debounce(searchTasks, 300));
    if (taskList) {
        taskList.addEventListener("click", () => {
            throttleLog();
        });
    }

    loadTasks();
    renderTasks();

    if(tasks.length === 0) {
        const loadingMessage = document.getElementById("loading-message");
        const errorMessage = document.getElementById("error-message");

        if(errorMessage) errorMessage.classList.add("d-none");
        if (loadingMessage) loadingMessage.classList.remove("d-none");
        
        fetchTasksFromAPI()
            .then((apiTasks) => {
                tasks = apiTasks;
                saveTasks();
                renderTasks();
                if (loadingMessage) loadingMessage.classList.add("d-none");
                if(errorMessage) errorMessage.classList.add("d-none");
            })
            .catch((error) => {
                console.log("API fetch Error:", error instanceof Error ? error.message : String(error));
                if (loadingMessage) loadingMessage.classList.add("d-none");
                if (errorMessage) errorMessage.classList.remove("d-none");
            });
    }

    return {
        getTasks: (): ITask[] => tasks
    };
})();
