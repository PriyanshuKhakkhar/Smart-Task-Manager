import type { ITask } from "./models/task-model.js";
import { tasks, addTask, addSubtask, searchTasks, setTasks } from "./services/task-service.js";
import { loadTasks, saveTasks } from "./services/storage-service.js";
import { fetchTasksFromAPI } from "./services/api-service.js";
import { renderTasks } from "./ui/ui-render.js";
import { DOM } from "./ui/dom-elements.js";

function clearForm() {
    if (DOM.titleInput) DOM.titleInput.value = "";
    if (DOM.descInput) DOM.descInput.value = "";
    if (DOM.priorityInput) DOM.priorityInput.value = "";
    if (DOM.dateInput) DOM.dateInput.value = "";
    
    if (DOM.pendingRadio) DOM.pendingRadio.checked = false;
    if (DOM.completedRadio) DOM.completedRadio.checked = false;

    if (DOM.titleError) DOM.titleError.classList.add("d-none");
    if (DOM.priorityError) DOM.priorityError.classList.add("d-none");
    if (DOM.statusError) DOM.statusError.classList.add("d-none");
}

function clearSubtaskForm(): void {
    if (DOM.subtaskTitleInput) DOM.subtaskTitleInput.value = "";
    if (DOM.subtaskDescInput) DOM.subtaskDescInput.value = "";
    if (DOM.subtaskPriorityInput) DOM.subtaskPriorityInput.value = "";
    if (DOM.subtaskPendingRadio) DOM.subtaskPendingRadio.checked = false;
    if (DOM.subtaskCompletedRadio) DOM.subtaskCompletedRadio.checked = false;
    
    if (DOM.subtaskTitleError) DOM.subtaskTitleError.classList.add("d-none");
    if (DOM.subtaskPriorityError) DOM.subtaskPriorityError.classList.add("d-none");
    if (DOM.subtaskStatusError) DOM.subtaskStatusError.classList.add("d-none");
}

export function openSubtaskModal(taskId: number): void {
    if (!DOM.subtaskModal) return;
    if (DOM.subtaskParentIdInput) DOM.subtaskParentIdInput.value = taskId.toString();
    clearSubtaskForm();
    DOM.subtaskModal.classList.add("active");
}

