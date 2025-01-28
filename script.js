 
    const form = document.getElementById("todo-form");
    const input = document.getElementById("todo-input");
    const deadlineInput = document.getElementById("task-deadline");
    const prioritySelect = document.getElementById("task-priority");
    const list = document.getElementById("todo-list");
    const taskCount = document.getElementById("task-count");
    const clearAllButton = document.getElementById("clear-all");
    const themeToggleButton = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");
    const body = document.body;

    // Set the theme on page load from localStorage
    const currentTheme = localStorage.getItem("theme") || "light";
    if (currentTheme === "dark") {
      body.classList.add("dark");
      body.style.backgroundColor = "#1f2937"; // Dark mode background color
      themeIcon.classList.replace("fa-moon", "fa-sun");
    } else {
      body.classList.remove("dark");
      body.style.backgroundColor = "#f3f4f6"; // Light mode background color
      themeIcon.classList.replace("fa-sun", "fa-moon");
    }

    // Theme toggle functionality
    themeToggleButton.addEventListener("click", () => {
      const isDarkMode = body.classList.contains("dark");
      const newTheme = isDarkMode ? "light" : "dark";
      
      // Toggle the dark class on the body
      body.classList.toggle("dark", newTheme === "dark");
      
      // Update the background color
      body.style.backgroundColor = newTheme === "dark" ? "#1f2937" : "#f3f4f6";
      
      // Update the icon
      themeIcon.classList.toggle("fa-sun", newTheme === "dark");
      themeIcon.classList.toggle("fa-moon", newTheme === "light");
      
      // Save the theme preference in localStorage
      localStorage.setItem("theme", newTheme);
    });

    // Get tasks from localStorage
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    savedTasks.forEach(task => addTaskToList(task.text, task.completed, task.deadline, task.priority));

    // Update task count
    function updateTaskCount() {
      const remainingTasks = Array.from(list.children).filter(task => !task.querySelector(".task-checkbox").checked).length;
      taskCount.textContent = `Tasks Remaining: ${remainingTasks}`;
    }

    // Handle form submission for adding a new task
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const taskText = input.value.trim();
      const taskDeadline = deadlineInput.value;
      const taskPriority = prioritySelect.value;

      if (taskText) {
        addTaskToList(taskText, false, taskDeadline, taskPriority);
        saveTasks();
        input.value = "";
        deadlineInput.value = "";
        prioritySelect.value = "low";
        updateTaskCount();
      }
    });

    // Add task to the task list
    function addTaskToList(text, completed, deadline, priority) {
      const listItem = document.createElement("li");
      const priorityClasses = {
        low: "bg-green-100 border-green-500 dark:bg-green-900 dark:border-green-700",
        medium: "bg-yellow-100 border-yellow-500 dark:bg-yellow-900 dark:border-yellow-700",
        high: "bg-red-100 border-red-500 dark:bg-red-900 dark:border-red-700"
      };

      listItem.className = `flex justify-between items-center px-4 py-2 rounded-md shadow-sm border-l-4 ${priorityClasses[priority]} transition-all`;

      const formattedDeadline = deadline ? `Due: ${new Date(deadline).toLocaleDateString()}` : '';

      listItem.innerHTML = `
        <div class="flex items-center gap-2">
          <input type="checkbox" class="task-checkbox" ${completed ? "checked" : ""}>
          <input type="text" value="${text}" readonly class="bg-transparent flex-grow outline-none ${completed ? "line-through text-gray-400" : "dark:text-white"}">
          <span class="text-xs text-gray-500 dark:text-gray-400">${formattedDeadline}</span>
        </div>
        <div class="flex gap-2">
          <button class="text-blue-500 hover:text-blue-700 edit-button"><i class="fas fa-edit"></i></button>
          <button class="text-red-500 hover:text-red-700 delete-button"><i class="fas fa-trash"></i></button>
        </div>
      `;

      setupTaskListeners(listItem);
      list.appendChild(listItem);
      updateTaskCount();
    }

    // Set up task listeners for editing, deleting, and marking as complete
    function setupTaskListeners(task) {
      const checkbox = task.querySelector(".task-checkbox");
      const taskInput = task.querySelector("input[type='text']");
      const editButton = task.querySelector(".edit-button");
      const deleteButton = task.querySelector(".delete-button");

      // Toggle complete status
      checkbox.addEventListener("change", () => {
        taskInput.classList.toggle("line-through");
        taskInput.classList.toggle("text-gray-400");
        saveTasks();
        updateTaskCount();
      });

      // Edit task functionality
      editButton.addEventListener("click", () => {
        taskInput.readOnly = false;
        taskInput.focus();
        taskInput.addEventListener("blur", () => {
          taskInput.readOnly = true;
          saveTasks();
        });
      });

      // Delete task functionality
      deleteButton.addEventListener("click", () => {
        list.removeChild(task);
        saveTasks();
        updateTaskCount();
      });
    }

    // Save tasks to localStorage
    function saveTasks() {
      const tasks = Array.from(list.children).map(task => {
        return {
          text: task.querySelector("input[type='text']").value,
          completed: task.querySelector(".task-checkbox").checked,
          deadline: task.querySelector(".text-xs") ? task.querySelector(".text-xs").textContent.replace('Due: ', '') : "",
          priority: task.classList.contains("border-red-500") ? "high" : task.classList.contains("border-yellow-500") ? "medium" : "low"
        };
      });
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    // Clear all tasks functionality
    clearAllButton.addEventListener("click", () => {
      localStorage.removeItem("tasks");
      list.innerHTML = "";
      updateTaskCount();
    });
  
