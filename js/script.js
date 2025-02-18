let selectedDate = null;
let currentYear = new Date().getFullYear();
let selectedMonth = new Date().getMonth();

// Generate Year Options
function generateYears() {
    let yearSelect = document.getElementById("year-select");
    for (let year = currentYear - 5; year <= currentYear + 5; year++) {
        let option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        if (year === currentYear) option.selected = true;
        yearSelect.appendChild(option);
    }
}

// Generate Calendar
function generateCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';

    const year = parseInt(document.getElementById('year-select').value);
    const month = parseInt(document.getElementById('month-select').value);

    // Add weekday headers
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekdays.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'weekday-header';
        dayHeader.textContent = day;
        calendar.appendChild(dayHeader);
    });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();

    // Add days from previous month
    const prevMonth = new Date(year, month, 0);
    for (let i = startingDay - 1; i >= 0; i--) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day other-month';
        dayElement.textContent = prevMonth.getDate() - i;
        calendar.appendChild(dayElement);
    }

    // Add days of current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;

        const currentDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        // Check if this day has any activities
        const activities = JSON.parse(localStorage.getItem(currentDate) || '[]');
        if (activities.length > 0) {
            dayElement.classList.add('has-activities');
        }

        // Check if this is today
        const today = new Date();
        if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
            dayElement.classList.add('today');
        }

        // Check if this is the selected date
        if (currentDate === selectedDate) {
            dayElement.classList.add('selected');
        }

        dayElement.addEventListener('click', () => {
            selectedDate = currentDate;
            updateSelectedDate();
            loadActivities();
            
            // Remove selected class from all days
            document.querySelectorAll('.calendar-day').forEach(day => {
                day.classList.remove('selected');
            });
            
            // Add selected class to clicked day
            dayElement.classList.add('selected');
        });

        calendar.appendChild(dayElement);
    }

    // Add days from next month
    const remainingDays = 42 - (startingDay + lastDay.getDate()); // 42 = 6 rows × 7 days
    for (let i = 1; i <= remainingDays; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day other-month';
        dayElement.textContent = i;
        calendar.appendChild(dayElement);
    }
}

// Select a Date
function selectDate(day, month, year) {
    selectedDate = `activities-${year}-${month}-${day}`;
    document.querySelectorAll(".date").forEach(d => d.classList.remove("selected"));
    event.target.classList.add("selected");

    // Load saved title
    let savedTitle = localStorage.getItem(`${selectedDate}-title`) || "";
    document.getElementById("date-title").value = savedTitle;

    loadActivities();
}

// Save Title
function saveTitle() {
    if (selectedDate) {
        let title = document.getElementById("date-title").value;
        localStorage.setItem(`${selectedDate}-title`, title);
    }
}

// Load Activities from Storage
function loadActivities() {
    const activityList = document.getElementById('activity-list');
    const activities = JSON.parse(localStorage.getItem(selectedDate) || '[]');
    
    activityList.innerHTML = '';
    
    if (activities.length === 0) {
        activityList.innerHTML = '<div class="empty-state">No activities planned for this day</div>';
        return;
    }

    activities.forEach((activity, index) => {
        const activityElement = document.createElement('div');
        activityElement.className = `activity-item${activity.completed ? ' completed' : ''}`;
        
        const textElement = document.createElement('span');
        textElement.className = 'activity-text';
        textElement.textContent = activity.description;
        textElement.onclick = () => toggleActivity(index);
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'activity-actions';
        
        const editButton = document.createElement('button');
        editButton.className = 'activity-btn edit';
        const editSpan = document.createElement('span');
        editSpan.textContent = 'Edit';
        editButton.appendChild(editSpan);
        editButton.onclick = () => editActivity(index);
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'activity-btn delete';
        const deleteSpan = document.createElement('span');
        deleteSpan.textContent = 'Delete';
        deleteButton.appendChild(deleteSpan);
        deleteButton.onclick = () => deleteActivity(index);
        
        actionsDiv.appendChild(editButton);
        actionsDiv.appendChild(deleteButton);
        
        activityElement.appendChild(textElement);
        activityElement.appendChild(actionsDiv);
        
        // Add animation delay for each item
        activityElement.style.opacity = '0';
        activityElement.style.transform = 'translateY(10px)';
        activityElement.style.transition = 'all 0.3s ease';
        activityElement.style.transitionDelay = `${index * 50}ms`;
        
        activityList.appendChild(activityElement);
        
        // Trigger animation
        setTimeout(() => {
            activityElement.style.opacity = '1';
            activityElement.style.transform = 'translateY(0)';
        }, 50);
    });
}

