/**
 * ============================================
 * CALENDAR COMPONENT
 * ============================================
 * จัดการปฏิทินและการแสดงกิจกรรม
 */

const Calendar = {
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),

    /**
     * Initialize Calendar
     */
    init() {
        console.log('📅 Initializing Calendar...');
        this.render();
        console.log('✅ Calendar initialized');
    },

    /**
     * Render Calendar Container
     */
    render() {
        const container = document.getElementById('calendar-section');
        if (!container) {
            console.error('❌ Calendar section not found');
            return;
        }

        container.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 py-16">
                <h2 class="text-3xl font-bold text-center mb-12 text-gray-800">📅 ปฏิทินกิจกรรม</h2>
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- ปฏิทินขนาดเล็ก -->
                    <div class="lg:col-span-1">
                        <div class="bg-white rounded-2xl shadow-xl p-6">
                            <div class="flex justify-between items-center mb-4">
                                <button onclick="Calendar.changeMonth(-1)" class="p-2 hover:bg-gray-100 rounded-lg">
                                    <i class="fas fa-chevron-left text-gray-600"></i>
                                </button>
                                <h3 id="calendar-month" class="text-xl font-semibold text-gray-800"></h3>
                                <button onclick="Calendar.changeMonth(1)" class="p-2 hover:bg-gray-100 rounded-lg">
                                    <i class="fas fa-chevron-right text-gray-600"></i>
                                </button>
                            </div>
                            <div id="calendar-grid" class="grid grid-cols-7 gap-1"></div>
                        </div>
                    </div>
                    
                    <!-- รายการกิจกรรมล่าสุด -->
                    <div class="lg:col-span-2">
                        <div class="bg-white rounded-2xl shadow-xl p-6">
                            <div class="flex items-center justify-between mb-6">
                                <h3 class="text-xl font-bold text-gray-800">
                                    <i class="fas fa-calendar-check text-blue-600 mr-2"></i>
                                    กิจกรรมล่าสุด
                                </h3>
                                <button onclick="Navigation.showPage('activities')" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    ดูทั้งหมด <i class="fas fa-arrow-right ml-1"></i>
                                </button>
                            </div>
                            
                            <div id="recent-activities" class="space-y-6 max-h-96 overflow-y-auto">
                                <!-- กิจกรรมจะแสดงที่นี่ -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderCalendar();
        this.renderRecentActivities();
    },

    /**
     * Render Calendar Grid
     */
    renderCalendar() {
        const monthElement = document.getElementById('calendar-month');
        const gridElement = document.getElementById('calendar-grid');

        if (!monthElement || !gridElement) {
            console.warn('⚠️ Calendar elements not found, retrying...');
            setTimeout(() => this.renderCalendar(), 100);
            return;
        }

        // Update month title
        monthElement.textContent = `${monthNames[this.currentMonth]} ${this.currentYear + 543}`;

        // Clear grid
        gridElement.innerHTML = '';

        // Render day headers
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.className = 'text-center font-semibold text-gray-600 py-2';
            header.textContent = day;
            gridElement.appendChild(header);
        });

        // Calculate calendar data
        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

        // Empty cells before first day
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            gridElement.appendChild(emptyDay);
        }

        // Render days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = this.createDayElement(day);
            gridElement.appendChild(dayElement);
        }
    },

    /**
     * Create Day Element
     */
    createDayElement(day) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day text-center py-2 cursor-pointer rounded-lg relative';

        const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayActivities = activitiesData.filter(activity => activity.date === dateStr);

        if (dayActivities.length > 0) {
            dayElement.classList.add('bg-blue-100', 'text-blue-800', 'font-semibold', 'hover:bg-blue-200');
            dayElement.innerHTML = `
                <div class="font-bold">${day}</div>
                <div class="text-xs mt-1">
                    ${dayActivities.map(activity => `
                        <div class="bg-blue-600 text-white px-1 py-0.5 rounded text-xs mb-1 truncate"
                             onclick="event.stopPropagation(); ActivitiesPage.showActivityDetails(${activity.id})"
                             title="${activity.name}">
                            ${Helpers.truncateText(activity.name, 10)}
                        </div>
                    `).join('')}
                </div>
            `;
            dayElement.onclick = () => this.showDayActivities(dateStr);
        } else {
            dayElement.textContent = day;
        }

        return dayElement;
    },

    /**
     * Change Month
     */
    changeMonth(direction) {
        this.currentMonth += direction;
        
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        } else if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        
        this.renderCalendar();
    },

    /**
     * Show Day Activities Modal
     */
    showDayActivities(dateStr) {
        const dayActivities = activitiesData.filter(activity => activity.date === dateStr);
        if (dayActivities.length === 0) return;

        if (typeof Modals !== 'undefined') {
            Modals.showDayActivities(dateStr, dayActivities);
        }
    },

    /**
     * Render Recent Activities
     */
    renderRecentActivities() {
        const container = document.getElementById('recent-activities');
        if (!container) {
            console.warn('⚠️ Recent activities container not found, retrying...');
            setTimeout(() => this.renderRecentActivities(), 100);
            return;
        }

        // เรียงกิจกรรมตามวันที่
        const sortedActivities = [...activitiesData].sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
        });

        // แสดงเฉพาะ 4 รายการแรก
        const recentActivities = sortedActivities.slice(0, 4);

        if (recentActivities.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-calendar-times text-4xl mb-4"></i>
                    <p>ยังไม่มีกิจกรรมที่กำลังจะมาถึง</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recentActivities.map((activity, index) => {
            const daysLeft = Helpers.getDaysUntilEvent(activity.date);
            const statusConfig = Helpers.getActivityStatusConfig(activity.status);
            const isUpcoming = daysLeft >= 0 && daysLeft <= 7;

            return `
                <div class="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 ${isUpcoming ? 'ring-2 ring-blue-200 bg-blue-50' : ''}">
                    <!-- Header -->
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex-1">
                            <div class="flex items-center gap-3 mb-2">
                                <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                    ${index + 1}
                                </div>
                                <div>
                                    <h4 class="font-bold text-lg text-gray-900">${activity.name}</h4>
                                    <p class="text-sm text-gray-600">${activity.club}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex flex-col items-end gap-2">
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}">
                                <i class="fas fa-circle mr-1 text-xs"></i>
                                ${statusConfig.text}
                            </span>
                            ${isUpcoming ? `
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    <i class="fas fa-fire mr-1"></i>ใกล้เข้า!
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- Details -->
                    <div class="bg-gray-50 rounded-lg p-4 mb-4">
                        <p class="text-gray-700 text-sm mb-3">${activity.description}</p>
                        
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div class="flex items-center text-gray-600">
                                <i class="fas fa-calendar-day w-4 text-center mr-3 text-blue-600"></i>
                                <div>
                                    <div class="font-medium">วันที่จัด</div>
                                    <div class="text-gray-900">${Helpers.formatDate(activity.date)}</div>
                                </div>
                            </div>
                            
                            <div class="flex items-center text-gray-600">
                                <i class="fas fa-hourglass-half w-4 text-center mr-3 text-purple-600"></i>
                                <div>
                                    <div class="font-medium">เหลือเวลา</div>
                                    <div class="text-gray-900 font-semibold">
                                        ${daysLeft === 0 ? '🔥 วันนี้!' :
                                        daysLeft === 1 ? '⚡ พรุ่งนี้' :
                                        daysLeft > 0 ? `${daysLeft} วัน` : 'ผ่านไปแล้ว'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Actions -->
                    <div class="flex gap-3">
                        ${activity.status !== 'closed' ? `
                            <button onclick="Modals.handleRegistrationClick(${activity.id})"
                                    class="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg transition-all font-medium text-sm">
                                <i class="fas fa-user-plus mr-2"></i>สมัครเข้าร่วม
                            </button>
                        ` : `
                            <button disabled class="flex-1 bg-gray-300 text-gray-500 py-3 px-4 rounded-lg cursor-not-allowed font-medium text-sm">
                                <i class="fas fa-lock mr-2"></i>ปิดรับแล้ว
                            </button>
                        `}
                        <button onclick="ActivitiesPage.showActivityDetails(${activity.id})"
                                class="px-4 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg transition-all font-medium text-sm">
                            <i class="fas fa-info-circle mr-1"></i>รายละเอียด
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Refresh Calendar
     */
    refresh() {
        this.renderCalendar();
        this.renderRecentActivities();
    }
};

// Export
window.Calendar = Calendar;
