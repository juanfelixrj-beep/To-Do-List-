import { Task } from '../task.js';

const input = document.querySelector("#task-title");
const add = document.querySelector("#add-task");
const task_list = document.querySelector("#task-list");
const list_title = document.querySelector("#list_title")
const filter_completed = document.querySelector("#filter-completed");
const filter_not = document.querySelector("#filter-not");
const search_task_input = document.querySelector("#search-task")

const params = new URLSearchParams(window.location.search)
const listId = params.get("listId");
const KEY = "task_key_" + listId;


let tasks = [];
let filter = "completed";

renderTasks();

// add com click
add.addEventListener("click", () => {
  addTask();
});

search_task_input.addEventListener("input", ()=>{
  renderTasks(search_task_input.value);
})

// add com Enter (opcional mas muito bom)
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

filter_completed.addEventListener("click", ()=>{
  filter = "completed";
  renderTasks()
})

filter_not.addEventListener("click", ()=>{
  filter = "not_completed";
  renderTasks()
})

function addTask() {
  if (input.value.trim() === "") {
    alert("You need to fill the input");
    return;
  }
  tasks.push(new Task(listId, input.value.trim(), false));
  localStorage.setItem(KEY, JSON.stringify(tasks));
  input.value = "";
  renderTasks();
}

function renderTasks(search = "") {
  const listsRaw = localStorage.getItem("list_key");
  const lists = JSON.parse(listsRaw) || [];

  const current = lists.find(l => l.id === listId);
  if(current){
    list_title.textContent = current.list_name;
  }
  task_list.innerHTML = "";

  const raw = localStorage.getItem(KEY);
  tasks = raw ? JSON.parse(raw) : [];
  tasks = tasks.map((o, idx) =>({
   ...new Task(o.list ,o.task_title, o.completed),
   _index:idx
  }));

  if(filter == "completed"){
    tasks.sort((a, b) => a.completed - b.completed)
  }else if(filter == "not_completed"){
    tasks.sort((a, b) => b.completed - a.completed)
  }

  const query = search.trim().toLowerCase();

  const visibleTasks = query
    ? tasks.filter(task =>
        (task.task_title || "").toLowerCase().includes(query)
      )
    : tasks;

  visibleTasks.forEach((element, i) => {
    const li = document.createElement("li");
    li.classList.add("task-animation");

    // ✅ DRAG: torna arrastável e marca o índice
    li.draggable = true;
    li.dataset.index = i;

    const fieldset = document.createElement("fieldset");
    fieldset.style.borderColor = element.completed ? "rgb(0, 255, 0)" : "rgb(255,0,0)";
    const span = document.createElement("span");
    span.innerHTML = element.completed ? `<s>${element.task_title}</s>` : element.task_title;
    
    const deletebtn = document.createElement("button");
    deletebtn.innerHTML = '<i class="bi bi-trash-fill"></i>';
    deletebtn.addEventListener("click", () => {
      tasks.splice(element._index, 1);
      localStorage.setItem(KEY, JSON.stringify(tasks));
      renderTasks();
    });

    const completebtn = document.createElement("button");
    completebtn.innerHTML = '<i class="bi bi-check-circle-fill"></i>';
    completebtn.addEventListener("click", () => {
        element.completed = !element.completed;

        fieldset.style.borderColor = element.completed ? "rgb(255, 0, 0)" : "rgb(0,0,0)";
        localStorage.setItem(KEY, JSON.stringify(tasks));
        renderTasks();
    });

    const editbtn = document.createElement("button")
    editbtn.innerHTML = '<i class="bi bi-pencil-fill"></i>'
    editbtn.addEventListener("click", ()=>{
        let newTask = prompt("Edit your task:", element.task_title)
        if(newTask !== ""){
            element.task_title = newTask.trim()
            localStorage.setItem(KEY, JSON.stringify(tasks))
            renderTasks()
        }
    })

    fieldset.append(span, deletebtn, completebtn, editbtn);
    li.appendChild(fieldset);
    task_list.appendChild(li);
  });

  // ✅ DRAG: ativa eventos depois de renderizar
  enableDragAndDrop();
}

function enableDragAndDrop() {
  const items = task_list.querySelectorAll("li");

  items.forEach(li => {
    li.addEventListener("dragstart", (e) => {
      li.classList.add("dragging");

      // necessário em vários navegadores
      e.dataTransfer.setData("text/plain", li.dataset.index);
      e.dataTransfer.effectAllowed = "move";
    });

    li.addEventListener("dragend", () => {
      li.classList.remove("dragging");
      items.forEach(x => x.classList.remove("drag-over"));
    });

    li.addEventListener("dragover", (e) => {
      e.preventDefault(); // sem isso, o drop não acontece
      li.classList.add("drag-over");
    });

    li.addEventListener("dragleave", () => {
      li.classList.remove("drag-over");
    });

    li.addEventListener("drop", (e) => {
      e.preventDefault();
      li.classList.remove("drag-over");

      const fromIndex = Number(e.dataTransfer.getData("text/plain"));
      const toIndex = Number(li.dataset.index);

      if (Number.isNaN(fromIndex) || Number.isNaN(toIndex)) return;
      if (fromIndex === toIndex) return;

      // move no array
      const [moved] = tasks.splice(fromIndex, 1);
      tasks.splice(toIndex, 0, moved);

      // salva e re-renderiza
      localStorage.setItem(KEY, JSON.stringify(tasks));
      renderTasks();
    });
  });
}
