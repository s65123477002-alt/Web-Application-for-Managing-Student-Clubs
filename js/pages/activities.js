/**
 * ============================================
 * ACTIVITIES PAGE
 * ============================================
 * จัดการหน้าแสดงกิจกรรม
 */

const ActivitiesPage = {
    /**
     * Initialize Activities Page
     */
    init() {
        console.log('🎯 Initializing Activities Page...');
        this.renderActivities();
        console.log('✅ Activities Page initialized');
    },

    /**
     * Render All Activities
     */
    renderActivities() {
        const openActivities = activitiesData.filter(a => a.status === 'open');
        const closingActivities = activitiesData.filter(a => a.status === 'closing');
        const closedActivities = activitiesData.filter(a => a.status === 'closed');

        this.renderActivitySection('open-activities', openActivities, 'green');
        this.renderActivitySection('closing-activities', closingActivities, 'orange');
        this.renderActivitySection('closed-activities', closedActivities, 'gray');
    },

    /**
     * Render Activity Section
     */
    renderActivitySection(containerId, activities, color) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (activities.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-8 text-gray-500">
                    <i class="fas fa-inbox text-4xl mb-3"></i>
                    <p>ยังไม่มีกิจกรรมในหมวดนี้</p>
                </div>
            `;
            return;
        }

        container.innerHTML = activities.map(activity => 
            this.renderActivityCard(activity, color)
        ).join('');
    },

    /**
     * Render Activity Card
     */
    renderActivityCard(activity, color) {
        const statusConfig = Helpers.getActivityStatusConfig(activity.status);
        const daysLeft = Helpers.getDaysUntilEvent(activity.date);
        const deadlinePassed = new Date(activity.deadline) < new Date();

        return `
            <div class="card-hover bg-white rounded-2xl shadow-lg p-6 border-l-4 border-${color}-500">
                <!-- Header -->
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-xl font-bold text-gray-800 flex-1">${activity.name}</h3>
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor} ml-2">
                        <i class="fas fa-circle mr-1 text-xs"></i>
                        ${statusConfig.text}
                    </span>
                </div>
                
                <!-- Description -->
                <p class="text-gray-600 mb-4">${activity.description}</p>
                
                <!-- Info Grid -->
                <div class="space-y-2 text-sm text-gray-600 mb-4">
                    <div class="flex items-center">
                        <i class="fas fa-users w-5 text-${color}-600 mr-2"></i>
                        <span><strong>ชมรม:</strong> ${activity.club}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-calendar mr-2 w-5 text-${color}-600"></i>
                        <span><strong>วันที่จัด:</strong> ${Helpers.formatDate(activity.date)}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-clock mr-2 w-5 text-${color}-600"></i>
                        <span><strong>ปิดรับสมัคร:</strong> ${Helpers.formatDate(activity.deadline)}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-hourglass-half mr-2 w-5 text-${color}-600"></i>
                        <span><strong>เหลือเวลา:</strong> 
                            ${daysLeft === 0 ? '🔥 วันนี้!' :
                            daysLeft === 1 ? '⚡ พรุ่งนี้' :
                            daysLeft > 0 ? `${daysLeft} วัน` : 'ผ่านไปแล้ว'}
                        </span>
                    </div>
                </div>
                
                <!-- Warning Message -->
                ${!deadlinePassed && daysLeft <= 3 && daysLeft >= 0 && activity.status !== 'closed' ? `
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <div class="flex items-center text-yellow-800">
                            <i class="fas fa-exclamation-triangle mr-2"></i>
                            <span class="text-sm font-medium">
                                ${daysLeft === 0 ? 'วันสุดท้ายในการสมัคร!' :
                                daysLeft === 1 ? 'เหลือเวลาสมัครอีก 1 วัน' :
                                `เหลือเวลาสมัครอีก ${daysLeft} วัน`}
                            </span>
                        </div>
                    </div>
                ` : ''}
                
                <!-- Action Buttons -->
                <div class="flex gap-3">
                    ${activity.status !== 'closed' && !deadlinePassed ? `
                        <button onclick="Modals.handleRegistrationClick(${activity.id})"
                                class="flex-1 bg-${color}-600 hover:bg-${color}-700 text-white py-3 px-4 rounded-lg transition-colors font-medium shadow-md hover:shadow-lg">
                            <i class="fas fa-user-plus mr-2"></i>สมัครเข้าร่วม
                        </button>
                        <button onclick="ActivitiesPage.showActivityDetails(${activity.id})"
                                class="px-4 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-800 rounded-lg transition-all font-medium">
                            <i class="fas fa-info-circle mr-1"></i>รายละเอียด
                        </button>
                    ` : `
                        <button disabled 
                                class="flex-1 bg-gray-300 text-gray-500 py-3 px-4 rounded-lg cursor-not-allowed font-medium">
                            <i class="fas fa-lock mr-2"></i>ปิดรับสมัครแล้ว
                        </button>
                        <button onclick="ActivitiesPage.showActivityDetails(${activity.id})"
                                class="px-4 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-800 rounded-lg transition-all font-medium">
                            <i class="fas fa-info-circle mr-1"></i>ดูรายละเอียด
                        </button>
                    `}
                </div>
            </div>
        `;
    },

    /**
     * Show Activity Details
     */
    showActivityDetails(activityId) {
        const activity = activitiesData.find(a => a.id === activityId);
        if (!activity) return;

        const modal = document.getElementById('registration-modal');
        const content = document.getElementById('registration-content');

        if (!modal || !content) return;

        const statusConfig = Helpers.getActivityStatusConfig(activity.status);
        const daysLeft = Helpers.getDaysUntilEvent(activity.date);

        content.innerHTML = `
            <div class="space-y-6">
                <!-- Header -->
                <div class="text-center border-b pb-4">
                    <div class="inline-flex items-center px-4 py-2 rounded-full ${statusConfig.bgColor} ${statusConfig.textColor} mb-3">
                        <i class="fas fa-circle mr-2 text-xs"></i>
                        ${statusConfig.text}
                    </div>
                    <h4 class="text-2xl font-bold text-gray-800">${activity.name}</h4>
                    <p class="text-gray-600 mt-2">${activity.club}</p>
                </div>
                
                <!-- Description -->
                <div class="bg-gray-50 rounded-lg p-4">
                    <h5 class="font-semibold text-gray-800 mb-2">รายละเอียดกิจกรรม</h5>
                    <p class="text-gray-700">${activity.description}</p>
                </div>
                
                <!-- Info Grid -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-blue-50 rounded-lg p-4">
                        <div class="flex items-center mb-2">
                            <i class="fas fa-calendar-day text-blue-600 mr-2"></i>
                            <span class="font-medium text-gray-700">วันที่จัดกิจกรรม</span>
                        </div>
                        <p class="text-gray-900 font-semibold">${Helpers.formatDate(activity.date)}</p>
                    </div>
                    
                    <div class="bg-orange-50 rounded-lg p-4">
                        <div class="flex items-center mb-2">
                            <i class="fas fa-clock text-orange-600 mr-2"></i>
                            <span class="font-medium text-gray-700">ปิดรับสมัคร</span>
                        </div>
                        <p class="text-gray-900 font-semibold">${Helpers.formatDate(activity.deadline)}</p>
                    </div>
                    
                    <div class="bg-purple-50 rounded-lg p-4">
                        <div class="flex items-center mb-2">
                            <i class="fas fa-hourglass-half text-purple-600 mr-2"></i>
                            <span class="font-medium text-gray-700">เหลือเวลา</span>
                        </div>
                        <p class="text-gray-900 font-semibold">
                            ${daysLeft === 0 ? '🔥 วันนี้!' :
                            daysLeft === 1 ? '⚡ พรุ่งนี้' :
                            daysLeft > 0 ? `${daysLeft} วัน` : 'ผ่านไปแล้ว'}
                        </p>
                    </div>
                    
                    <div class="bg-green-50 rounded-lg p-4">
                        <div class="flex items-center mb-2">
                            <i class="fas fa-users text-green-600 mr-2"></i>
                            <span class="font-medium text-gray-700">จัดโดย</span>
                        </div>
                        <p class="text-gray-900 font-semibold">${activity.club}</p>
                    </div>
                </div>
                
                <!-- Action Section -->
                ${activity.status !== 'closed' ? `
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div class="flex items-start">
                            <i class="fas fa-info-circle text-blue-600 text-xl mr-3 mt-1"></i>
                            <div class="flex-1">
                                <h5 class="font-medium text-blue-900 mb-2">ต้องการสมัครกิจกรรมนี้?</h5>
                                <p class="text-blue-700 text-sm mb-3">กรอกข้อมูลเพื่อสมัครเข้าร่วมกิจกรรม ทางชมรมจะติดต่อกลับภายใน 3 วันทำการ</p>
                                <button onclick="Modals.closeRegistration(); setTimeout(() => Modals.handleRegistrationClick(${activity.id}), 100);"
                                        class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors font-medium">
                                    <i class="fas fa-user-plus mr-2"></i>สมัครเข้าร่วมกิจกรรม
                                </button>
                            </div>
                        </div>
                    </div>
                ` : `
                    <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                        <i class="fas fa-lock text-gray-400 text-4xl mb-3"></i>
                        <h5 class="font-medium text-gray-700 mb-2">กิจกรรมนี้ปิดรับสมัครแล้ว</h5>
                        <p class="text-gray-600 text-sm">ติดตามกิจกรรมอื่นๆ ที่น่าสนใจได้ในหน้ากิจกรรม</p>
                    </div>
                `}
                
                <!-- Close Button -->
                <div class="flex justify-end pt-2">
                    <button onclick="Modals.closeRegistration()" 
                            class="bg-gray-300 hover:bg-gray-400 px-6 py-2 rounded-lg transition-colors font-medium">
                        ปิด
                    </button>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    },

    /**
     * Filter Activities by Status
     */
    filterByStatus(status) {
        const sections = {
            'open': 'open-activities',
            'closing': 'closing-activities',
            'closed': 'closed-activities'
        };

        // Scroll to section
        const sectionId = sections[status];
        if (sectionId) {
            const section = document.getElementById(sectionId);
            if (section) {
                section.parentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    },

    /**
     * Refresh Activities
     */
    refresh() {
        this.renderActivities();
    }
};

// Export
window.ActivitiesPage = ActivitiesPage;
