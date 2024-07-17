const TASKS = ["Kitchen Cleaning", "Washroom Cleaning", "Hallway Cleaning", "Shoe Area Cleaning"];
const PEOPLE = ["Manav", "Pulkit", "Yash", "Paras"];
const WHATSAPP_NUMBER = "+14376601662";
const SCHEDULE_HISTORY_KEY = "scheduleHistory";

let previousSchedules = JSON.parse(localStorage.getItem(SCHEDULE_HISTORY_KEY)) || [
    { "Manav": null, "Pulkit": null, "Yash": null, "Paras": null },
    { "Manav": null, "Pulkit": null, "Yash": null, "Paras": null }
];

document.getElementById('generate-button').addEventListener('click', generateSchedule);

function generateSchedule() {
    const weekNumber = getWeekNumber(new Date());
    const startDate = getStartOfWeek(new Date());
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    document.getElementById('week-dates').textContent = `Week ${weekNumber}: ${startDate.toDateString()} - ${endDate.toDateString()}`;

    const tasksAssignment = assignTasks();
    updateScheduleTable(tasksAssignment);
    storeSchedule(tasksAssignment);
    sendScheduleToWhatsApp(tasksAssignment, weekNumber, startDate, endDate);
}

function getWeekNumber(date) {
    const startDate = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
    return Math.ceil((date.getDay() + 1 + days) / 7);
}

function getStartOfWeek(date) {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    return start;
}

function assignTasks() {
    const tasksAssignment = {};
    const availableTasks = [...TASKS];
    const shuffledPeople = [...PEOPLE].sort(() => Math.random() - 0.5);

    shuffledPeople.forEach(person => {
        let assignedTask;
        for (let task of availableTasks) {
            if (!(person === "Paras" && task === "Kitchen Cleaning") && !wasTaskAssignedRecently(person, task)) {
                assignedTask = task;
                break;
            }
        }

        if (!assignedTask) {
            assignedTask = availableTasks.find(task => !(person === "Paras" && task === "Kitchen Cleaning"));
        }

        if (assignedTask) {
            availableTasks.splice(availableTasks.indexOf(assignedTask), 1);
        }

        tasksAssignment[person] = assignedTask;
    });

    return tasksAssignment;
}

function wasTaskAssignedRecently(person, task) {
    return previousSchedules.some(schedule => schedule[person] === task);
}

function updateScheduleTable(tasksAssignment) {
    const tableBody = document.getElementById('schedule-table');
    tableBody.innerHTML = '';
    for (const [person, task] of Object.entries(tasksAssignment)) {
        const row = document.createElement('tr');
        const personCell = document.createElement('td');
        const taskCell = document.createElement('td');
        personCell.textContent = person;
        taskCell.textContent = task;
        row.appendChild(personCell);
        row.appendChild(taskCell);
        tableBody.appendChild(row);
    }
}

function storeSchedule(schedule) {
    previousSchedules.unshift(schedule);
    if (previousSchedules.length > 3) { // Keeping last three weeks schedules
        previousSchedules.pop();
    }
    localStorage.setItem(SCHEDULE_HISTORY_KEY, JSON.stringify(previousSchedules));
}

function sendScheduleToWhatsApp(schedule, weekNumber, startDate, endDate) {
    const message = `Week ${weekNumber}: ${startDate.toDateString()} - ${endDate.toDateString()}\n` +
        Object.entries(schedule).map(([person, task]) => `${person}: ${task}`).join('\n');
    const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');
}

// Generate initial schedule on page load
generateSchedule();
