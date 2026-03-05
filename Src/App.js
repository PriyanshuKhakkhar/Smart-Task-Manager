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

function renderTasks(tasksToRender = tasks) {
    taskList.innerHTML = "";

    tasksToRender.forEach(task => {
        const li = document.createElement("li");
        li.className = "task-item";

        li.innerHTML = `
            <div class="task-header">
                <strong>#${task.id} ${task.title}</strong>
                <span class="priority ${task.priority.toLowerCase()}">
                    ${task.priority}
                </span>
            </div>
            <div class="task-body">
                <p>${task.description}</p>
            </div>
            <div class="task-footer">
                <small>Date: ${task.createdAt || "N/A"}</small>
                <small>Status: ${task.isCompleted ? "Completed" : "Pending"}</small>
                <br><br>
                <button class="complete-btn" style="color:tomato;">Complete</button>
                <button class="delete-btn" style="color:red;">Delete</button>
            </div>
        `;

        // Delete Logic
        li.querySelector(".delete-btn").addEventListener("click", () => {
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks();
            renderTasks();
        });

        taskList.appendChild(li);

        li.querySelector(".complete-btn").addEventListener("click", () => {
            task.isCompleted = true;

            saveTasks();
            renderTasks();
        });
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
        isCompleted: status
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