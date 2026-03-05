const addBtn = document.getElementById("add-btn");
const taskIdInput = document.getElementById("task-id");
const taskTitleInput = document.getElementById("task-title");
const taskDescInput = document.getElementById("task-desc");
const taskPriorityInput = document.getElementById("task-priority");
const taskDateInput = document.getElementById("task-date");
const taskStatusInput = document.getElementById("task-status");
const taskList = document.getElementById("task-list");
const searchInput = document.getElementById("search-task");

let tasks = [];

function loadTasks() {
    const storedTasks = localStorage.getItem("tasks");
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function deleteTaskRecursively(taskList, taskId) {
    for (let i = 0; i < taskList.length; i++) {
        if (taskList[i].id === taskId) {
            taskList.splice(i, 1);
            return true;
        }
        if (taskList[i].subtasks && taskList[i].subtasks.length > 0) {
            if (deleteTaskRecursively(taskList[i].subtasks, taskId)) {
                return true;
            }
        }
    }
    return false;
}

function renderTasks(tasksToRender = tasks) {
    taskList.innerHTML = "";

    function renderTaskRecursively(task, parentElement) {
        const li = document.createElement("li");
        li.className = "task-item";

        li.innerHTML = `
            <div class="task-header">
                <strong>#${task.id} ${task.title}</strong>
                <span class="priority ${task.priority ? task.priority.toLowerCase() : 'low'}">
                    ${task.priority || 'Low'}
                </span>
            </div>
            <div class="task-body">
                <p>${task.description || ''}</p>
            </div>
            <div class="task-footer">
                <small>Date: ${task.createdAt || "N/A"}</small>
                <small>Status: ${task.isCompleted ? "Completed" : "Pending"}</small>
                <br><br>
                <button class="complete-btn" style="color:tomato;">Complete</button>
                <button class="delete-btn" style="color:red;">Delete</button>
                <button class="add-subtask-btn">Add Subtask</button>
            </div>
        `;

        // Actions
        li.querySelector(".delete-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            deleteTaskRecursively(tasks, task.id);
            saveTasks();
            renderTasks();
        });

        li.querySelector(".complete-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            task.isCompleted = true;
            saveTasks();
            renderTasks();
        });

        li.querySelector(".add-subtask-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            const subTaskTitle = prompt("Enter subtask title");
            if (!subTaskTitle) return;

            const newSubtask = {
                id: Date.now(),
                title: subTaskTitle,
                description: "",
                priority: task.priority || "Low",
                createdAt: new Date().toISOString(),
                isCompleted: false,
                subtasks: []
            };

            if (!task.subtasks) task.subtasks = [];
            task.subtasks.push(newSubtask);

            saveTasks();
            renderTasks();
        });

        parentElement.appendChild(li);

        // Render Subtasks
        if (task.subtasks && task.subtasks.length > 0) {
            const ul = document.createElement("ul");
            ul.className = "sub-task-list";
            ul.style.paddingLeft = "30px";
            ul.style.listStyleType = "circle";
            ul.style.marginTop = "10px";
            ul.style.borderLeft = "2px solid #ddd";
            li.appendChild(ul);
            task.subtasks.forEach(subtask => {
                renderTaskRecursively(subtask, ul);
            });
        }
    }

    tasksToRender.forEach(task => {
        renderTaskRecursively(task, taskList);
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

// 6️⃣ Add Task Event
addBtn.addEventListener("click", () => {

    const id = Number(taskIdInput.value);
    const title = taskTitleInput.value.trim();
    const description = taskDescInput.value.trim();
    const priority = taskPriorityInput.value;
    const date = taskDateInput.value;
    const status = taskStatusInput.value === "True";

    if (!title) {
        alert("Please enter Task Title");
        return;
    }

    const newTask = {
        id: id,
        title: title,
        description: description,
        priority: priority,
        createdAt: date || new Date().toISOString(),
        isCompleted: status,
        subtasks: []
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();

    // Clear inputs
    taskIdInput.value = "";
    taskTitleInput.value = "";
    taskDescInput.value = "";
    taskDateInput.value = "";
    taskPriorityInput.value = "Low";
    taskStatusInput.value = "False";
});

loadTasks();
renderTasks();

const debouncedSearch = debounce(searchTasks, 300);

searchInput.addEventListener("input", debouncedSearch);

taskList.addEventListener("click", (e) => {

    throttleLog();

});



