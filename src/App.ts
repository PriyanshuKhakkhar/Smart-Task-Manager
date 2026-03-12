import type { ITask } from "./task-model.js";
import { tasks, addTask, addSubtask, searchTasks, setTasks } from "./task-service.js";
import { loadTasks, saveTasks } from "./storage-service.js";
import { fetchTasksFromAPI } from "./api-service.js";
import { renderTasks } from "./ui-render.js";

const addBtn = document.getElementById("add-btn") as HTMLButtonElement | null;
const clearbtn = document.getElementById("clear-btn") as HTMLButtonElement | null;
const taskTitleInput = document.getElementById("task-title") as HTMLInputElement | null;
const taskDescInput = document.getElementById("task-desc") as HTMLInputElement | null;
const taskPriorityInput = document.getElementById("task-priority") as HTMLInputElement | null;
const taskDateInput = document.getElementById("task-date") as HTMLInputElement | null;
const searchInput = document.getElementById("search-task") as HTMLInputElement | null;
const taskList = document.getElementById("task-list") as HTMLInputElement | null;

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

export function openSubtaskModal(taskId: number): void {
    if (!subtaskModal) return;
    if (subtaskParentIdInput) subtaskParentIdInput.value = taskId.toString();
    clearSubtaskForm();
    subtaskModal.classList.add("active");
}

function closeSubtaskModal() {
    if (!subtaskModal) return;
    subtaskModal.classList.remove("active");
}

function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number) {
    let timer: ReturnType<typeof setTimeout>;

    return function(this: unknown, ...args: Parameters<T>) {
        clearTimeout(timer);

        timer = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}

function handleSearchTasks(): void {
    if (!searchInput) return;
    const filteredTasks = searchTasks(searchInput.value);
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

        addTask(title, description, priority, createdAt, status);
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
        
        addSubtask(parentId, title, description, priority, completed, createdAt);
        saveTasks();
        renderTasks();
        
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
if (searchInput) searchInput.addEventListener("input", debounce(handleSearchTasks, 300));

if (taskList) {
    taskList.addEventListener("click", () => {
        throttleLog();
    });
}

// App Initialization
loadTasks();
renderTasks();

if (tasks.length === 0) {
    const loadingMessage = document.getElementById("loading-message");
    const errorMessage = document.getElementById("error-message");

    if (errorMessage) errorMessage.classList.add("d-none");
    if (loadingMessage) loadingMessage.classList.remove("d-none");
    
    fetchTasksFromAPI()
        .then((apiTasks) => {
            setTasks(apiTasks);
            saveTasks();
            renderTasks();
            if (loadingMessage) loadingMessage.classList.add("d-none");
            if (errorMessage) errorMessage.classList.add("d-none");
        })
        .catch((error) => {
            console.log("API fetch Error:", error instanceof Error ? error.message : String(error));
            if (loadingMessage) loadingMessage.classList.add("d-none");
            if (errorMessage) errorMessage.classList.remove("d-none");
        });
}
