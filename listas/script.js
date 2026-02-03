import { TaskList } from "../list.js"
import { Task } from "../task.js"

const input = document.querySelector("#task-title")
const add = document.querySelector("#add-list")
const list_lists = document.querySelector("#list")
const search_list_input = document.querySelector("#search-filter")

let lists = []
let allTasks = []
const KEY = "list_key"

renderLists()

search_list_input.addEventListener("input", ()=>{
  renderLists(search_list_input.value)
})

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask(input.value);
});


add.addEventListener("click", ()=>{
    if(input.value == ""){
        alert("You need to type your new list name")
        return
    }
    addTask(input.value)
    renderLists()
})

function addTask(listName){

    const raw = localStorage.getItem("list_key");
    lists = raw ? JSON.parse(raw) : [];

    // verifica duplicado
    const exists = lists.some(l => 
        l.list_name.toLowerCase() === listName.toLowerCase()
    );

    if (exists) {
        alert("This list already exists");
        return;
    }
    const newID = crypto.randomUUID()
    // adiciona só se não existir
    lists.push(new TaskList(newID, listName, false));

    localStorage.setItem("list_key", JSON.stringify(lists));

    input.value = "";
    renderLists();
}

function renderLists(search = ""){
  list_lists.innerHTML = "";

  const raw = localStorage.getItem(KEY);
  lists = raw ? JSON.parse(raw) : [];
  lists = lists.map(o => new TaskList(o.id, o.list_name, o.completed));

  const q = search.trim().toLocaleLowerCase();
  const visibleLists = q
    ? lists.filter(l => (l.list_name || "").toLowerCase().includes(q))
    : lists;

  visibleLists.forEach((element, i) => {
    const li = document.createElement("li")
    li.classList.add("task-animation")

    const fieldset = document.createElement("fieldset");

    const span = document.createElement("a");
    span.textContent = element.list_name
    span.href = `../tarefas/tarefas.html?listId=${encodeURIComponent(element.id)}`
    span.style.textDecoration = "none";
    span.style.color = "inherit";


    const deletebtn = document.createElement("button");
    deletebtn.innerHTML = '<i class="bi bi-trash-fill"></i>';
    deletebtn.addEventListener("click", () => {
      localStorage.removeItem("task_key_"+element.id)

      const idx = lists.findIndex(l => l.id === element.id);
      if(idx !== -1){
        lists.splice(idx, 1);
      }

      localStorage.setItem(KEY, JSON.stringify(lists));
      renderLists(search_list_input?.value || "");

    });

    const editbtn = document.createElement("button");
    editbtn.innerHTML = '<i class="bi bi-pencil-fill"></i>'
    editbtn.addEventListener("click", () => {
    const newList = prompt("Edit your list name:", element.list_name);
    if (!newList) return;
    const name = newList.trim();
    if (name === "") return;

    // (opcional) evitar duplicado
    const exists = lists.some(l => l.list_name.toLowerCase() === name.toLowerCase() && l.id !== element.id);
    if (exists) {
        alert("This list already exists");
        return;
    }

    element.list_name = name;              // ✅ atualiza de verdade
    localStorage.setItem(KEY, JSON.stringify(lists));
    renderLists();
    });

    const tasksRaw = localStorage.getItem("task_key_" + element.id);
    allTasks = tasksRaw ? JSON.parse(tasksRaw) : [];
    allTasks = allTasks.map(o => new Task(o.list, o.task_title, o.completed));

    if (allTasks.length === 0) {
    fieldset.style.borderColor = "rgb(150,150,150)"; // neutro
    } else {
    const allDone = allTasks.every(t => t.completed);
    fieldset.style.borderColor = allDone ? "rgb(0,255,0)" : "rgb(255,0,0)";
    }

    fieldset.append(span, deletebtn, editbtn);
    li.appendChild(fieldset);
    list_lists.appendChild(li);

  });
}