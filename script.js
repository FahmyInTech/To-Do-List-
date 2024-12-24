// Select elements
const taskInput = document.getElementById('taskInput');
const addTaskButton = document.getElementById('addTaskButton');
const taskList = document.getElementById('taskList');

// Load tasks from localStorage
document.addEventListener('DOMContentLoaded', loadTasks);

// Add task
addTaskButton.addEventListener('click', debounce(addTask, 300));
taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    debounce(addTask, 300)();
  }
});

// Add a new task
function addTask() {
  const task = taskInput.value.trim();
  if (!task) {
    alert('Task cannot be empty!');
    return;
  }

  const tasks = getTasksFromLocalStorage();
  const newTask = { task, completed: false };
  tasks.push(newTask);
  saveTasksToLocalStorage(tasks);
  renderTask(newTask);
  taskInput.value = '';
}

// Render a task
function renderTask(task) {
  const li = document.createElement('li');
  li.classList.toggle('completed', task.completed);
  li.innerHTML = `
    <span class="task-text">${task.task}</span>
    <div class="task-actions">
      <button class="edit">Edit</button>
      <button class="delete">Delete</button>
      <input type="checkbox" class="checkbox" ${task.completed ? 'checked' : ''}>
    </div>
  `;

  const editButton = li.querySelector('.edit');
  const deleteButton = li.querySelector('.delete');
  const checkbox = li.querySelector('.checkbox');

  editButton.addEventListener('click', () => editTask(task, li));
  deleteButton.addEventListener('click', () => deleteTask(task, li));
  checkbox.addEventListener('change', () => toggleCompletion(task, li, checkbox));

  taskList.appendChild(li);
}

function editTask(task, li) {
  const taskTextSpan = li.querySelector('.task-text');
  const checkbox = li.querySelector('.checkbox');
  
  // Make the task text editable
  const input = document.createElement('input');
  input.type = 'text';
  input.value = task.task;
  
  // Replace the task text with the input field
  li.replaceChild(input, taskTextSpan);
  
  input.focus();
  
  // Save the edited task when the input field loses focus or on Enter key press
  input.addEventListener('blur', () => saveEditedTask(task, li, input, checkbox));
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveEditedTask(task, li, input, checkbox);
    }
  });
}

function saveEditedTask(task, li, input, checkbox) {
  const newTaskText = input.value.trim();
  if (!newTaskText) {
    alert('Mission cannot be empty!');
    return;
  }
  
  task.task = newTaskText;
  const tasks = getTasksFromLocalStorage();
  const index = tasks.findIndex(t => t.task === task.task);
  if (index !== -1) {
    tasks[index] = task;
    saveTasksToLocalStorage(tasks);
  }
  
  // Create a new task span and replace the input field with it
  const newTaskSpan = document.createElement('span');
  newTaskSpan.classList.add('task-text');
  newTaskSpan.textContent = task.task;
  
  li.replaceChild(newTaskSpan, input);
  
  // Re-attach the "Edit" and "Delete" buttons after saving the task
  const editButton = document.createElement('button');
  editButton.textContent = 'Edit';
  editButton.className = 'edit';
  
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.className = 'delete';
  
  editButton.addEventListener('click', () => editTask(task, li));
  deleteButton.addEventListener('click', () => deleteTask(task, li));

  const taskActionsDiv = li.querySelector('.task-actions');
  taskActionsDiv.innerHTML = ''; // Clear the existing buttons
  taskActionsDiv.appendChild(editButton);
  taskActionsDiv.appendChild(deleteButton);
  
  // Restore the checkbox after editing
  const restoredCheckbox = document.createElement('input');
  restoredCheckbox.type = 'checkbox';
  restoredCheckbox.className = 'checkbox';
  restoredCheckbox.checked = task.completed;
  restoredCheckbox.addEventListener('change', () => toggleCompletion(task, li, restoredCheckbox));
  taskActionsDiv.appendChild(restoredCheckbox);
}

function toggleCompletion(task, li, checkbox) {
  task.completed = checkbox.checked;
  const tasks = getTasksFromLocalStorage();
  const index = tasks.findIndex(t => t.task === task.task);
  if (index !== -1) {
    tasks[index] = task;
    saveTasksToLocalStorage(tasks);
  }

  // Update task appearance
  li.classList.toggle('completed', task.completed);
}

// Delete a task
function deleteTask(task, li) {
  const tasks = getTasksFromLocalStorage();
  const updatedTasks = tasks.filter((t) => t.task !== task.task);
  saveTasksToLocalStorage(updatedTasks);
  li.remove();
}

// Load tasks on page refresh
function loadTasks() {
  const tasks = getTasksFromLocalStorage();
  tasks.forEach(renderTask);
}

// Get tasks from localStorage
function getTasksFromLocalStorage() {
  return JSON.parse(localStorage.getItem('tasks')) || [];
}

// Save tasks to localStorage
function saveTasksToLocalStorage(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Debounce function
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}