function toggleActivity(index) {
    let activities = JSON.parse(localStorage.getItem(selectedDate)) || [];
    activities[index].completed = !activities[index].completed;
    localStorage.setItem(selectedDate, JSON.stringify(activities));
    
    // Animate the completion state
    const activityElements = document.querySelectorAll('.activity-item');
    const element = activityElements[index];
    element.style.transition = 'all 0.3s ease';
    
    if (activities[index].completed) {
        element.classList.add('completed');
    } else {
        element.classList.remove('completed');
    }
}

function addActivity() {
    const input = document.getElementById("activity-description");
    const description = input.value.trim();
    
    if (description) {
        const activities = JSON.parse(localStorage.getItem(selectedDate) || '[]');
        activities.push({
            description: description,
            completed: false,
            timestamp: new Date().getTime()
        });
        
        localStorage.setItem(selectedDate, JSON.stringify(activities));
        input.value = '';
        
        // Hide input container with animation
        const inputContainer = document.getElementById("input-container");
        inputContainer.style.opacity = "0";
        inputContainer.style.transform = "translateY(10px)";
        
        setTimeout(() => {
            inputContainer.style.display = "none";
            loadActivities();
        }, 300);
        
        // Update calendar to show activity indicator
        generateCalendar();
    }
}

function editActivity(index) {
    let activities = JSON.parse(localStorage.getItem(selectedDate)) || [];
    let newDescription = prompt("Edit activity:", activities[index].description);
    
    if (newDescription !== null && newDescription.trim() !== "") {
        activities[index].description = newDescription.trim();
        localStorage.setItem(selectedDate, JSON.stringify(activities));
        loadActivities();
    }
}

function deleteActivity(index) {
    if (confirm("Are you sure you want to delete this activity?")) {
        let activities = JSON.parse(localStorage.getItem(selectedDate)) || [];
        activities.splice(index, 1);
        localStorage.setItem(selectedDate, JSON.stringify(activities));
        loadActivities();
    }
}

function getMonthName(monthIndex) {
    return document.getElementById("month-select").options[monthIndex].text;
}

function resetProgress() {
    if (confirm("Are you sure you want to reset all progress? This will delete all activities.")) {
        localStorage.clear();
        loadActivities();
    }
}

function clearActivities() {
    if (selectedDate && confirm("Are you sure you want to clear all activities for this date?")) {
        localStorage.removeItem(selectedDate);
        localStorage.removeItem(`${selectedDate}-title`);
        loadActivities();
    }
}

function goToToday() {
    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth();
    let day = today.getDate();

    document.getElementById("year-select").value = year;
    document.getElementById("month-select").value = month;
    generateCalendar();
    selectDate(day, month, year);
}

function updateSelectedDate() {
    let savedTitle = localStorage.getItem(`${selectedDate}-title`) || "";
    document.getElementById("date-title").value = savedTitle;
}

// Format date for display
function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { 
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}

// Show input container
function showInput() {
    const inputContainer = document.getElementById("input-container");
    inputContainer.style.display = "flex";
    inputContainer.style.opacity = "1";
    inputContainer.style.transform = "translateY(0)";
    document.getElementById("activity-description").focus();
}

// Handle input container keyboard events
document.getElementById("activity-description").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        addActivity();
    }
});

document.getElementById("activity-description").addEventListener("keyup", function(e) {
    if (e.key === "Escape") {
        const inputContainer = document.getElementById("input-container");
        inputContainer.style.opacity = "0";
        inputContainer.style.transform = "translateY(10px)";
        setTimeout(() => {
            inputContainer.style.display = "none";
            this.value = '';
        }, 300);
    }
});

// Initialize
generateYears();
generateCalendar();
