export const DOM = {
    // Main Form Elements
    addBtn: document.getElementById("add-btn") as HTMLButtonElement | null,
    clearBtn: document.getElementById("clear-btn") as HTMLButtonElement | null,
    titleInput: document.getElementById("task-title") as HTMLInputElement | null,
    descInput: document.getElementById("task-desc") as HTMLTextAreaElement | null,
    priorityInput: document.getElementById("task-priority") as HTMLSelectElement | null,
    dateInput: document.getElementById("task-date") as HTMLInputElement | null,
    
    // Status Radio
    pendingRadio: document.getElementById("pending") as HTMLInputElement | null,
    completedRadio: document.getElementById("completed") as HTMLInputElement | null,
    
    // Main Form Errors
    titleError: document.getElementById("title-error"),
    priorityError: document.getElementById("priority-error"),
    statusError: document.getElementById("status-error"),

    // Task List & Search
    taskList: document.getElementById("task-list") as HTMLTableSectionElement | null,
    searchInput: document.getElementById("search-task") as HTMLInputElement | null,

    // Subtask Modal Elements
    subtaskModal: document.getElementById("subtask-modal"),
    subtaskTitleInput: document.getElementById("subtask-title") as HTMLInputElement | null,
    subtaskDescInput: document.getElementById("subtask-desc") as HTMLTextAreaElement | null,
    subtaskPriorityInput: document.getElementById("subtask-priority") as HTMLSelectElement | null,
    addSubtaskBtn: document.getElementById("add-subtask-btn") as HTMLButtonElement | null,
    closeSubtaskBtn: document.getElementById("close-subtask-btn") as HTMLButtonElement | null,
    clearSubtaskBtn: document.getElementById("clear-subtask-btn") as HTMLButtonElement | null,
    subtaskParentIdInput: document.getElementById("subtask-parent-id") as HTMLInputElement | null,
    
    // Subtask Status Radio
    subtaskPendingRadio: document.getElementById("subtask-pending") as HTMLInputElement | null,
    subtaskCompletedRadio: document.getElementById("subtask-completed") as HTMLInputElement | null,
    
    // Subtask Errors
    subtaskTitleError: document.getElementById("subtask-title-error"),
    subtaskPriorityError: document.getElementById("subtask-priority-error"),
    subtaskStatusError: document.getElementById("subtask-status-error"),

    // Loading & Error Messages
    loadingMessage: document.getElementById("loading-message"),
    errorMessage: document.getElementById("error-message")
};
