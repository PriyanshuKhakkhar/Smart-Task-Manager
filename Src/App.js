const TaskManager = (function() {
    const addBtn = document.getElementById("add-btn");
    const clearbtn = document.getElementById("clear-btn");
    const taskTitleInput = document.getElementById("task-title");
    const taskDescInput = document.getElementById("task-desc");
    const taskPriorityInput = document.getElementById("task-priority");
    const taskDateInput = document.getElementById("task-date");
    const taskList = document.getElementById("task-list");
    const searchInput = document.getElementById("search-task");

    // Subtask form elements
    const subtaskFormContainer = document.getElementById("subtask-form-container");
    const parentTaskInfo = document.getElementById("parent-task-info");
    const subtaskTitleInput = document.getElementById("subtask-title");
    const subtaskDescInput = document.getElementById("subtask-desc");
    const subtaskPriorityInput = document.getElementById("subtask-priority");
    const subtaskPendingRadio = document.getElementById("subtask-pending");
    const subtaskCompletedRadio = document.getElementById("subtask-completed");
    const addSubtaskBtn = document.getElementById("add-subtask-btn");
    const clearSubtaskBtn = document.getElementById("clear-subtask-btn");
    const cancelSubtaskBtn = document.getElementById("cancel-subtask-btn");

    const subtaskTitleError = document.getElementById("subtask-title-error");
    const subtaskPriorityError = document.getElementById("subtask-priority-error");
    const subtaskStatusError = document.getElementById("subtask-status-error");

    let tasks = [];
    let taskIdCounter = 1;
    let currentParentTaskId = null;

    // 1. Task Constructor
    function Task(id, title, description, priority, createdAt, isCompleted, subtasks) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.createdAt = createdAt;
        this.isCompleted = isCompleted || false;
        this.subtasks = subtasks || [];
    }

    // 2. ImportantTask Constructor (Prototype Inheritance)
    function ImportantTask(id, title, description, priority, createdAt, isCompleted, subtasks) {
        Task.call(this, id, title, description, priority, createdAt, isCompleted, subtasks);
        this.important = true;
    }
    ImportantTask.prototype = Object.create(Task.prototype);
    ImportantTask.prototype.constructor = ImportantTask;

    function generateId() {
        return taskIdCounter++;
    }

    // Helper to recursively restore loaded objects into true class instances
    function instantiateTask(taskData) {
        let subtasks = [];
        if (taskData.subtasks && taskData.subtasks.length > 0) {
            subtasks = taskData.subtasks.map(instantiateTask);
        }
        
        if (taskData.priority === "High" || taskData.important) {
            return new ImportantTask(taskData.id, taskData.title, taskData.description, taskData.priority, taskData.createdAt, taskData.isCompleted, subtasks);
        } else {
            return new Task(taskData.id, taskData.title, taskData.description, taskData.priority, taskData.createdAt, taskData.isCompleted, subtasks);
        }
    }

    function loadTasks() {
        const storedTasks = localStorage.getItem("tasks");
        if (storedTasks) {
            const parsedTasks = JSON.parse(storedTasks);
            tasks = parsedTasks.map(instantiateTask);
            
            let maxId = 0;
            function findMaxId(currentTasks) {
                if (!currentTasks) return;
                currentTasks.forEach(task => {
                    if (task.id > maxId) maxId = task.id;
                    if (task.subtasks && task.subtasks.length > 0) findMaxId(task.subtasks);
                });
            }
            findMaxId(tasks);
            taskIdCounter = maxId + 1;
        }
    }

    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function getTaskStatus() {
        const selectedStatus = document.querySelector('input[name="task-status"]:checked');
        if (!selectedStatus) return null;
        return selectedStatus.value === "true";
    }

    function clearForm() {
        if (taskTitleInput) taskTitleInput.value = "";
        if (taskDescInput) taskDescInput.value = "";
        if (taskPriorityInput) taskPriorityInput.value = "";
        if (taskDateInput) taskDateInput.value = "";
        
        const pendingRadio = document.getElementById("pending");
        const completedRadio = document.getElementById("completed");
        if (pendingRadio) pendingRadio.checked = false;
        if (completedRadio) completedRadio.checked = false;

        // Clear validation messages
        const titleError = document.getElementById("title-error");
        const priorityError = document.getElementById("priority-error");
        const statusError = document.getElementById("status-error");
        if (titleError) titleError.classList.add("d-none");
        if (priorityError) priorityError.classList.add("d-none");
        if (statusError) statusError.classList.add("d-none");
    }

    function deleteTaskRecursively(taskListRef, taskId) {
        for (let i = 0; i < taskListRef.length; i++) {
            if (taskListRef[i].id === taskId) {
                taskListRef.splice(i, 1);
                return true;
            }
            if (taskListRef[i].subtasks && taskListRef[i].subtasks.length > 0) {
                if (deleteTaskRecursively(taskListRef[i].subtasks, taskId)) {
                    return true;
                }
            }
        }
        return false;
    }

    function findTaskById(taskListRef, taskId) {
        for (let i = 0; i < taskListRef.length; i++) {
            if (taskListRef[i].id === taskId) return taskListRef[i];
            if (taskListRef[i].subtasks && taskListRef[i].subtasks.length > 0) {
                const found = findTaskById(taskListRef[i].subtasks, taskId);
                if (found) return found;
            }
        }
        return null;
    }

    function renderTasks(tasksToRender = tasks) {
        if (!taskList) return;
        taskList.innerHTML = "";

        function renderTaskRecursively(task, parentElement, depth = 0) {
            const tr = document.createElement("tr");
            tr.className = "task-item";

            const indent = depth * 20;
            const indentHtml = depth > 0 ? `<span style="display:inline-block; width:${indent}px"></span>&#8627; ` : '';

            const titleStyle = task.isCompleted ? 'text-decoration: line-through; color: #9ca3af;' : 'color: #374151; font-weight: 500;';
            
            tr.innerHTML = `
                <td style="font-weight: 600; color: #4b5563;">#${task.id}</td>
                <td style="${titleStyle}">${indentHtml}${task.title}</td>
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
            tr.querySelector(".btn-delete").addEventListener("click", (e) => {
                e.stopPropagation();
                deleteTaskRecursively(tasks, task.id);
                saveTasks();
                renderTasks();
            });

            tr.querySelector(".btn-complete").addEventListener("click", (e) => {
                e.stopPropagation();
                task.isCompleted = true;
                saveTasks();
                renderTasks();
            });

            tr.querySelector(".btn-subtask").addEventListener("click", (e) => {
                e.stopPropagation();
                currentParentTaskId = task.id;
                if (parentTaskInfo) {
                    parentTaskInfo.textContent = `#${task.id} - ${task.title}`;
                }
                if (subtaskFormContainer) {
                    subtaskFormContainer.classList.remove("d-none");
                    subtaskFormContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });

            parentElement.appendChild(tr);

            // Render Subtasks
            if (task.subtasks && task.subtasks.length > 0) {
                task.subtasks.forEach(subtask => {
                    renderTaskRecursively(subtask, parentElement, depth + 1);
                });
            }
        }

        tasksToRender.forEach(task => {
            renderTaskRecursively(task, taskList, 0);
        });
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
        if (!searchInput) return;
        const searchText = searchInput.value.toLowerCase();
        const filteredTasks = tasks.filter(task =>
            task.title.toLowerCase().includes(searchText)
        );
        renderTasks(filteredTasks);
    }

    function throttle(fn, delay) {
        let lastCall = 0;
        return function(...args) {
            const now = Date.now();
            if(now - lastCall >= delay) {
                lastCall = now;
                fn.apply(this, args);
            }
        }
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

            const selectedStatus = document.querySelector('input[name="task-status"]:checked');
            if (!selectedStatus) {
                if (statusError) statusError.classList.remove("d-none");
                isValid = false;
            } else {
                if (statusError) statusError.classList.add("d-none");
            }

            if (!isValid) return;

            const status = selectedStatus.value === "true";
            const createdAt = date || new Date().toLocaleString();

            // Use constructors instead of literal generic objects
            let newTask;
            if (priority === "High") {
                newTask = new ImportantTask(generateId(), title, description, priority, createdAt, status, []);
            } else {
                newTask = new Task(generateId(), title, description, priority, createdAt, status, []);
            }

            tasks.push(newTask);
            saveTasks();
            renderTasks();

            // Clear inputs and validation visually
            clearForm();
        });
    }

    // Add Subtask Event
    if (addSubtaskBtn) {
        addSubtaskBtn.addEventListener("click", () => {
            if (!currentParentTaskId) return;

            const title = subtaskTitleInput ? subtaskTitleInput.value.trim() : "";
            const description = subtaskDescInput ? subtaskDescInput.value.trim() : "";
            const priority = subtaskPriorityInput ? subtaskPriorityInput.value : "";
            
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

            const selectedStatus = document.querySelector('input[name="subtask-status"]:checked');
            if (!selectedStatus) {
                if (subtaskStatusError) subtaskStatusError.classList.remove("d-none");
                isValid = false;
            } else {
                if (subtaskStatusError) subtaskStatusError.classList.add("d-none");
            }

            if (!isValid) return;

            const status = selectedStatus.value === "true";
            const createdAt = new Date().toLocaleString();

            let newSubtask;
            if (priority === "High") {
                newSubtask = new ImportantTask(generateId(), title, description, priority, createdAt, status, []);
            } else {
                newSubtask = new Task(generateId(), title, description, priority, createdAt, status, []);
            }

            const parentTask = findTaskById(tasks, currentParentTaskId);
            if (parentTask) {
                if (!parentTask.subtasks) parentTask.subtasks = [];
                parentTask.subtasks.push(newSubtask);
                saveTasks();
                renderTasks();
            }

            clearSubtaskForm();
            if (subtaskFormContainer) subtaskFormContainer.classList.add("d-none");
            currentParentTaskId = null;
        });
    }

    function clearSubtaskForm() {
        if (subtaskTitleInput) subtaskTitleInput.value = "";
        if (subtaskDescInput) subtaskDescInput.value = "";
        if (subtaskPriorityInput) subtaskPriorityInput.value = "";
        
        if (subtaskPendingRadio) subtaskPendingRadio.checked = false;
        if (subtaskCompletedRadio) subtaskCompletedRadio.checked = false;

        if (subtaskTitleError) subtaskTitleError.classList.add("d-none");
        if (subtaskPriorityError) subtaskPriorityError.classList.add("d-none");
        if (subtaskStatusError) subtaskStatusError.classList.add("d-none");
    }

    if (clearSubtaskBtn) clearSubtaskBtn.addEventListener("click", clearSubtaskForm);
    if (cancelSubtaskBtn) {
        cancelSubtaskBtn.addEventListener("click", () => {
            clearSubtaskForm();
            if (subtaskFormContainer) subtaskFormContainer.classList.add("d-none");
            currentParentTaskId = null;
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
            if (statusError) statusError.classList.add("d-none");
        });
    });

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

    // Initialization
    loadTasks();
    renderTasks();

    // Return the module API (empty strictly just invoking)
    return {
        getTasks: () => tasks
    };
})();
