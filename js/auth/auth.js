/**
 * ============================================
 * AUTHENTICATION MODULE (Updated)
 * ============================================
 * จัดการระบบ Login, Register, Logout
 * ใช้ รหัสนักศึกษา + รหัสผ่าน
 */

const Auth = {
    currentUser: null,
    registeredUsers: [],
    
    // ข้อมูลทดสอบ
    testAccounts: [
        {
            studentId: '12345678901',
            password: 'password123',
            fullName: 'สมชาย ใจดี',
            email: 'somchai@example.com',
            faculty: 'วิทยาศาสตร์และเทคโนโลยี',
            major: 'วิทยาการคอมพิวเตอร์',
            phone: '0812345678'
        },
        {
            studentId: '98765432109',
            password: 'test456',
            fullName: 'สมหญิง รักเรียน',
            email: 'somying@example.com',
            faculty: 'ครุศาสตร์',
            major: 'การศึกษาปฐมวัย',
            phone: '0898765432'
        }
    ],

    /**
     * Initialize Auth module
     */
    init(savedUser = null) {
        console.log('🔐 Initializing Auth module...');
        
        this.currentUser = savedUser;
        this.registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        
        // เพิ่มบัญชีทดสอบถ้ายังไม่มี
        this.initializeTestAccounts();
        
        this.renderLoginForm();
        this.renderRegisterForm();
        this.updateLoginStatus();
        this.showTestAccountsInfo();
        
        console.log('✅ Auth module initialized');
    },

    /**
     * Initialize test accounts
     */
    initializeTestAccounts() {
        this.testAccounts.forEach(testAccount => {
            const exists = this.registeredUsers.some(
                user => user.studentId === testAccount.studentId
            );
            
            if (!exists) {
                this.registeredUsers.push({
                    ...testAccount,
                    registeredAt: new Date().toISOString(),
                    isTestAccount: true
                });
            }
        });
        
        App.setState('registeredUsers', this.registeredUsers);
    },

    /**
     * Show test accounts info in console
     */
    showTestAccountsInfo() {
        console.log('🧪 บัญชีทดสอบระบบ:');
        this.testAccounts.forEach((account, index) => {
            console.log(`\n👤 บัญชีที่ ${index + 1}:`);
            console.log(`   รหัสนักศึกษา: ${account.studentId}`);
            console.log(`   รหัสผ่าน: ${account.password}`);
            console.log(`   ชื่อ: ${account.fullName}`);
        });
        console.log('\n💡 ใช้ข้อมูลด้านบนสำหรับทดสอบระบบ');
    },

    /**
     * Show login modal
     */
    showLoginModal() {
        console.log('📝 Opening login modal...');
        const modal = document.getElementById('login-modal');
        if (!modal) {
            console.error('❌ Login modal not found!');
            return;
        }
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        this.switchTab('login');
    },

    /**
     * Close login modal
     */
    closeLoginModal() {
        const modal = document.getElementById('login-modal');
        if (!modal) return;
        
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        
        this.clearForms();
        this.switchTab('login');
    },

    /**
     * Switch between login/register tabs
     */
    switchTab(tabName) {
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        const loginBtn = document.getElementById('login-tab-btn');
        const registerBtn = document.getElementById('register-tab-btn');

        if (!loginTab || !registerTab) return;

        if (tabName === 'login') {
            loginTab.classList.remove('hidden');
            registerTab.classList.add('hidden');
            loginBtn.classList.add('bg-blue-600', 'text-white');
            loginBtn.classList.remove('text-gray-600');
            registerBtn.classList.remove('bg-green-600', 'text-white');
            registerBtn.classList.add('text-gray-600');
        } else {
            loginTab.classList.add('hidden');
            registerTab.classList.remove('hidden');
            registerBtn.classList.add('bg-green-600', 'text-white');
            registerBtn.classList.remove('text-gray-600');
            loginBtn.classList.remove('bg-blue-600', 'text-white');
            loginBtn.classList.add('text-gray-600');
        }
    },

    /**
     * Render login form
     */
    renderLoginForm() {
        const container = document.getElementById('login-tab');
        if (!container) return;

        container.innerHTML = `
            <div class="text-center mb-6">
                <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-user text-white text-2xl"></i>
                </div>
                <h3 class="text-2xl font-bold text-gray-800">เข้าสู่ระบบ</h3>
                <p class="text-gray-600 mt-2">กรุณาเข้าสู่ระบบเพื่อสมัครกิจกรรม</p>
            </div>
            
            <!-- Test Accounts Info -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div class="flex items-start">
                    <i class="fas fa-info-circle text-blue-600 mt-1 mr-3"></i>
                    <div class="flex-1 text-sm">
                        <p class="font-semibold text-blue-900 mb-2">🧪 บัญชีทดสอบ:</p>
                        <div class="space-y-2 text-blue-800">
                            <div class="bg-white rounded p-2">
                                <div><strong>รหัส:</strong> 12345678901</div>
                                <div><strong>รหัสผ่าน:</strong> password123</div>
                            </div>
                            <div class="bg-white rounded p-2">
                                <div><strong>รหัส:</strong> 98765432109</div>
                                <div><strong>รหัสผ่าน:</strong> test456</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-id-card mr-1"></i>รหัสนักศึกษา
                    </label>
                    <input type="text" id="login-student-id" maxlength="11"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="กรอกรหัสนักศึกษา 11 หลัก">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-lock mr-1"></i>รหัสผ่าน
                    </label>
                    <div class="relative">
                        <input type="password" id="login-password"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="กรอกรหัสผ่าน">
                        <button type="button" onclick="Auth.togglePassword('login-password')" 
                                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                            <i class="fas fa-eye" id="login-password-icon"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="flex gap-4 mt-8">
                <button onclick="Auth.closeLoginModal()"
                        class="flex-1 bg-gray-300 hover:bg-gray-400 px-4 py-3 rounded-lg transition-colors font-medium">
                    ยกเลิก
                </button>
                <button onclick="Auth.confirmLogin()"
                        class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors font-medium">
                    <i class="fas fa-sign-in-alt mr-2"></i>เข้าสู่ระบบ
                </button>
            </div>
            
            <div class="mt-4 text-center text-sm text-gray-600">
                ยังไม่มีบัญชี? 
                <button onclick="Auth.switchTab('register')" class="text-blue-600 hover:text-blue-800 font-medium">
                    สมัครสมาชิก
                </button>
            </div>
        `;
    },

    /**
     * Render register form
     */
    renderRegisterForm() {
        const container = document.getElementById('register-tab');
        if (!container) return;

        container.innerHTML = `
            <div class="text-center mb-6">
                <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-user-plus text-white text-2xl"></i>
                </div>
                <h3 class="text-2xl font-bold text-gray-800">สมัครสมาชิก</h3>
                <p class="text-gray-600 mt-2">สร้างบัญชีใหม่เพื่อเข้าร่วมกิจกรรม</p>
            </div>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        ชื่อ-นามสกุล <span class="text-red-500">*</span>
                    </label>
                    <input type="text" id="register-full-name" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="กรอกชื่อ-นามสกุล">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        รหัสนักศึกษา <span class="text-red-500">*</span>
                    </label>
                    <input type="text" id="register-student-id" maxlength="11" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="กรอกรหัสนักศึกษา 11 หลัก">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        รหัสผ่าน <span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                        <input type="password" id="register-password" required
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="กรอกรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)">
                        <button type="button" onclick="Auth.togglePassword('register-password')" 
                                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                            <i class="fas fa-eye" id="register-password-icon"></i>
                        </button>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        ยืนยันรหัสผ่าน <span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                        <input type="password" id="register-password-confirm" required
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="กรอกรหัสผ่านอีกครั้ง">
                        <button type="button" onclick="Auth.togglePassword('register-password-confirm')" 
                                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                            <i class="fas fa-eye" id="register-password-confirm-icon"></i>
                        </button>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        อีเมล <span class="text-red-500">*</span>
                    </label>
                    <input type="email" id="register-email" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="กรอกอีเมล">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            คณะ <span class="text-red-500">*</span>
                        </label>
                        <select id="register-faculty" required
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                            <option value="">เลือกคณะ</option>
                            <option value="ครุศาสตร์">ครุศาสตร์</option>
                            <option value="วิทยาศาสตร์และเทคโนโลยี">วิทยาศาสตร์และเทคโนโลยี</option>
                            <option value="มนุษยศาสตร์และสังคมศาสตร์">มนุษยศาสตร์และสังคมศาสตร์</option>
                            <option value="วิศวกรรมศาสตร์">วิศวกรรมศาสตร์</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            สาขา <span class="text-red-500">*</span>
                        </label>
                        <input type="text" id="register-major" required
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="กรอกสาขาวิชา">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        เบอร์โทรศัพท์ <span class="text-red-500">*</span>
                    </label>
                    <input type="tel" id="register-phone" maxlength="10" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="กรอกเบอร์โทรศัพท์ 10 หลัก">
                </div>
            </div>
            
            <div class="flex gap-4 mt-8">
                <button onclick="Auth.closeLoginModal()"
                        class="flex-1 bg-gray-300 hover:bg-gray-400 px-4 py-3 rounded-lg transition-colors font-medium">
                    ยกเลิก
                </button>
                <button onclick="Auth.confirmRegister()"
                        class="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors font-medium">
                    <i class="fas fa-user-check mr-2"></i>สมัครสมาชิก
                </button>
            </div>
            
            <div class="mt-4 text-center text-sm text-gray-600">
                มีบัญชีอยู่แล้ว? 
                <button onclick="Auth.switchTab('login')" class="text-blue-600 hover:text-blue-800 font-medium">
                    เข้าสู่ระบบ
                </button>
            </div>
        `;
    },

    /**
     * Toggle password visibility
     */
    togglePassword(inputId) {
        const input = document.getElementById(inputId);
        const icon = document.getElementById(inputId + '-icon');
        
        if (!input || !icon) return;
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    },

    /**
     * Confirm login
     */
    confirmLogin() {
        const studentId = document.getElementById('login-student-id')?.value.trim();
        const password = document.getElementById('login-password')?.value;

        if (!studentId || !password) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        if (!/^\d{11}$/.test(studentId)) {
            alert('กรุณากรอกรหัสนักศึกษาให้ถูกต้อง (11 หลัก)');
            return;
        }

        // ตรวจสอบ username และ password
        const user = this.registeredUsers.find(u => 
            u.studentId === studentId && u.password === password
        );
        
        if (!user) {
            alert('รหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง');
            return;
        }

        this.currentUser = user;
        App.setState('currentUser', this.currentUser);
        this.closeLoginModal();
        this.updateLoginStatus();
        
        const welcomeMsg = user.isTestAccount 
            ? `เข้าสู่ระบบสำเร็จ! (บัญชีทดสอบ)\nยินดีต้อนรับ ${user.fullName}`
            : `เข้าสู่ระบบสำเร็จ!\nยินดีต้อนรับ ${user.fullName}`;
        
        alert(welcomeMsg);
        
        if (typeof NotificationSystem !== 'undefined') {
            NotificationSystem.notifyWelcome(user.fullName);
        }
        // Handle pending registration
        const pendingId = localStorage.getItem('pendingRegistration');
        if (pendingId) {
            localStorage.removeItem('pendingRegistration');
            setTimeout(() => Modals.openRegistration(parseInt(pendingId)), 500);
        }
    },

    /**
     * Confirm register
     */
    confirmRegister() {
        const fullName = document.getElementById('register-full-name')?.value.trim();
        const studentId = document.getElementById('register-student-id')?.value.trim();
        const password = document.getElementById('register-password')?.value;
        const passwordConfirm = document.getElementById('register-password-confirm')?.value;
        const email = document.getElementById('register-email')?.value.trim();
        const faculty = document.getElementById('register-faculty')?.value;
        const major = document.getElementById('register-major')?.value.trim();
        const phone = document.getElementById('register-phone')?.value.trim();

        // Validation
        if (!fullName || !studentId || !password || !passwordConfirm || !email || !faculty || !major || !phone) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        if (!/^\d{11}$/.test(studentId)) {
            alert('กรุณากรอกรหัสนักศึกษาให้ถูกต้อง (11 หลัก)');
            return;
        }

        if (password.length < 6) {
            alert('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            return;
        }

        if (password !== passwordConfirm) {
            alert('รหัสผ่านไม่ตรงกัน');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('กรุณากรอกอีเมลให้ถูกต้อง');
            return;
        }

        if (!/^0\d{9}$/.test(phone)) {
            alert('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)');
            return;
        }

        if (this.registeredUsers.some(u => u.studentId === studentId)) {
            alert('รหัสนักศึกษานี้ได้ลงทะเบียนแล้ว');
            return;
        }

        // Create new user
        const newUser = {
            studentId, 
            password,
            fullName, 
            email, 
            faculty, 
            major, 
            phone,
            registeredAt: new Date().toISOString(),
            isTestAccount: false
        };

        this.registeredUsers.push(newUser);
        App.setState('registeredUsers', this.registeredUsers);
        this.currentUser = newUser;
        App.setState('currentUser', newUser);

        this.closeLoginModal();
        this.updateLoginStatus();
        alert(`สมัครสมาชิกสำเร็จ!\nยินดีต้อนรับ ${fullName}\n\nรหัสนักศึกษา: ${studentId}\nรหัสผ่าน: ${password}\n\n⚠️ กรุณาจดจำรหัสผ่านของคุณ`);
    },

    /**
     * Logout
     */
    logout() {
        if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
            this.currentUser = null;
            App.setState('currentUser', null);
            this.updateLoginStatus();
            alert('ออกจากระบบเรียบร้อยแล้ว');
            Navigation.showPage('home');
        }
    },

    /**
     * Update login status UI
     */
    updateLoginStatus() {
        const loginBtn = document.getElementById('login-btn');
        const userStatus = document.getElementById('user-status');
        const userGreeting = document.getElementById('user-greeting');

        if (this.currentUser) {
            loginBtn?.classList.add('hidden');
            userStatus?.classList.remove('hidden');
            if (userGreeting) {
                const testBadge = this.currentUser.isTestAccount ? ' 🧪' : '';
                userGreeting.textContent = `${this.currentUser.fullName}${testBadge}`;
            }
        } else {
            loginBtn?.classList.remove('hidden');
            userStatus?.classList.add('hidden');
        }
    },

    /**
     * Clear all forms
     */
    clearForms() {
        const fields = [
            'login-student-id', 'login-password',
            'register-full-name', 'register-student-id', 'register-password',
            'register-password-confirm', 'register-email',
            'register-faculty', 'register-major', 'register-phone'
        ];
        
        fields.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
    }
};

window.Auth = Auth;