function closeSubtaskModal() {
    if (!DOM.subtaskModal) return;
    DOM.subtaskModal.classList.remove("active");
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
    if (!DOM.searchInput) return;
    const filteredTasks = searchTasks(DOM.searchInput.value);
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

if (DOM.addBtn) {
    DOM.addBtn.addEventListener("click", () => {
        const title = DOM.titleInput ? DOM.titleInput.value.trim() : "";
        const description = DOM.descInput ? DOM.descInput.value.trim() : "";
        const priority = DOM.priorityInput ? DOM.priorityInput.value : "";
        const date = DOM.dateInput ? DOM.dateInput.value : "";
        
        let isValid = true;

        if (!title) {
            if (DOM.titleError) DOM.titleError.classList.remove("d-none");
            isValid = false;
        } else {
            if (DOM.titleError) DOM.titleError.classList.add("d-none");
        }

        if (!priority) {
            if (DOM.priorityError) DOM.priorityError.classList.remove("d-none");
            isValid = false;
        } else {
            if (DOM.priorityError) DOM.priorityError.classList.add("d-none");
        }

        const selectedStatus = document.querySelector('input[name="task-status"]:checked') as HTMLInputElement | null;
        if (!selectedStatus) {
            if (DOM.statusError) DOM.statusError.classList.remove("d-none");
            isValid = false;
        } else {
            if (DOM.statusError) DOM.statusError.classList.add("d-none");
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

if (DOM.titleInput) {
    DOM.titleInput.addEventListener("input", () => {
        if (DOM.titleError && DOM.titleInput?.value.trim() !== "") {
            DOM.titleError.classList.add("d-none");
        }
    });
}

if (DOM.priorityInput) {
    DOM.priorityInput.addEventListener("change", () => {
        if (DOM.priorityError && DOM.priorityInput?.value !== "") {
            DOM.priorityError.classList.add("d-none");
        }
    });
}

const radioInputs = document.querySelectorAll<HTMLInputElement>('input[name="task-status"]');
radioInputs.forEach(radio => {
    radio.addEventListener("change", () => {
        if (DOM.statusError) DOM.statusError.classList.add("d-none");
    });
});

if (DOM.closeSubtaskBtn) DOM.closeSubtaskBtn.addEventListener("click", closeSubtaskModal);
if (DOM.clearSubtaskBtn) DOM.clearSubtaskBtn.addEventListener("click", clearSubtaskForm);

if (DOM.addSubtaskBtn) {
    DOM.addSubtaskBtn.addEventListener("click", () => {
        const title = DOM.subtaskTitleInput ? DOM.subtaskTitleInput.value.trim() : "";
        const description = DOM.subtaskDescInput ? DOM.subtaskDescInput.value.trim() : "";
        const priority = DOM.subtaskPriorityInput ? DOM.subtaskPriorityInput.value : "";
        const selectedStatus = document.querySelector('input[name="subtask-status"]:checked') as HTMLInputElement | null;
        
        let isValid = true;

        if (!title) {
            if (DOM.subtaskTitleError) DOM.subtaskTitleError.classList.remove("d-none");
            isValid = false;
        } else {
            if (DOM.subtaskTitleError) DOM.subtaskTitleError.classList.add("d-none");
        }

        if (!priority) {
            if (DOM.subtaskPriorityError) DOM.subtaskPriorityError.classList.remove("d-none");
            isValid = false;
        } else {
            if (DOM.subtaskPriorityError) DOM.subtaskPriorityError.classList.add("d-none");
        }

        if (!selectedStatus) {
            if (DOM.subtaskStatusError) DOM.subtaskStatusError.classList.remove("d-none");
            isValid = false;
        } else {
            if (DOM.subtaskStatusError) DOM.subtaskStatusError.classList.add("d-none");
        }

        if (!isValid) return;

        const completed = selectedStatus ? selectedStatus.value === "true" : false;
        const createdAt = new Date().toLocaleString();
        
        const taskIdRaw = DOM.subtaskParentIdInput ? DOM.subtaskParentIdInput.value : "0";
        const parentId = parseInt(taskIdRaw, 10);
        
        addSubtask(parentId, title, description, priority, completed, createdAt);
        saveTasks();
        renderTasks();
        
        closeSubtaskModal();
    });
}

if (DOM.subtaskTitleInput) {
    DOM.subtaskTitleInput.addEventListener("input", () => {
        if (DOM.subtaskTitleError && DOM.subtaskTitleInput?.value.trim() !== "") {
            DOM.subtaskTitleError.classList.add("d-none");
        }
    });
}

if (DOM.subtaskPriorityInput) {
    DOM.subtaskPriorityInput.addEventListener("change", () => {
        if (DOM.subtaskPriorityError && DOM.subtaskPriorityInput?.value !== "") {
            DOM.subtaskPriorityError.classList.add("d-none");
        }
    });
}

const subtaskRadioInputs = document.querySelectorAll<HTMLInputElement>('input[name="subtask-status"]');
subtaskRadioInputs.forEach(radio => {
    radio.addEventListener("change", () => {
        if (DOM.subtaskStatusError) DOM.subtaskStatusError.classList.add("d-none");
    });
});

if (DOM.clearBtn) DOM.clearBtn.addEventListener("click", clearForm);
if (DOM.searchInput) DOM.searchInput.addEventListener("input", debounce(handleSearchTasks, 300));

if (DOM.taskList) {
    DOM.taskList.addEventListener("click", () => {
        throttleLog();
    });
}

// App Initialization
loadTasks();
renderTasks();

if (tasks.length === 0) {
    if (DOM.errorMessage) DOM.errorMessage.classList.add("d-none");
    if (DOM.loadingMessage) DOM.loadingMessage.classList.remove("d-none");
    
    fetchTasksFromAPI()
        .then((apiTasks) => {
            setTasks(apiTasks);
            saveTasks();
            renderTasks();
            if (DOM.loadingMessage) DOM.loadingMessage.classList.add("d-none");
            if (DOM.errorMessage) DOM.errorMessage.classList.add("d-none");
        })
        .catch((error) => {
            console.log("API fetch Error:", error instanceof Error ? error.message : String(error));
            if (DOM.loadingMessage) DOM.loadingMessage.classList.add("d-none");
            if (DOM.errorMessage) DOM.errorMessage.classList.remove("d-none");
        });
}
