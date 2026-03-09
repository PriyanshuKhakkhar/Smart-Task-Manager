const TaskManager = (function() {
    const addBtn = document.getElementById("add-btn");
    const clearbtn = document.getElementById("clear-btn");
    const taskTitleInput = document.getElementById("task-title");
    const taskDescInput = document.getElementById("task-desc");
    const taskPriorityInput = document.getElementById("task-priority");
    const taskDateInput = document.getElementById("task-date");
    const taskList = document.getElementById("task-list");
    const searchInput = document.getElementById("search-task");

    let tasks = [];
    let taskIdCounter = 1;
    let TASK_API_URL = "https://dummyjson.com/todos?limit=5";

    // 1. Task Constructor
    function Task(id, title, description, priority, createdAt, isCompleted) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.createdAt = createdAt;
        this.isCompleted = isCompleted || false;
    }

    // 2. ImportantTask Constructor (Prototype Inheritance)
    function ImportantTask(id, title, description, priority, createdAt, isCompleted) {
        Task.call(this, id, title, description, priority, createdAt, isCompleted);
        this.important = true;
    }
    ImportantTask.prototype = Object.create(Task.prototype);
    ImportantTask.prototype.constructor = ImportantTask;

    function generateId() {
        return taskIdCounter++;
    }

    // Helper to restore loaded objects into true class instances
    function instantiateTask(taskData) {
        if (taskData.priority === "High" || taskData.important) {
            return new ImportantTask(taskData.id, taskData.title, taskData.description, taskData.priority, taskData.createdAt, taskData.isCompleted);
        } else {
            return new Task(taskData.id, taskData.title, taskData.description, taskData.priority, taskData.createdAt, taskData.isCompleted);
        }
    }
    function mapApiTaskToAppTask(apiTask) {
        const priorityOptions = ["Low", "Medium", "High"];
        const randomPriority = priorityOptions[Math.floor(Math.random() * priorityOptions.length)];
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

    // CORS (Cross-Origin Resource Sharing)
    // Browsers block requests to APIs from different origins unless the server allows it.
    // Our frontend runs on localhost, but the API is on dummyjson.com.
    // The dummyjson API allows cross-origin requests using CORS headers,
    // so our fetch request works correctly.
    
    function fetchTasksFromAPI() {
        return fetch(TASK_API_URL)
        .then((response) => {
            if(!response.ok) {
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
                if (task.id > maxId) maxId = task.id;
            });
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

    function deleteTask(taskListRef, taskId) {
        for (let i = 0; i < taskListRef.length; i++) {
            if (taskListRef[i].id === taskId) {
                taskListRef.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    function renderTasks(tasksToRender = tasks) {
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

            // Actions
            tr.querySelector(".btn-delete").addEventListener("click", (e) => {
                e.stopPropagation();
                deleteTask(tasks, task.id);
                saveTasks();
                renderTasks();
            });

            tr.querySelector(".btn-complete").addEventListener("click", (e) => {
                e.stopPropagation();
                task.isCompleted = true;
                saveTasks();
                renderTasks();
            });

            taskList.appendChild(tr);
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
                newTask = new ImportantTask(generateId(), title, description, priority, createdAt, status);
            } else {
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
            if (statusError) statusError.classList.add("d-none");
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
                console.log("API fetch Error:", error.message);
                if (loadingMessage) loadingMessage.classList.add("d-none");
                if (errorMessage) errorMessage.classList.remove("d-none");
            });
    }

    // Return the module API (empty strictly just invoking)
    return {
        getTasks: () => tasks
    };
})();
