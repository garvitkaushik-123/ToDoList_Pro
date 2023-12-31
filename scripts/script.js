let data = [];
let id = 0;
let isHamburgerOpen = false;
let activityLog = [];

// Store the 'data' array in localStorage
localStorage.setItem("data", JSON.stringify(data));
localStorage.setItem("id", JSON.stringify(id));
localStorage.setItem("isHamburgerOpen", JSON.stringify(isHamburgerOpen));
localStorage.setItem("activityLog", JSON.stringify(activityLog));

const inputTask = document.getElementById("inputTask");
const button = document.querySelector("button");
const listTask = document.querySelector("#listTask");

const showAll = (_) => true;

function render(data, filterFunction) {
  while (listTask.firstChild) listTask.firstChild.remove();
  const currentData = data.filter(filterFunction);

  const rest = document.querySelector(".rest");
  if (data.length === 0) rest.classList.remove("hidden");

  for (let d of currentData) {
    let li = document.createElement("li");
    li.classList.add(d.id);
    li.classList.add("draggable");
    li.classList.add("task_and_option");
    li.setAttribute("draggable", "true");
    let taskString = `<div class="task ${d.done ? "blur" : ""} 
    ${d.priority === "high" ? "rbl" : ""} 
    ${d.priority === "low" ? "gbl" : ""}
    ${d.priority === "medium" ? "obl" : ""} ">
      <div class="task_header">
        <div class='heading'>
          <div class="task_title">${d.title}</div>
          <div class="task_tags">`;

    for (let tag of d.tags) taskString += `<div>${tag}</div>`;

    const dateOption = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    const timeOption = {
      hour: "numeric",
      minute: "numeric",
    };

    const date = new Intl.DateTimeFormat("en-IN", dateOption).format(d.dueDate);
    const time = new Intl.DateTimeFormat("en-IN", timeOption).format(d.dueDate);
    taskString += `</div></div>
        <div class="task_dueDate">${date}|${time}</div>
      </div>
      <div class="task_description ${d.done ? "hidden" : ""}">${
      d.description
    }</div>
      <ul class="task_subtask ${d.done ? "hidden" : ""}">`;

    for (let i = 0; i < d.subtask.length; i++) {
      let st = d.subtask[i];
      taskString += `<li class="subtask draggable_subtask" draggable="true">- ${st} <svg data-tab=${i} class="deleteSubtask" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
  </li>`;
    }
    taskString += `</ul></div>`;

    li.innerHTML = taskString;

    const undone = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="done">
    <path stroke-linecap="round" stroke-linejoin="round" d="M15 15l-6 6m0 0l-6-6m6 6V9a6 6 0 0112 0v3" />
  </svg>
  `;

    const done = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="done">
    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  `;

    // Create the SVG element
    const remove = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="remove">
    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
  `;

    // Create the SVG element
    const edit = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="edit">
    <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
  `;

    const options = document.createElement("div");
    options.classList.add("options");

    if (d.done) options.insertAdjacentHTML("beforeend", undone);
    else options.insertAdjacentHTML("beforeend", done);

    options.insertAdjacentHTML("beforeend", edit);
    options.insertAdjacentHTML("beforeend", remove);

    li.appendChild(options);
    li.querySelector(".task_subtask").addEventListener("dragover", (e) => {
      e.preventDefault(); // Add this line to enable drop
      const drag = document.querySelector(".dragging_subtask");
      const afterElement = getDragAfterElementSubtask(
        li.querySelector(".task_subtask"),
        e.clientY
      );

      if (afterElement === null)
        li.querySelector(".task_subtask").appendChild(drag);
      else li.querySelector(".task_subtask").insertBefore(drag, afterElement);
    });
    li.addEventListener("dragstart", (e) => {
      if (e.target.classList.contains("subtask")) {
        e.target.classList.add("dragging_subtask");
      } else {
        li.classList.add("dragging");
      }
    });
    li.addEventListener("dragend", (e) => {
      if (e.target.classList.contains("subtask")) {
        e.target.classList.remove("dragging_subtask");
      } else {
        li.classList.remove("dragging");
      }
    });
    listTask.appendChild(li);
    const rest = document.querySelector(".rest");
    if (data.length !== 0) rest.classList.add("hidden");
  }
}

const week = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const year = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const time = new Date(Date.now());
const currentYear = String(time.getFullYear());
document.querySelector(".dateContainer h1").textContent = week[time.getDay()];
document.querySelector(".dateContainer h2").textContent = `${time.getDate()} ${
  year[time.getMonth()]
}'${currentYear.slice(2)}`;

function checkDueDate() {
  let newData = JSON.parse(localStorage.getItem("data"));
  newData = newData.map((obj) => {
    obj.dueDate = new Date(obj.dueDate);
    return obj;
  });
  let date = new Date();
  date = +date;
  newData.forEach((d) => {
    let cd = d.dueDate;
    cd = +cd;
    if (date > cd && !d.done) alert(`Due Date Alert: ${d.title}`);
  });
}
checkDueDate();
setInterval(checkDueDate, 60000);

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    console.log(e.key);
    overlaySearch.classList.add("hidden");
    modalSearch.classList.add("hidden");
    overlay.classList.add("hidden");
    modal.classList.add("hidden");
    activityLogContainer.classList.add("hidden");
    overlayactivityLog.classList.add("hidden");
    isHamburgerOpen = false;
    localStorage.setItem("isHamburgerOpen", JSON.stringify(isHamburgerOpen));
    const sideBar = document.querySelector(".sideBar");
    sideBar.style.transform = "";
  }
});

document.addEventListener("click", (e) => {
  const sideBar = document.querySelector(".sideBar");
  const sidebarButton = document.querySelector(".navHamburger");
  const isSidebarClicked =
    sideBar.contains(e.target) || sidebarButton.contains(e.target);
  if (!isSidebarClicked) {
    isHamburgerOpen = false;
    localStorage.setItem("isHamburgerOpen", JSON.stringify(isHamburgerOpen));
    sideBar.style.transform = "";
  }
});

function getDragAfterElementSubtask(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".draggable_subtask:not(.dragging_subtask)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset)
        return { offset: offset, element: child };
      else return closest;
    },
    {
      offset: Number.NEGATIVE_INFINITY,
    }
  ).element;
}
