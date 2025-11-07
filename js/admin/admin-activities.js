/**
 * ============================================
 * ADMIN ACTIVITIES MANAGEMENT
 * ============================================
 * จัดการกิจกรรมในระบบ
 */

const AdminActivities = {
    activities: [],
    currentEditingActivity: null,

    /**
     * Load activities
     */
    loadActivities() {
        console.log('🎯 Loading activities...');
        
        // โหลดจาก data.js
        this.activities = activitiesData || [];
        
        this.renderActivitiesTable();
    },

    /**
     * Render activities table
     */
    renderActivitiesTable() {
        const container = document.getElementById('activities-table-container');
        if (!container) return;

        const admin = AdminAuth.getCurrentAdmin();
        
        // กรองกิจกรรมตามสิทธิ์
        let displayActivities = this.activities;
        if (admin.role === 'club_manager') {
            // Club manager เห็นได้เฉพาะกิจกรรมของชมรมตัวเอง
            const club = clubsData.find(c => c.id === admin.clubId);
            if (club) {
                displayActivities = this.activities.filter(activity => 
                    activity.club === club.name
                );
            } else {
                displayActivities = [];
            }
        }

        if (displayActivities.length === 0) {
            showEmptyState('activities-table-container', 'ไม่มีข้อมูลกิจกรรม', 'fa-calendar-alt');
            return;
        }

        const tableHTML = `
            <div class="overflow-x-auto">
                <table class="min-w-full bg-white">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อกิจกรรม</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชมรม</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่จัด</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">การดำเนินการ</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${displayActivities.map(activity => this.renderActivityRow(activity)).join('')}
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = tableHTML;
    },

    /**
     * Render activity row
     */
    renderActivityRow(activity) {
        const canManage = AdminPermissions.canManageActivity(activity);
        const statusConfig = Helpers.getActivityStatusConfig(activity.status);

        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${activity.name}</div>
                    <div class="text-sm text-gray-500">${activity.description}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${activity.club}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${Helpers.formatDate(activity.date)}</div>
                    <div class="text-xs text-gray-500">ปิดรับ: ${Helpers.formatDate(activity.deadline)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}">
                        <i class="fas fa-circle mr-1 text-xs"></i>
                        ${statusConfig.text}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    ${canManage ? `
                        <button onclick="AdminActivities.editActivity(${activity.id})" 
                                class="text-indigo-600 hover:text-indigo-900 mr-3">
                            <i class="fas fa-edit"></i> แก้ไข
                        </button>
                        <button onclick="AdminActivities.deleteActivity(${activity.id})" 
                                class="text-red-600 hover:text-red-900">
                            <i class="fas fa-trash"></i> ลบ
                        </button>
                    ` : `
                        <span class="text-gray-400"><i class="fas fa-lock"></i> จัดการไม่ได้</span>
                    `}
                </td>
            </tr>
        `;
    },

    /**
     * Open modal
     */
    openModal(activityId = null) {
        const modal = document.getElementById('activity-modal');
        const title = document.getElementById('activity-modal-title');
        const container = document.getElementById('activity-form-container');

        if (!modal || !container) return;

        if (activityId) {
            // Edit mode
            const activity = this.activities.find(a => a.id === activityId);
            if (!activity) return;

            // ตรวจสอบสิทธิ์
            if (!AdminPermissions.canManageActivity(activity)) {
                AdminPermissions.showPermissionDenied();
                return;
            }

            title.textContent = 'แก้ไขกิจกรรม';
            this.currentEditingActivity = activity;
            this.renderActivityForm(activity);
        } else {
            // Create mode
            if (!AdminPermissions.hasPermission('create_activity')) {
                AdminPermissions.showPermissionDenied();
                return;
            }

            title.textContent = 'เพิ่มกิจกรรมใหม่';
            this.currentEditingActivity = null;
            this.renderActivityForm();
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    },

    /**
     * Render activity form
     */
    renderActivityForm(activity = null) {
        const container = document.getElementById('activity-form-container');
        if (!container) return;

        const admin = AdminAuth.getCurrentAdmin();
        
        // เตรียม dropdown ชมรม
        let clubsOptions = '';
        if (admin.role === 'admin') {
            // Admin เห็นทุกชมรม
            clubsOptions = clubsData.map(club => 
                `<option value="${club.name}" ${activity?.club === club.name ? 'selected' : ''}>${club.name}</option>`
            ).join('');
        } else if (admin.role === 'club_manager') {
            // Club manager เห็นเฉพาะชมรมตัวเอง
            clubsOptions = `<option value="${admin.clubName}" selected>${admin.clubName}</option>`;
        }

        container.innerHTML = `
            <form id="activity-form" onsubmit="AdminActivities.saveActivity(event)">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            ชื่อกิจกรรม <span class="text-red-500">*</span>
                        </label>
                        <input type="text" 
                               id="activity-name" 
                               value="${activity?.name || ''}"
                               required
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            ชมรม <span class="text-red-500">*</span>
                        </label>
                        <select id="activity-club" 
                                required
                                ${admin.role === 'club_manager' ? 'disabled' : ''}
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                            <option value="">เลือกชมรม</option>
                            ${clubsOptions}
                        </select>
                    </div>
                </div>

                <div class="mt-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        คำอธิบาย <span class="text-red-500">*</span>
                    </label>
                    <textarea id="activity-description" 
                              required
                              rows="3"
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">${activity?.description || ''}</textarea>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            วันที่จัดกิจกรรม <span class="text-red-500">*</span>
                        </label>
                        <input type="date" 
                               id="activity-date"
                               value="${activity?.date || ''}"
                               required
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            ปิดรับสมัคร <span class="text-red-500">*</span>
                        </label>
                        <input type="date" 
                               id="activity-deadline"
                               value="${activity?.deadline || ''}"
                               required
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            สถานะ <span class="text-red-500">*</span>
                        </label>
                        <select id="activity-status" 
                                required
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                            <option value="open" ${activity?.status === 'open' ? 'selected' : ''}>เปิดรับสมัคร</option>
                            <option value="closing" ${activity?.status === 'closing' ? 'selected' : ''}>ใกล้ปิดรับ</option>
                            <option value="closed" ${activity?.status === 'closed' ? 'selected' : ''}>ปิดรับแล้ว</option>
                        </select>
                    </div>
                </div>

                <div class="flex gap-4 mt-8">
                    <button type="button" 
                            onclick="closeModal('activity-modal')"
                            class="flex-1 bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg transition-colors">
                        ยกเลิก
                    </button>
                    <button type="submit"
                            class="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                        <i class="fas fa-save mr-2"></i>บันทึก
                    </button>
                </div>
            </form>
        `;
    },

    /**
     * Edit activity
     */
    editActivity(activityId) {
        this.openModal(activityId);
    },

    /**
     * Save activity
     */
    saveActivity(event) {
        event.preventDefault();

        const admin = AdminAuth.getCurrentAdmin();

        const formData = {
            name: document.getElementById('activity-name').value.trim(),
            club: document.getElementById('activity-club').value,
            description: document.getElementById('activity-description').value.trim(),
            date: document.getElementById('activity-date').value,
            deadline: document.getElementById('activity-deadline').value,
            status: document.getElementById('activity-status').value
        };

        // Validation: deadline ต้องไม่เกิน date
        if (new Date(formData.deadline) > new Date(formData.date)) {
            showError('วันปิดรับสมัครต้องไม่เกินวันที่จัดกิจกรรม');
            return;
        }

        if (this.currentEditingActivity) {
            // Update existing activity
            const index = this.activities.findIndex(a => a.id === this.currentEditingActivity.id);
            if (index !== -1) {
                this.activities[index] = {
                    ...this.activities[index],
                    ...formData,
                    updatedAt: new Date().toISOString()
                };
                
                // Update activitiesData
                const dataIndex = activitiesData.findIndex(a => a.id === this.currentEditingActivity.id);
                if (dataIndex !== -1) {
                    activitiesData[dataIndex] = this.activities[index];
                }
            }
            showSuccess('แก้ไขกิจกรรมเรียบร้อยแล้ว');
        } else {
            // Create new activity
            const newActivity = {
                id: Date.now(),
                ...formData,
                createdAt: new Date().toISOString()
            };
            this.activities.push(newActivity);
            activitiesData.push(newActivity);
            showSuccess('เพิ่มกิจกรรมเรียบร้อยแล้ว');
        }

        closeModal('activity-modal');
        this.renderActivitiesTable();
    },

    /**
     * Delete activity
     */
    deleteActivity(activityId) {
        const activity = this.activities.find(a => a.id === activityId);
        if (!activity) return;

        if (!AdminPermissions.canManageActivity(activity)) {
            AdminPermissions.showPermissionDenied();
            return;
        }

        if (!confirmAction('คุณต้องการลบกิจกรรมนี้หรือไม่?')) return;

        const index = this.activities.findIndex(a => a.id === activityId);
        if (index !== -1) {
            this.activities.splice(index, 1);
            
            const dataIndex = activitiesData.findIndex(a => a.id === activityId);
            if (dataIndex !== -1) {
                activitiesData.splice(dataIndex, 1);
            }
            
            showSuccess('ลบกิจกรรมเรียบร้อยแล้ว');
            this.renderActivitiesTable();
        }
    }
};

// Export
window.AdminActivities = AdminActivities;
