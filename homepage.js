
        // Toggle profile dropdown
        function toggleProfileMenu() {
            const menu = document.getElementById('profileMenu');
            menu.classList.toggle('show');
        }

        // Toggle notifications (placeholder)
        function toggleNotifications() {
            alert('Notifications: You have 3 new notifications!');
        }

        // Show project modal
        function showProjectModal(title, description, members, recentWork) {
            document.getElementById('modalTitle').textContent = title;
            document.getElementById('modalDescription').textContent = description;
            
            const membersContainer = document.getElementById('modalMembers');
            membersContainer.innerHTML = members.map(member => 
                `<span class="member">${member}</span>`
            ).join('');
            
            const workContainer = document.getElementById('modalRecentWork');
            workContainer.innerHTML = recentWork.slice(0, 5).map(work => 
                `<div class="work-item">✓ ${work}</div>`
            ).join('');
            
            document.getElementById('projectModal').style.display = 'block';
        }

        // Close modal
        function closeModal() {
            document.getElementById('projectModal').style.display = 'none';
        }

        // Create new project (placeholder)
        // Open New Project Modal
        function createProject() {
            document.getElementById('newProjectModal').style.display = 'block';
        }

        // Close Modal
        function closeNewProjectModal() {
        document.getElementById('newProjectModal').style.display = 'none';
        }

        // Handle Form Submission
        document.getElementById('newProjectForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const title = document.getElementById('projectTitle').value;
            const description = document.getElementById('projectDesc').value;
            const members = document.getElementById('projectMembers').value.split(',').map(m => m.trim());

            // const newProject = {
            // id: Date.now(),
            // title,
            //  description,
            //  members,
            // dueDate: "2024-09-30" // placeholder
            // };
            const newProject = {
                id: Date.now(),
                title,
                description,
                members,
                dueDate: "2024-09-30", // placeholder for now
                team: members   // ensure All Projects page can render team list
            };


            // Save in localStorage (simulate projects.json)
            let projects = JSON.parse(localStorage.getItem('projects')) || [];
            projects.unshift(newProject);
            localStorage.setItem('projects', JSON.stringify(projects));

            // Update Homepage Recent Projects
            updateRecentProjects();

            // Update All Projects page
            if (window.opener) {
                window.opener.addProject(newProject);
            }

            closeNewProjectModal();
            this.reset();
        });

        // Update homepage recent projects
        function updateRecentProjects() {
            let projects = JSON.parse(localStorage.getItem('projects')) || [];
            const grid = document.querySelector('.projects-grid');
            grid.innerHTML = '';

            projects.slice(0, 4).forEach(p => {
                const card = document.createElement('div');
                card.className = 'project-card';
                card.innerHTML = `
                    <div class="project-title">${p.title}</div>
                    <div class="project-desc">${p.description}</div>
                    <div class="project-meta">
                        <span>👥 ${p.members.length} members</span>
                        <span>📅 Due: ${p.dueDate}</span>
                    </div>
                `;
                grid.appendChild(card);
            });
        }


        // Join project (placeholder)
        function joinProject() {
            alert('Redirecting to Browse Projects page...');
        }

        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            const modal = document.getElementById('projectModal');
            if (event.target === modal) {
                closeModal();
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.profile-dropdown')) {
                document.getElementById('profileMenu').classList.remove('show');
            }
        });

        // Add some dynamic behavior to search
        const searchBar = document.querySelector('.search-bar');
        searchBar.addEventListener('focus', function() {
            this.style.width = '350px';
        });
        
        searchBar.addEventListener('blur', function() {
            if (window.innerWidth > 768) {
                this.style.width = '300px';
            }
        });

        document.addEventListener('DOMContentLoaded', function() {
    updateRecentProjects();
});

