function goToHomepage() {
            window.location.href = "homepage.html";
        }
        // Sample projects data
        // const projects = [
        //     {
        //         id: 1,
        //         title: "AI Research Hub",
        //         description: "Collaborative AI research project focusing on machine learning algorithms and neural networks",
        //         members: 5,
        //         dueDate: "2024-09-15",
        //         team: ["Alice Johnson", "Bob Smith", "Carol Davis", "David Wilson", "Eva Brown"]
        //     },
        //     {
        //         id: 2,
        //         title: "Mobile App Design",
        //         description: "Creating a user-friendly mobile application for task management with modern UI/UX",
        //         members: 3,
        //         dueDate: "2024-09-22",
        //         team: ["Frank Miller", "Grace Lee", "Henry Taylor"]
        //     },
        //     {
        //         id: 3,
        //         title: "Marketing Campaign 2024",
        //         description: "Developing comprehensive marketing strategy for Q4 product launch",
        //         members: 4,
        //         dueDate: "2024-09-18",
        //         team: ["Ivy Chen", "Jack Anderson", "Kate Roberts", "Leo Martinez"]
        //     },
        //     {
        //         id: 4,
        //         title: "Website Redesign",
        //         description: "Complete overhaul of company website with modern design principles",
        //         members: 6,
        //         dueDate: "2024-10-05",
        //         team: ["Mike Johnson", "Nina Williams", "Oscar Davis", "Paula Brown", "Quinn Miller", "Rachel Taylor"]
        //     },
        //     {
        //         id: 5,
        //         title: "Data Analytics Platform",
        //         description: "Building a comprehensive data analytics platform for business intelligence",
        //         members: 4,
        //         dueDate: "2024-09-30",
        //         team: ["Sam Wilson", "Tina Chen", "Uma Patel", "Victor Lee"]
        //     },
        //     {
        //         id: 6,
        //         title: "E-commerce Integration",
        //         description: "Integrating multiple payment gateways and shipping providers for online store",
        //         members: 3,
        //         dueDate: "2024-09-25",
        //         team: ["William Garcia", "Xara Rodriguez", "Yuki Tanaka"]
        //     }
        // ];
        // Load projects from localStorage (or fallback to defaults if none saved yet)
let projects = JSON.parse(localStorage.getItem('projects'));

