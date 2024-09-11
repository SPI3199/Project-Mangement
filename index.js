document.addEventListener("DOMContentLoaded", () => {
  const addProjectBtn = document.getElementById("add-project-btn");
  const saveProjectBtn = document.getElementById("save-project-btn");
  const projectForm = document.getElementById("project-form");
  const projectList = document.getElementById("project-list");
  const projectDetails = document.getElementById("project-details");
  const projectTitle = document.getElementById("project-title");
  const addTodoBtn = document.getElementById("add-todo-btn");
  const todoForm = document.getElementById("todo-form");
  const saveTodoBtn = document.getElementById("save-todo-btn");
  const todoList = document.getElementById("todo-list");

  const projects = JSON.parse(localStorage.getItem("projects")) || {};

  let selectedProject = null;

  let selectedTodo = null;

  function getProjects() {
    projectList.innerHTML = "";
    for (const projectName in projects) {
      const li = document.createElement("li");
      li.className = `project-item ${
        projectName === selectedProject ? "selected" : ""
      }`; // Apply 'selected' class if project is selected
      li.innerHTML = `
            <div class="project-details">
                <h3>${projectName}</h3>
                <button class="proj-delete" data-project-name="${projectName}">Delete</button>
            </div>
        `;
      li.addEventListener("click", () => {
        selectProject(projectName);
      });
      projectList.appendChild(li);
    }

    function selectProject(projectName) {
      selectedProject = projectName; // Set the selected project
      getProjects(); // Re-render the project list
      showProjectDetails(projectName); // Show project details
    }

    projectList.addEventListener("click", (event) => {
      if (event.target.classList.contains("proj-delete")) {
        const projectName = event.target.getAttribute("data-project-name");
        deleteProject(projectName);
      }
    });
  }
  function getTodos(projectName) {
    const todoList = document.getElementById("todo-list");
    todoList.innerHTML = "";
    const todos = projects[projectName].todos || [];

    todos.sort((a, b) => {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return (
        priorityOrder[a.priority.toLowerCase()] -
        priorityOrder[b.priority.toLowerCase()]
      );
    });

    todos.forEach((todo) => {
      const todoItem = document.createElement("div");
      todoItem.className = `todo-item ${todo.completed ? "completed" : ""} ${
        selectedTodo === todo.title ? "selected" : ""
      }`;
      todoItem.innerHTML = `
            <div class="todo-container ${todo.completed ? "completed" : ""}">
                <div class="name">
                    <div class="todo-title">${todo.title}</div>
                    <div class="todo-desc">${todo.description}</div>
                </div>
                <div class="details">
                    <div class="todo-priority"><button class="${
                      todo.priority
                    }">${
        todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)
      }</button></div>
                    <div class="todo-date">${todo.date}</div>
                    <button class="delete-todo-button" onclick="deleteTodo('${projectName}', '${
        todo.title
      }')">Delete</button>
                    <button class="edit-todo-button" onclick="editTodo('${projectName}', '${
        todo.title
      }')">Edit</button>
                    <input type="checkbox" class="todo-checkbox" onclick="toggleTodoComplete('${projectName}', '${
        todo.title
      }', this)" ${todo.completed ? "checked" : ""}>
                </div>
            </div>
        `;

      // Add click event listener to the todo item
      todoItem.addEventListener("click", () => {
        selectTodo(todo.title);
      });

      todoList.appendChild(todoItem);
    });
  }

  function selectTodo(todoTitle) {
    selectedTodo = todoTitle;
    const projectName = getCurrentProjectName();
    getTodos(projectName);
    showTodoDetails(todoTitle);
  }

  function getCurrentProjectName() {
    return selectedProject;
  }

  function showProjectDetails(name) {
    projectDetails.classList.remove("hidden");
    projectForm.classList.add("hidden");
    todoForm.classList.add("hidden");
    projectTitle.textContent = name;
    getTodos(name);
  }

  function addProject(name) {
    if (!projects[name]) {
      projects[name] = { todos: [] };
      localStorage.setItem("projects", JSON.stringify(projects));
      getProjects();
    }
  }

  window.deleteProject = function (name) {
    if (projects[name]) {
      delete projects[name];
      localStorage.setItem("projects", JSON.stringify(projects));
      getProjects();
    }
  };

  function addTodo(projectName, todo) {
    if (projects[projectName]) {
      projects[projectName].todos.push(todo);
      localStorage.setItem("projects", JSON.stringify(projects));
      getTodos(projectName);
    }
  }

  window.deleteTodo = function (projectName, title) {
    if (projects[projectName]) {
      projects[projectName].todos = projects[projectName].todos.filter(
        (todo) => todo.title !== title
      );
      localStorage.setItem("projects", JSON.stringify(projects));
      getTodos(projectName);
    }
  };

  window.editTodo = function (projectName, title) {
    const todo = projects[projectName].todos.find(
      (todo) => todo.title === title
    );
    if (todo) {
      document.getElementById("edit-title").value = todo.title;
      document.getElementById("edit-desc").value = todo.description;
      document.getElementById("edit-priority").value = todo.priority;
      document.getElementById("edit-date").value = todo.date;

      document.getElementById("edit-form").classList.remove("hidden");
      document.getElementById("save-edit-btn").onclick = () =>
        saveEditedTodo(projectName, title);
    }
  };

  function saveEditedTodo(projectName, originalTitle) {
    const title = document.getElementById("edit-title").value;
    const description = document.getElementById("edit-desc").value;
    const priority = document.getElementById("edit-priority").value;
    const date = document.getElementById("edit-date").value;

    if (title) {
      const todoIndex = projects[projectName].todos.findIndex(
        (todo) => todo.title === originalTitle
      );
      if (todoIndex > -1) {
        projects[projectName].todos[todoIndex] = {
          title,
          description,
          priority,
          date,
          completed: projects[projectName].todos[todoIndex].completed,
        };
        localStorage.setItem("projects", JSON.stringify(projects));
        getTodos(projectName);
        document.getElementById("edit-form").classList.add("hidden");
      }
    }
  }

  window.toggleTodoComplete = function (projectName, title, checkbox) {
    const todo = projects[projectName].todos.find(
      (todo) => todo.title === title
    );
    if (todo) {
      todo.completed = checkbox.checked;
      localStorage.setItem("projects", JSON.stringify(projects));
      getTodos(projectName);
    }
  };

  addProjectBtn.addEventListener("click", () => {
    projectForm.classList.toggle("hidden");
    todoForm.classList.add("hidden");
  });

  saveProjectBtn.addEventListener("click", () => {
    const name = document.getElementById("project-name").value;
    if (name) {
      addProject(name);
      projectForm.classList.add("hidden");
      document.getElementById("project-name").value = "";
    }
  });

  addTodoBtn.addEventListener("click", () => {
    todoForm.classList.toggle("hidden");
  });

  saveTodoBtn.addEventListener("click", () => {
    const title = document.getElementById("todo-title").value;
    const description = document.getElementById("todo-desc").value;
    const priority = document.getElementById("todo-priority").value;
    const date = document.getElementById("todo-date").value;
    const projectName = projectTitle.textContent;

    if (title && projectName) {
      const todo = { title, description, priority, date, completed: false };
      addTodo(projectName, todo);
      todoForm.classList.add("hidden");
      document.getElementById("todo-title").value = "";
      document.getElementById("todo-desc").value = "";
      document.getElementById("todo-priority").value = "";
      document.getElementById("todo-date").value = "";
    }
  });

  getProjects();
});
