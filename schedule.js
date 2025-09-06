
        // Current date for calendar navigation
        let currentDate = new Date();
        
        // Sample deadline data (this would normally come from database)
        let deadlinesData = [
            {
                date: '2024-09-15',
                title: 'AI Research Final Review',
                project: 'AI Research Hub',
                description: 'Complete final review of AI model accuracy and performance metrics. Submit comprehensive report.',
                priority: 'high'
            },
            {
                date: '2024-09-18',
                title: 'Marketing Campaign Launch',
                project: 'Marketing Campaign 2024',
                description: 'Launch Q4 marketing campaign across all platforms. Monitor initial engagement metrics.',
                priority: 'high'
            },
            {
                date: '2024-09-22',
                title: 'Mobile App Beta Testing',
                project: 'Mobile App Design',
                description: 'Begin beta testing phase with selected user group. Collect feedback and identify bugs.',
                priority: 'medium'
            },
            {
                date: '2024-09-15',
                title: 'Team Meeting - Sprint Review',
                project: 'AI Research Hub',
                description: 'Weekly sprint review meeting with the development team at 2:00 PM.',
                priority: 'low'
            },
            {
                date: '2024-09-25',
                title: 'Website Content Update',
                project: 'Website Redesign',
                description: 'Update all website content and ensure SEO optimization is complete.',
                priority: 'medium'
            }
        ];

        // Initialize calendar on page load
        document.addEventListener('DOMContentLoaded', function() {
            generateCalendar();
            simulateDatabaseConnection();
        });

        // Generate calendar grid
        function generateCalendar() {
            const calendar = document.getElementById('calendarGrid');
            const monthYear = document.getElementById('currentMonth');
            
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            
            // Update month display
            monthYear.textContent = new Date(year, month).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
            });
            
            // Clear calendar
            calendar.innerHTML = '';
            
            // Days of week headers
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            daysOfWeek.forEach(day => {
                const dayHeader = document.createElement('div');
                dayHeader.className = 'day-header';
                dayHeader.textContent = day;
                calendar.appendChild(dayHeader);
            });
            
            // Get first day and number of days in month
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const today = new Date();
            
            // Previous month days
            const prevMonthDays = new Date(year, month, 0).getDate();
            for (let i = firstDay - 1; i >= 0; i--) {
                const dayDiv = createCalendarDay(prevMonthDays - i, true, year, month - 1);
                calendar.appendChild(dayDiv);
            }
            
            // Current month days
            for (let day = 1; day <= daysInMonth; day++) {
                const dayDiv = createCalendarDay(day, false, year, month);
                
                // Check if it's today
                if (year === today.getFullYear() && 
                    month === today.getMonth() && 
                    day === today.getDate()) {
                    dayDiv.classList.add('today');
                }
                
                calendar.appendChild(dayDiv);
            }
            
            // Next month days
            const totalCells = calendar.children.length - 7; // Subtract header row
            const remainingCells = 42 - totalCells; // 6 rows × 7 days - header
            for (let day = 1; day <= remainingCells; day++) {
                const dayDiv = createCalendarDay(day, true, year, month + 1);
                calendar.appendChild(dayDiv);
            }
        }

        // Create individual calendar day
        function createCalendarDay(day, isOtherMonth, year, month) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day';
            
            if (isOtherMonth) {
                dayDiv.classList.add('other-month');
            }
            
            // Create date string
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            // Day number
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;
            dayDiv.appendChild(dayNumber);
            
            // Find deadlines for this date
            const dayDeadlines = deadlinesData.filter(deadline => deadline.date === dateStr);
            
            if (dayDeadlines.length > 0) {
                if (dayDeadlines.length > 1) {
                    dayDiv.classList.add('has-multiple-deadlines');
                } else {
                    dayDiv.classList.add('has-deadline');
                }
                
                // Add deadline items
                dayDeadlines.forEach(deadline => {
                    const deadlineDiv = document.createElement('div');
                    deadlineDiv.className = `deadline-item ${deadline.priority}-priority`;
                    deadlineDiv.textContent = deadline.title;
                    dayDiv.appendChild(deadlineDiv);
                });
                
                // Add click handler for deadline details
                dayDiv.onclick = () => showDeadlineDetails(dateStr, dayDeadlines);
            }
            
            return dayDiv;
        }

        // Show deadline details modal
        function showDeadlineDetails(date, deadlines) {
            const modal = document.getElementById('deadlineModal');
            const modalDate = document.getElementById('modalDate');
            const deadlineDetails = document.getElementById('deadlineDetails');
            
            // Format date for display
            const dateObj = new Date(date + 'T00:00:00');
            modalDate.textContent = dateObj.toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Clear and populate deadline details
            deadlineDetails.innerHTML = '';
            deadlines.forEach(deadline => {
                const detailDiv = document.createElement('div');
                detailDiv.className = 'deadline-detail';
                detailDiv.innerHTML = `
                    <div class="deadline-title">${deadline.title}</div>
                    <div class="deadline-project">Project: ${deadline.project}</div>
                    <div class="deadline-description">${deadline.description}</div>
                `;
                deadlineDetails.appendChild(detailDiv);
            });
            
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }

        // Close deadline modal
        function closeDeadlineModal() {
            document.getElementById('deadlineModal').style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        // Calendar navigation
        function previousMonth() {
            currentDate.setMonth(currentDate.getMonth() - 1);
            generateCalendar();
        }

        function nextMonth() {
            currentDate.setMonth(currentDate.getMonth() + 1);
            generateCalendar();
        }

        // View switcher (placeholder for future functionality)
        function switchView(view) {
            document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            if (view === 'week') {
                alert('Week view coming soon!');
            }
        }

        // Database integration functions
        function simulateDatabaseConnection() {
            const dbStatus = document.getElementById('dbStatus');
            
            // Simulate connection check
            setTimeout(() => {
                dbStatus.className = 'db-status connected';
                dbStatus.textContent = 'Database Connected';
            }, 1000);
        }

        async function refreshFromDatabase() {
            const dbStatus = document.getElementById('dbStatus');
            
            // Simulate database refresh
            dbStatus.className = 'db-status disconnected';
            dbStatus.textContent = 'Syncing...';
            
            try {
                // In a real application, this would be an actual API call
                await simulateAPICall();
                
                // Update deadlines data (in real app, this would come from server)
                deadlinesData = await fetchDeadlinesFromDatabase();
                
                // Regenerate calendar with new data
                generateCalendar();
                
                dbStatus.className = 'db-status connected';
                dbStatus.textContent = 'Sync Complete ✓';
                
                setTimeout(() => {
                    dbStatus.textContent = 'Database Connected';
                }, 2000);
                
            } catch (error) {
                dbStatus.className = 'db-status disconnected';
                dbStatus.textContent = 'Sync Failed ✗';
                console.error('Database sync failed:', error);
            }
        }

        // Simulate API call
        function simulateAPICall() {
            return new Promise((resolve) => {
                setTimeout(resolve, 2000); // 2 second delay
            });
        }

        // Simulate fetching deadlines from database
        async function fetchDeadlinesFromDatabase() {
            // In a real application, this would be:
            // const response = await fetch('/api/deadlines');
            // return await response.json();
            
            // For demo, return sample data with some variations
            return [
                ...deadlinesData,
                {
                    date: '2024-09-28',
                    title: 'Project Status Review',
                    project: 'Multiple Projects',
                    description: 'Weekly review of all active project statuses and milestone updates.',
                    priority: 'medium'
                }
            ];
        }

        // Navigation functions
        function goToPage(page) {
            alert(`Navigating to ${page} page...`);
            // In a real application, you would implement actual navigation
        }

        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            const modal = document.getElementById('deadlineModal');
            if (event.target === modal) {
                closeDeadlineModal();
            }
        });

        // Real database integration example (for future implementation)
        /*
        class DatabaseIntegration {
            constructor(apiUrl) {
                this.apiUrl = apiUrl;
            }
            
            async fetchDeadlines(userId) {
                try {
                    const response = await fetch(`${this.apiUrl}/deadlines/${userId}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        }
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    return await response.json();
                } catch (error) {
                    console.error('Failed to fetch deadlines:', error);
                    throw error;
                }
            }
            
            async addDeadline(deadlineData) {
                try {
                    const response = await fetch(`${this.apiUrl}/deadlines`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        },
                        body: JSON.stringify(deadlineData)
                    });
                    
                    return await response.json();
                } catch (error) {
                    console.error('Failed to add deadline:', error);
                    throw error;
                }
            }
        }
        
        // Usage:
        // const db = new DatabaseIntegration('https://api.synergyshare.com');
        // const deadlines = await db.fetchDeadlines(currentUserId);
        */
