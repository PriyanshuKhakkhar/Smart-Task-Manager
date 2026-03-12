import type { ITask, ISubTask } from "./task-model.js";
import { tasks, removeTaskById, toggleTaskCompletion } from "./task-service.js";
import { saveTasks } from "./storage-service.js";
import { openSubtaskModal } from "./App.js";

const taskList = document.getElementById("task-list") as HTMLInputElement | null;

// Recursive helper to render nested subtasks
export function renderSubtasksHtml(subtasks: ISubTask[], depth: number = 0): string {
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

function createTaskRow(task: ITask): HTMLTableRowElement {
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
    return tr;
}

function attachTaskRowEvents(tr: HTMLTableRowElement, task: ITask): void {
    const deleteBtn = tr.querySelector(".btn-delete");
    if (deleteBtn) {
        deleteBtn.addEventListener("click", (e: Event) => {
            e.stopPropagation();
            removeTaskById(task.id);
            saveTasks();
            renderTasks();
        });
    }

    const completeBtn = tr.querySelector(".btn-complete");
    if (completeBtn) {
        completeBtn.addEventListener("click", (e: Event) => {
            e.stopPropagation();
            toggleTaskCompletion(task.id, true);
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
}

function createSubtasksRow(subtasks: ISubTask[]): HTMLTableRowElement {
    const subTr = document.createElement("tr");
    subTr.className = "subtasks-row";
    subTr.innerHTML = `
        <td colspan="7" style="padding: 0; background: #fafafa; border-bottom: 2px solid #e5e7eb;">
            ${renderSubtasksHtml(subtasks, 0)}
        </td>
    `;
    return subTr;
}

function attachSubtaskRowEvents(subTr: HTMLTableRowElement): void {
    subTr.querySelectorAll('.subtask-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e: Event) => {
            const target = e.target as HTMLInputElement;
            const stId = parseInt(target.getAttribute('data-id') || "0", 10);
            toggleTaskCompletion(stId, target.checked);
            saveTasks();
            renderTasks();
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
            removeTaskById(stId);
            saveTasks();
            renderTasks();
        });
    });
}

export function renderTasks(tasksToRender: ITask[] = tasks): void {
    if (!taskList) return;
    taskList.innerHTML = "";

    tasksToRender.forEach(task => {
        const tr = createTaskRow(task);
        attachTaskRowEvents(tr, task);
        taskList.appendChild(tr);

        // Render subtasks if any
        if (task.subtasks && task.subtasks.length > 0) {
            const subTr = createSubtasksRow(task.subtasks);
            attachSubtaskRowEvents(subTr);
            taskList.appendChild(subTr);
        }
    });
}
