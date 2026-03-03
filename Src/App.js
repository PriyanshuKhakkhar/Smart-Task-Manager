const addBtn = document.getElementById("add-btn");
const taskIdInput = document.getElementById("task-id");
const taskTitleInput = document.getElementById("task-title");
const taskDescInput = document.getElementById("task-desc");
const taskPriorityInput = document.getElementById("task-priority");
const taskDateInput = document.getElementById("task-date");
const taskStatusInput = document.getElementById("task-status");
const taskList = document.getElementById("task-list");

addBtn.addEventListener("click", () => {
    const taskId = taskIdInput.value;
    const taskTitle = taskTitleInput.value;
    const taskDesc = taskDescInput.value;
    const taskPriority = taskPriorityInput.value;
    const taskDate = taskDateInput.value;
    const taskStatus = taskStatusInput.value;

    if (!taskTitle.trim()) {
        return;
    }

    const li = document.createElement("li");
    li.className = "task-item";
    
    li.innerHTML = `
        <div class="task-header">
            <strong>#${taskId} ${taskTitle}</strong>
            <span class="priority ${taskPriority.toLowerCase()}">${taskPriority}</span>
        </div>
        <div class="task-body">
            <p>${taskDesc}</p>
        </div>
        <div class="task-footer">
            <small>Date: ${taskDate || 'N/A'}</small>
            <small>Status: ${taskStatus === 'True' ? 'Completed' : 'Pending'}</small>
            <button class="delete-item-btn" style="margin-left: auto; color: red; cursor: pointer;">Delete</button>
        </div>
    `;

    // Add functionality to the individual task delete button
    const deleteItemBtn = li.querySelector(".delete-item-btn");
    deleteItemBtn.addEventListener("click", () => {
        li.remove();
    });

    //Add functionalities to edit the task

    const editItemBtn = li.querySelector(".edit-item-btn");
    editItemBtn.addEventListener("click", function() {
        li.edit;
    })

    taskList.appendChild(li);

    // Clear inputs after adding
    taskIdInput.value = "";
    taskTitleInput.value = "";
    taskDescInput.value = "";
    taskDateInput.value = "";
    taskPriorityInput.value = "Low";
    taskStatusInput.value = "False";
});

// Setup the global Delete button from index.html
const globalDeleteBtn = document.getElementById("delete-btn");
if (globalDeleteBtn) {
    globalDeleteBtn.addEventListener("click", () => {
        if (taskList.lastElementChild) {
            taskList.removeChild(taskList.lastElementChild);
        } else {
            alert("No tasks to delete!");
        }
    });
}


