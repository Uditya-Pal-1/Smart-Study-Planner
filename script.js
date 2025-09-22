let subjects = JSON.parse(localStorage.getItem('subjects')) || [];
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

const subjectsEl = document.getElementById('subjects');
const subjectSelectEl = document.getElementById('subjectSelect');
const taskInspectorEl = document.getElementById('taskInspector');
const progressBarEl = document.getElementById('progressBar');
const timelineEl = document.getElementById('timeline');
const reminderModal = document.getElementById('reminderModal');
const reminderText = document.getElementById('reminderText');
const reminderSound = document.getElementById('reminderSound');

function saveState(){
  localStorage.setItem('subjects', JSON.stringify(subjects));
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function addSubject(){
  const name = document.getElementById('subjectInput').value.trim();
  const color = document.getElementById('subjectColor').value;
  if(!name) return;
  subjects.push({name, color});
  document.getElementById('subjectInput').value='';
  saveState();
  renderAll();
}

function addTask(){
  const title = document.getElementById('taskInput').value.trim();
  const subject = subjectSelectEl.value;
  if(!title || !subject) return;
  const startDate = document.getElementById('startDate').value;
  const startTime = document.getElementById('startTime').value;
  const endDate = document.getElementById('endDate').value;
  const endTime = document.getElementById('endTime').value;
  const duration = document.getElementById('duration').value;
  const priority = document.getElementById('priority').value;
  const notes = document.getElementById('notes').value;
  const reminder = document.getElementById('reminder').checked;
  tasks.push({id: Date.now(), title, subject, startDate, startTime, endDate, endTime, duration, priority, notes, reminder, done:false});
  document.getElementById('taskInput').value='';
  document.getElementById('notes').value='';
  saveState();
  renderAll();
}

function toggleTaskDone(id){
  tasks = tasks.map(t=>t.id===id?{...t, done:!t.done}:t);
  saveState();
  renderAll();
}

function removeTask(id){
  tasks = tasks.filter(t=>t.id!==id);
  saveState();
  renderAll();
}

function clearAllTasks(){
  if(confirm('Are you sure to delete all tasks?')){
    tasks=[];
    saveState();
    renderAll();
  }
}

function toggleDarkMode(){
  document.body.classList.toggle('dark');
}

function renderSubjects(){
  subjectsEl.innerHTML = subjects.map(s=>`<li style='color:${s.color}'>${s.name}</li>`).join('');
  subjectSelectEl.innerHTML = subjects.map(s=>`<option value='${s.name}'>${s.name}</option>`).join('');
}

function renderTasks(){
  taskInspectorEl.innerHTML = tasks.map(task=>{
    const subjectObj = subjects.find(s=>s.name===task.subject);
    const color = subjectObj?subjectObj.color:'#4A90E2';
    return `<div class='task-card ${task.done?'done':''}' style='border-left:4px solid ${color}'>
      <div class='task-title'>${task.title}</div>
      <div class='task-meta'>📚 ${task.subject} | ${task.startDate||''} ${task.startTime||''} - ${task.endDate||''} ${task.endTime||''} | Duration: ${task.duration||'-'} mins | Priority: ${task.priority}</div>
      <div class='task-meta'>📝 ${task.notes||''}</div>
      <div class='task-actions'>
        <button class='btn-success' onclick='toggleTaskDone(${task.id})'>${task.done?'↩ Undo':'✔ Done'}</button>
        <button class='btn-danger' onclick='removeTask(${task.id})'>❌ Remove</button>
      </div>
    </div>`
  }).join('');

  const total = tasks.length;
  const doneCount = tasks.filter(t=>t.done).length;
  const percent = total?Math.round((doneCount/total)*100):0;
  progressBarEl.style.width = percent+'%';
  progressBarEl.textContent = percent+'%';

  renderTimeline();
}

function renderTimeline(){
  timelineEl.innerHTML='';
  tasks.sort((a,b)=> new Date(a.startDate+' '+a.startTime) - new Date(b.startDate+' '+b.startTime));
  tasks.forEach(task=>{
    const subjectObj = subjects.find(s=>s.name===task.subject);
    const color = subjectObj?subjectObj.color:'#4A90E2';
    const div = document.createElement('div');
    div.className='timeline-task';
    div.style.background=color;
    div.textContent=`${task.title} (${task.startTime||''})`;
    div.draggable=true;
    timelineEl.appendChild(div);
  });
}

function checkReminders(){
  const now = new Date();
  tasks.forEach(task => {
    if(task.reminder && !task.done && task.startDate && task.startTime){
      const taskTime = new Date(task.startDate + ' ' + task.startTime);
      const diff = taskTime - now;
      if(diff >=0 && diff < 60000){ // within 1 min
        showReminder(task.title);
      }
    }
  });
}

function showReminder(title){
  reminderText.textContent = `Task Starting Now: ${title}`;
  reminderModal.style.display = 'block';
  reminderSound.play();
}

function closeReminder(){
  reminderModal.style.display = 'none';
  reminderSound.pause();
  reminderSound.currentTime = 0;
}

setInterval(checkReminders, 30000); // Check every 30 seconds

function renderAll(){ renderSubjects(); renderTasks(); }

renderAll();