if (!projects || projects.length === 0) {
    projects = [
        {
            id: 1,
            title: "AI Research Hub",
            description: "Collaborative AI research project focusing on machine learning algorithms and neural networks",
            members: 5,
            dueDate: "2024-09-15",
            team: ["Alice Johnson", "Bob Smith", "Carol Davis", "David Wilson", "Eva Brown"]
        },
        {
            id: 2,
            title: "Mobile App Design",
            description: "Creating a user-friendly mobile application for task management with modern UI/UX",
            members: 3,
            dueDate: "2024-09-22",
            team: ["Frank Miller", "Grace Lee", "Henry Taylor"]
        },
        {
            id: 3,
            title: "Marketing Campaign 2024",
            description: "Developing comprehensive marketing strategy for Q4 product launch",
            members: 4,
            dueDate: "2024-09-18",
            team: ["Ivy Chen", "Jack Anderson", "Kate Roberts", "Leo Martinez"]
        },
        {
            id: 4,
            title: "Website Redesign",
            description: "Complete overhaul of company website with modern design principles",
            members: 6,
            dueDate: "2024-10-05",
            team: ["Mike Johnson", "Nina Williams", "Oscar Davis", "Paula Brown", "Quinn Miller", "Rachel Taylor"]
        }
    ];
    localStorage.setItem('projects', JSON.stringify(projects));
}



        let currentProject = null;

        // Initialize the page
        document.addEventListener('DOMContentLoaded', function() {
            renderProjects();
            generateCalendar();
        });

        // Render all projects
        function renderProjects() {
            const projectsGrid = document.getElementById('projectsGrid');
            projectsGrid.innerHTML = '';

            projects.forEach(project => {
                const projectCard = document.createElement('div');
                projectCard.className = 'project-card';
                projectCard.onclick = () => openProjectModal(project);
                
                projectCard.innerHTML = `
                    <div class="project-title">${project.title}</div>
                    <div class="project-desc">${project.description}</div>
                    <div class="project-meta">
                        <div class="meta-item">👥 ${project.members} members</div>
                        <div class="meta-item">📅 Due: ${formatDate(project.dueDate)}</div>
                    </div>
                `;
                
                projectsGrid.appendChild(projectCard);
            });
        }

        // Filter projects based on search
        function filterProjects() {
            const searchTerm = document.querySelector('.search-bar').value.toLowerCase();
            const projectCards = document.querySelectorAll('.project-card');
            
            projectCards.forEach(card => {
                const title = card.querySelector('.project-title').textContent.toLowerCase();
                const desc = card.querySelector('.project-desc').textContent.toLowerCase();
                
                if (title.includes(searchTerm) || desc.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }

        // Open project modal
        function openProjectModal(project) {
            currentProject = project;
            document.getElementById('modalProjectTitle').textContent = project.title;
            document.getElementById('modalProjectDesc').textContent = project.description;
            
            // Populate team members
            const teamContainer = document.getElementById('modalTeamMembers');
            teamContainer.innerHTML = '';
            project.team.forEach(member => {
                const memberDiv = document.createElement('div');
                memberDiv.className = 'member';
                memberDiv.innerHTML = `${member} <span onclick="removeMember('${member}')" style="cursor: pointer; margin-left: 0.5rem;">×</span>`;
                teamContainer.appendChild(memberDiv);
            });
            
            document.getElementById('projectModal').style.display = 'block';
            document.body.style.overflow = 'hidden';
        }

        // Close project modal
        function closeProjectModal() {
            document.getElementById('projectModal').style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        // Switch between tabs
        function switchTab(tabName) {
            // Remove active class from all tabs
            document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
            
            // Add active class to clicked tab
            event.target.classList.add('active');
            document.getElementById(tabName + '-view').style.display = 'block';
        }

        // Drag and drop functionality
        function allowDrop(ev) {
            ev.preventDefault();
        }

        function drag(ev) {
            ev.dataTransfer.setData("text", ev.target.outerHTML);
            ev.target.classList.add('dragging');
        }

        function drop(ev) {
            ev.preventDefault();
            const data = ev.dataTransfer.getData("text");
            const column = ev.target.closest('.todo-column');
            if (column) {
                const tasksContainer = column.querySelector('div[id$="-tasks"]');
                if (tasksContainer) {
                    tasksContainer.innerHTML += data;
                }
            }
            // Remove the original element
            document.querySelector('.todo-item.dragging').remove();
        }

        // Add new task
        function addNewTask() {
            const taskTitle = prompt("Enter task title:");
            const assignee = prompt("Assign to:");
            
            if (taskTitle && assignee) {
                const newTasksContainer = document.getElementById('new-tasks');
                const taskDiv = document.createElement('div');
                taskDiv.className = 'todo-item';
                taskDiv.draggable = true;
                taskDiv.ondragstart = drag;
                taskDiv.innerHTML = `<strong>${taskTitle}</strong><br><small>Assigned to: ${assignee}</small>`;
                newTasksContainer.appendChild(taskDiv);
            }
        }

        // Tasks table functions
        function addTaskRow() {
            const table = document.getElementById('tasksTableBody');
            const rowCount = table.rows.length + 1;
            const newRow = table.insertRow();
            
            newRow.innerHTML = `
                <td>${rowCount}</td>
                <td contenteditable="true">New Task</td>
                <td contenteditable="true">Assign to...</td>
                <td contenteditable="true">Task description...</td>
                <td>
                    <select>
                        <option>New</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                    </select>
                </td>
                <td contenteditable="true">2024-09-30</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editTask(this)">Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteTask(this)">Delete</button>
                </td>
            `;
        }

        function editTask(btn) {
            const row = btn.closest('tr');
            const cells = row.querySelectorAll('td');
            
            // Make cells editable
            for (let i = 1; i < cells.length - 1; i++) {
                if (i !== 4) { // Skip status column (has select)
                    cells[i].contentEditable = true;
                    cells[i].style.background = '#f0f4ff';
                }
            }
            
            btn.textContent = 'Save';
            btn.onclick = () => saveTask(btn);
        }

        function saveTask(btn) {
            const row = btn.closest('tr');
            const cells = row.querySelectorAll('td');
            
            // Make cells non-editable
            for (let i = 1; i < cells.length - 1; i++) {
                if (i !== 4) {
                    cells[i].contentEditable = false;
                    cells[i].style.background = '';
                }
            }
            
            btn.textContent = 'Edit';
            btn.onclick = () => editTask(btn);
        }

        function deleteTask(btn) {
            if (confirm('Are you sure you want to delete this task?')) {
                btn.closest('tr').remove();
                // Renumber rows
                const rows = document.querySelectorAll('#tasksTableBody tr');
                rows.forEach((row, index) => {
                    row.cells[0].textContent = index + 1;
                });
            }
        }

        // Calendar functions
        let currentDate = new Date();

        function generateCalendar() {
            const calendar = document.getElementById('calendarGrid');
            const monthYear = document.getElementById('currentMonth');
            
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            
            monthYear.textContent = new Date(year, month).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
            });
            
            // Days of week header
            const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            calendar.innerHTML = '';
            
            daysOfWeek.forEach(day => {
                const dayHeader = document.createElement('div');
                dayHeader.className = 'calendar-day';
                dayHeader.style.background = '#4c63d2';
                dayHeader.style.color = 'white';
                dayHeader.style.fontWeight = 'bold';
                dayHeader.textContent = day;
                calendar.appendChild(dayHeader);
            });
            
            // First day of month and number of days
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            // Sample deadlines (you can modify this data)
            const deadlines = {
                '2024-09-15': 'AI Research Due',
                '2024-09-18': 'Marketing Campaign Due',
                '2024-09-22': 'Mobile App Due',
                '2024-09-25': 'E-commerce Due',
                '2024-09-30': 'Analytics Platform Due',
                '2024-10-05': 'Website Redesign Due'
            };
            
            // Previous month days
            const prevMonthDays = new Date(year, month, 0).getDate();
            for (let i = firstDay - 1; i >= 0; i--) {
                const dayDiv = document.createElement('div');
                dayDiv.className = 'calendar-day other-month';
                dayDiv.textContent = prevMonthDays - i;
                calendar.appendChild(dayDiv);
            }
            
            // Current month days
            for (let day = 1; day <= daysInMonth; day++) {
                const dayDiv = document.createElement('div');
                dayDiv.className = 'calendar-day';
                dayDiv.textContent = day;
                
                // Check for deadlines
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                if (deadlines[dateStr]) {
                    dayDiv.classList.add('has-deadline');
                    dayDiv.title = deadlines[dateStr];
                }
                
                calendar.appendChild(dayDiv);
            }
            
            // Next month days
            const totalCells = calendar.children.length;
            const remainingCells = 42 - totalCells; // 6 rows × 7 days
            for (let day = 1; day <= remainingCells; day++) {
                const dayDiv = document.createElement('div');
                dayDiv.className = 'calendar-day other-month';
                dayDiv.textContent = day;
                calendar.appendChild(dayDiv);
            }
        }

        function previousMonth() {
            currentDate.setMonth(currentDate.getMonth() - 1);
            generateCalendar();
        }

        function nextMonth() {
            currentDate.setMonth(currentDate.getMonth() + 1);
            generateCalendar();
        }

        // Chat functions
        function sendMessage(event) {
            if (event.key === 'Enter' && event.target.value.trim()) {
                const chatMessages = document.getElementById('chatMessages');
                const messageDiv = document.createElement('div');
                messageDiv.className = 'message';
                
                const now = new Date();
                const time = now.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit', 
                    hour12: true 
                });
                
                messageDiv.innerHTML = `
                    <div class="message-author">You</div>
                    <div class="message-time">${time}</div>
                    <div>${event.target.value}</div>
                `;
                
                chatMessages.appendChild(messageDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                event.target.value = '';
            }
        }

        // Team member functions
        function addTeamMember() {
            const memberName = prompt('Enter new team member name:');
            if (memberName && currentProject) {
                currentProject.team.push(memberName);
                
                const teamContainer = document.getElementById('modalTeamMembers');
                const memberDiv = document.createElement('div');
                memberDiv.className = 'member';
                memberDiv.innerHTML = `${memberName} <span onclick="removeMember('${memberName}')" style="cursor: pointer; margin-left: 0.5rem;">×</span>`;
                teamContainer.appendChild(memberDiv);
            }
        }

        function removeMember(memberName) {
            if (confirm(`Remove ${memberName} from the team?`)) {
                if (currentProject) {
                    const index = currentProject.team.indexOf(memberName);
                    if (index > -1) {
                        currentProject.team.splice(index, 1);
                    }
                }
                
                // Remove from UI
                const members = document.querySelectorAll('.member');
                members.forEach(member => {
                    if (member.textContent.includes(memberName)) {
                        member.remove();
                    }
                });
            }
        }

        // Utility functions
        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
        }

        function goToHomepage() {
            alert('Redirecting to Homepage...');
            // In a real app, you would navigate to the homepage
        }

        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            const modal = document.getElementById('projectModal');
            if (event.target === modal) {
                closeProjectModal();
            }
        });

        // Allow homepage to add projects dynamically
        function addProject(project) {
    projects.unshift(project);
    localStorage.setItem('projects', JSON.stringify(projects)); // save updated list
    renderProjects();
}

document.querySelectorAll('.delete-project-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
        const projectId = btn.getAttribute('data-project-id');
        if (!confirm('Are you sure you want to delete this project?')) return;
        const token = localStorage.getItem('token'); // Adjust if you store token differently
        const res = await fetch(`/api/projects/${projectId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            btn.closest('.project-card').remove();
        } else {
            alert(data.error || 'Failed to delete project.');
        }
    });
});


