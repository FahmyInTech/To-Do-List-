// DOM Elements
const taskInput = document.getElementById('taskInput');
const addTaskButton = document.getElementById('addTaskButton');
const taskList = document.getElementById('taskList');

// Initialize: Load tasks from localStorage when the page is ready
document.addEventListener('DOMContentLoaded', loadTasks);

// Event Listeners
addTaskButton.addEventListener('click', debounce(handleAddTask, 300));
taskInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    debounce(handleAddTask, 300)();
  }
});

// Add a new task
function handleAddTask() {
  const taskText = taskInput.value.trim();
  if (!taskText) {
    alert('Task cannot be empty!');
    return;
  }

  const newTask = { task: taskText, completed: false };
  const tasks = getTasksFromStorage();

  tasks.push(newTask);
  saveTasksToStorage(tasks);

  renderTask(newTask);
  taskInput.value = ''; // Clear the input field
}

// Display a single task
function renderTask(task) {
  const taskItem = document.createElement('li');
  taskItem.classList.toggle('completed', task.completed);

  taskItem.innerHTML = `
    <span class="task-text">${task.task}</span>
    <div class="task-actions">
      <button class="edit">Edit</button>
      <button class="delete">Delete</button>
      <input type="checkbox" class="checkbox" ${task.completed ? 'checked' : ''}>
    </div>
  `;

  // Event handlers for task actions
  taskItem.querySelector('.edit').addEventListener('click', () => editTask(task, taskItem));
  taskItem.querySelector('.delete').addEventListener('click', () => deleteTask(task, taskItem));
  taskItem.querySelector('.checkbox').addEventListener('change', (e) =>
    toggleTaskCompletion(task, taskItem, e.target.checked)
  );

  taskList.appendChild(taskItem);
}

// Edit an existing task
function editTask(task, taskItem) {
  const currentTextElement = taskItem.querySelector('.task-text');
  const inputField = document.createElement('input');
  inputField.type = 'text';
  inputField.value = task.task;

  taskItem.replaceChild(inputField, currentTextElement);
  inputField.focus();

  inputField.addEventListener('blur', () => saveEditedTask(task, taskItem, inputField));
  inputField.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      saveEditedTask(task, taskItem, inputField);
    }
  });
}

// Save the edited task
function saveEditedTask(task, taskItem, inputField) {
  const updatedText = inputField.value.trim();
  if (!updatedText) {
    alert('Task cannot be empty!');
    return;
  }

  task.task = updatedText;

  const tasks = getTasksFromStorage();
  const taskIndex = tasks.findIndex((t) => t.task === task.task);

  if (taskIndex !== -1) {
    tasks[taskIndex] = task;
    saveTasksToStorage(tasks);
  }

  // Restore the display
  const updatedTextElement = document.createElement('span');
  updatedTextElement.className = 'task-text';
  updatedTextElement.textContent = task.task;

  taskItem.replaceChild(updatedTextElement, inputField);
}

// Toggle task completion
function toggleTaskCompletion(task, taskItem, isCompleted) {
  task.completed = isCompleted;

  const tasks = getTasksFromStorage();
  const taskIndex = tasks.findIndex((t) => t.task === task.task);

  if (taskIndex !== -1) {
    tasks[taskIndex] = task;
    saveTasksToStorage(tasks);
  }

  taskItem.classList.toggle('completed', isCompleted);
}

// Delete a task
function deleteTask(task, taskItem) {
  const tasks = getTasksFromStorage();
  const updatedTasks = tasks.filter((t) => t.task !== task.task);

  saveTasksToStorage(updatedTasks);
  taskItem.remove();
}

// Load tasks from localStorage
function loadTasks() {
  const tasks = getTasksFromStorage();
  tasks.forEach(renderTask);
}

// LocalStorage utility functions
function getTasksFromStorage() {
  return JSON.parse(localStorage.getItem('tasks')) || [];
}

function saveTasksToStorage(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Utility: Debounce function
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}
