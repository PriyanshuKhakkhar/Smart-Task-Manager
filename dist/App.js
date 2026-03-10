"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TaskManager = (function () {
    const addBtn = document.getElementById("add-btn");
    const clearbtn = document.getElementById("clear-btn");
    const taskTitleInput = document.getElementById("task-title");
    const taskDescInput = document.getElementById("task-desc");
    const taskPriorityInput = document.getElementById("task-priority");
    const taskDateInput = document.getElementById("task-date");
    const taskList = document.getElementById("task-list");
    const searchInput = document.getElementById("search-task");
    // Subtask Modal Elements
    const subtaskModal = document.getElementById("subtask-modal");
    const subtaskTitleInput = document.getElementById("subtask-title");
    const subtaskDescInput = document.getElementById("subtask-desc");
    const subtaskPriorityInput = document.getElementById("subtask-priority");
    const addSubtaskBtn = document.getElementById("add-subtask-btn");
    const closeSubtaskBtn = document.getElementById("close-subtask-btn");
    const clearSubtaskBtn = document.getElementById("clear-subtask-btn");
    const subtaskParentIdInput = document.getElementById("subtask-parent-id");
    const subtaskTitleError = document.getElementById("subtask-title-error");
    const subtaskPriorityError = document.getElementById("subtask-priority-error");
    const subtaskStatusError = document.getElementById("subtask-status-error");
    let tasks = [];
    let taskIdCounter = 1;
    let TASK_API_URL = "https://dummyjson.com/todos?limit=5";
    // 1. Task Constructor
    class Task {
        id;
        title;
        description;
        priority;
        createdAt;
        isCompleted;
        subtasks;
        constructor(id, title, description, priority, createdAt, isCompleted = false, subtasks = []) {
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
        important;
        constructor(id, title, description, priority, createdAt, isCompleted = false, subtasks = []) {
            super(id, title, description, priority, createdAt, isCompleted, subtasks);
            this.important = true;
        }
    }
    function generateId() {
        return taskIdCounter++;
    }
    // Helper to restore loaded objects into true class instances
    function instantiateTask(taskData) {
        if (taskData.priority === "High" || taskData.important) {
            return new ImportantTask(taskData.id, taskData.title, taskData.description, taskData.priority, taskData.createdAt, taskData.isCompleted, taskData.subtasks);
        }
        else {
            return new Task(taskData.id, taskData.title, taskData.description, taskData.priority, taskData.createdAt, taskData.isCompleted, taskData.subtasks);
        }
    }
    function mapApiTaskToAppTask(apiTask) {
        const priorityOptions = ["Low", "Medium", "High"];
        const randomPriority = priorityOptions[Math.floor(Math.random() * priorityOptions.length)] || "Low";
        const createdAt = new Date().toLocaleString();
        if (randomPriority === "High") {
            return new ImportantTask(generateId(), apiTask.todo, "Fetched from API", randomPriority, createdAt, apiTask.completed);
        }
        return new Task(generateId(), apiTask.todo, "Fetched from API", randomPriority, createdAt, apiTask.completed);
    }
    // CORS (Cross-Origin Resource Sharing)
    // Browsers block requests to APIs from different origins unless the server allows it.
    // Our frontend runs on localhost, but the API is on dummyjson.com.
    // The dummyjson API allows cross-origin requests using CORS headers,
    // so our fetch request works correctly.
    
    function fetchTasksFromAPI() {
        return fetch("https://jsonplaceholder.typicode.com/todos")
            .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch tasks from API");
            }
            return response.json();
        })
            .then((data) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(data.todos.map(mapApiTaskToAppTask));
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
                if (task.id > maxId)
                    maxId = task.id;
            });
            taskIdCounter = maxId + 1;
        }
    }
    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }
    function getTaskStatus() {
        const selectedStatus = document.querySelector('input[name="task-status"]:checked');
        if (!selectedStatus)
            return null;
        return selectedStatus.value === "true";
    }
    function clearForm() {
        if (taskTitleInput)
            taskTitleInput.value = "";
        if (taskDescInput)
            taskDescInput.value = "";
        if (taskPriorityInput)
            taskPriorityInput.value = "";
        if (taskDateInput)
            taskDateInput.value = "";
        const pendingRadio = document.getElementById("pending");
        const completedRadio = document.getElementById("completed");
        if (pendingRadio)
            pendingRadio.checked = false;
        if (completedRadio)
            completedRadio.checked = false;
        // Clear validation messages
        const titleError = document.getElementById("title-error");
        const priorityError = document.getElementById("priority-error");
        const statusError = document.getElementById("status-error");
        if (titleError)
            titleError.classList.add("d-none");
        if (priorityError)
            priorityError.classList.add("d-none");
        if (statusError)
            statusError.classList.add("d-none");
    }
    function deleteTask(taskListRef, taskId) {
        for (let i = 0; i < taskListRef.length; i++) {
            const task = taskListRef[i];
            if (task && task.id === taskId) {
                taskListRef.splice(i, 1);
                return true;
            }
        }
        return false;
    }
    function renderTasks(tasksToRender = tasks) {
        if (!taskList)
            return;
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
            // Actions
            const deleteBtn = tr.querySelector(".btn-delete");
            if (deleteBtn) {
                deleteBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    deleteTask(tasks, task.id);
                    saveTasks();
                    renderTasks();
                });
            }
            const completeBtn = tr.querySelector(".btn-complete");
            if (completeBtn) {
                completeBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    task.isCompleted = true;
                    saveTasks();
                    renderTasks();
                });
            }
            const btnSubtask = tr.querySelector(".btn-subtask");
            if (btnSubtask) {
                btnSubtask.addEventListener("click", (e) => {
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
                        <ul style="list-style-type: none; margin: 0; padding: 16px 24px;">
                            ${task.subtasks.map((st, index) => `
                                <li style="display: flex; align-items: start; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; ${index === task.subtasks.length - 1 ? 'border-bottom: none;' : ''}">
                                    <label style="display: flex; align-items: start; gap: 12px; cursor: pointer; ${st.isCompleted ? 'text-decoration: line-through; color: #9ca3af;' : 'color: #374151;'}">
                                        <input type="checkbox" class="subtask-checkbox" data-task-id="${task.id}" data-subtask-index="${index}" ${st.isCompleted ? 'checked' : ''} style="margin-top: 2px; width: 16px; height: 16px; accent-color: #6366f1;">
                                        <div>
                                            <div style="font-weight: 500; font-size: 14px;">${st.title}</div>
                                            ${st.description ? `<div style="font-size: 13px; color: #6b7280; margin-top: 4px;">${st.description}</div>` : ''}
                                        </div>
                                    </label>
                                    <div style="display: flex; gap: 16px; align-items: center; font-size: 13px;">
                                        <span class="badge priority-${st.priority ? st.priority.toLowerCase() : 'low'}">${st.priority || 'Low'}</span>
                                        <span class="badge status-${st.isCompleted ? 'completed' : 'pending'}">${st.isCompleted ? 'Completed' : 'Pending'}</span>
                                        <span style="color: #6b7280;">${st.createdAt || ''}</span>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                    </td>
                `;
                subTr.querySelectorAll('.subtask-checkbox').forEach(checkbox => {
                    checkbox.addEventListener('change', (e) => {
                        const target = e.target;
                        const tId = parseInt(target.getAttribute('data-task-id') || "0", 10);
                        const sIdx = parseInt(target.getAttribute('data-subtask-index') || "0", 10);
                        const tsk = tasks.find(t => t.id === tId);
                        if (tsk && tsk.subtasks[sIdx]) {
                            tsk.subtasks[sIdx].isCompleted = e.target.checked;
                            saveTasks();
                            renderTasks();
                        }
                    });
                });
                taskList.appendChild(subTr);
            }
        });
    }
    function clearSubtaskForm() {
        if (subtaskTitleInput)
            subtaskTitleInput.value = "";
        if (subtaskDescInput)
            subtaskDescInput.value = "";
        if (subtaskPriorityInput)
            subtaskPriorityInput.value = "";
        const subtaskPending = document.getElementById("subtask-pending");
        const subtaskCompleted = document.getElementById("subtask-completed");
        if (subtaskPending)
            subtaskPending.checked = false;
        if (subtaskCompleted)
            subtaskCompleted.checked = false;
        if (subtaskTitleError)
            subtaskTitleError.classList.add("d-none");
        if (subtaskPriorityError)
            subtaskPriorityError.classList.add("d-none");
        if (subtaskStatusError)
            subtaskStatusError.classList.add("d-none");
    }
    // Modal Display Functions
    function openSubtaskModal(taskId) {
        if (!subtaskModal)
            return;
        if (subtaskParentIdInput)
            subtaskParentIdInput.value = taskId.toString();
        clearSubtaskForm();
        subtaskModal.classList.add("active");
    }
    function closeSubtaskModal() {
        if (!subtaskModal)
            return;
        subtaskModal.classList.remove("active");
    }
    function debounce(fn, delay) {
        let timer;
        return function () {
            clearTimeout(timer);
            timer = setTimeout(() => {
                fn();
            }, delay);
        };
    }
    function searchTasks() {
        if (!searchInput)
            return;
        const searchText = searchInput.value.toLowerCase();
        const filteredTasks = tasks.filter(task => task.title.toLowerCase().includes(searchText));
        renderTasks(filteredTasks);
    }
    function throttle(fn, delay) {
        let lastCall = 0;
        return function (...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                fn.apply(this, args);
            }
        };
    }
    function logTaskAction() {
        console.log("User interacting with Tasks...");
    }
    const throttleLog = throttle(logTaskAction, 2000);
    // Add Task Event
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
                if (titleError)
                    titleError.classList.remove("d-none");
                isValid = false;
            }
            else {
                if (titleError)
                    titleError.classList.add("d-none");
            }
            if (!priority) {
                if (priorityError)
                    priorityError.classList.remove("d-none");
                isValid = false;
            }
            else {
                if (priorityError)
                    priorityError.classList.add("d-none");
            }
            const selectedStatus = document.querySelector('input[name="task-status"]:checked');
            if (!selectedStatus) {
                if (statusError)
                    statusError.classList.remove("d-none");
                isValid = false;
            }
            else {
                if (statusError)
                    statusError.classList.add("d-none");
            }
            if (!isValid)
                return;
            const status = selectedStatus ? selectedStatus.value === "true" : false;
            const createdAt = date || new Date().toLocaleString();
            // Use constructors instead of literal generic objects
            let newTask;
            if (priority === "High") {
                newTask = new ImportantTask(generateId(), title, description, priority, createdAt, status);
            }
            else {
                newTask = new Task(generateId(), title, description, priority, createdAt, status);
            }
            tasks.push(newTask);
            saveTasks();
            renderTasks();
            // Clear inputs and validation visually
            clearForm();
        });
    }
    // Input Validation Correcting Event Listeners
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
    const radioInputs = document.querySelectorAll('input[name="task-status"]');
    radioInputs.forEach(radio => {
        radio.addEventListener("change", () => {
            const statusError = document.getElementById("status-error");
            if (statusError)
                statusError.classList.add("d-none");
        });
    });
    // Subtask Modal Listeners
    if (closeSubtaskBtn)
        closeSubtaskBtn.addEventListener("click", closeSubtaskModal);
    if (clearSubtaskBtn)
        clearSubtaskBtn.addEventListener("click", clearSubtaskForm);
    if (addSubtaskBtn) {
        addSubtaskBtn.addEventListener("click", () => {
            const title = subtaskTitleInput ? subtaskTitleInput.value.trim() : "";
            const description = subtaskDescInput ? subtaskDescInput.value.trim() : "";
            const priority = subtaskPriorityInput ? subtaskPriorityInput.value : "";
            const selectedStatus = document.querySelector('input[name="subtask-status"]:checked');
            let isValid = true;
            if (!title) {
                if (subtaskTitleError)
                    subtaskTitleError.classList.remove("d-none");
                isValid = false;
            }
            else {
                if (subtaskTitleError)
                    subtaskTitleError.classList.add("d-none");
            }
            if (!priority) {
                if (subtaskPriorityError)
                    subtaskPriorityError.classList.remove("d-none");
                isValid = false;
            }
            else {
                if (subtaskPriorityError)
                    subtaskPriorityError.classList.add("d-none");
            }
            if (!selectedStatus) {
                if (subtaskStatusError)
                    subtaskStatusError.classList.remove("d-none");
                isValid = false;
            }
            else {
                if (subtaskStatusError)
                    subtaskStatusError.classList.add("d-none");
            }
            if (!isValid)
                return;
            const completed = selectedStatus ? selectedStatus.value === "true" : false;
            const createdAt = new Date().toLocaleString();
            const taskIdRaw = subtaskParentIdInput ? subtaskParentIdInput.value : "0";
            const taskId = parseInt(taskIdRaw, 10);
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                if (!task.subtasks)
                    task.subtasks = [];
                task.subtasks.push({
                    id: Date.now(),
                    title,
                    description,
                    priority,
                    isCompleted: completed,
                    createdAt
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
    const subtaskRadioInputs = document.querySelectorAll('input[name="subtask-status"]');
    subtaskRadioInputs.forEach(radio => {
        radio.addEventListener("change", () => {
            if (subtaskStatusError)
                subtaskStatusError.classList.add("d-none");
        });
    });
    if (clearbtn)
        clearbtn.addEventListener("click", clearForm);
    if (searchInput)
        searchInput.addEventListener("input", debounce(searchTasks, 300));
    if (taskList) {
        taskList.addEventListener("click", () => {
            throttleLog();
        });
    }
    // Initialization
    loadTasks();
    renderTasks();
    if (tasks.length === 0) {
        const loadingMessage = document.getElementById("loading-message");
        const errorMessage = document.getElementById("error-message");
        if (errorMessage)
            errorMessage.classList.add("d-none");
        if (loadingMessage)
            loadingMessage.classList.remove("d-none");
        fetchTasksFromAPI()
            .then((apiTasks) => {
            tasks = apiTasks;
            saveTasks();
            renderTasks();
            if (loadingMessage)
                loadingMessage.classList.add("d-none");
            if (errorMessage)
                errorMessage.classList.add("d-none");
        })
            .catch((error) => {
            console.log("API fetch Error:", error.message);
            if (loadingMessage)
                loadingMessage.classList.add("d-none");
            if (errorMessage)
                errorMessage.classList.remove("d-none");
        });
    }
    // Return the module API (empty strictly just invoking)
    return {
        getTasks: () => tasks
    };
})();
//# sourceMappingURL=App.js.map