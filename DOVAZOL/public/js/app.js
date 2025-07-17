class DOVAZOLApp {
    constructor() {
        this.user = null;
        this.telegramUser = null;
        this.boostTimer = null;
        this.init();
    }

    async init() {
        try {
            // Initialize Telegram Web App
            this.initTelegramWebApp();
            
            // Initialize UI event listeners
            this.initEventListeners();
            
            // Load user data
            await this.loadUserData();
            
            // Load tasks
            await this.loadTasks();
            
            // Load referral data
            await this.loadReferralData();
            
            console.log('DOVAZOL App initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showToast('Failed to initialize app', 'error');
        }
    }

    initTelegramWebApp() {
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();
            
            // Get user data from Telegram
            this.telegramUser = tg.initDataUnsafe?.user || {
                id: 'demo_user_' + Date.now(),
                first_name: 'Demo',
                last_name: 'User',
                username: 'demo_user'
            };
            
            // Set theme
            document.body.style.backgroundColor = tg.backgroundColor || '#ffffff';
            
            console.log('Telegram WebApp initialized:', this.telegramUser);
        } else {
            // Demo mode for testing
            this.telegramUser = {
                id: 'demo_user_' + Date.now(),
                first_name: 'Demo',
                last_name: 'User',
                username: 'demo_user'
            };
            console.log('Running in demo mode');
        }
    }

    initEventListeners() {
        // Airdrop button
        document.getElementById('claimAirdrop')?.addEventListener('click', () => {
            this.claimAirdrop();
        });

        // Boost button
        document.getElementById('applyBoost')?.addEventListener('click', () => {
            this.applyBoost();
        });

        // Withdrawal button
        document.getElementById('withdrawTokens')?.addEventListener('click', () => {
            this.processWithdrawal();
        });

        // Copy referral link button
        document.getElementById('copyLink')?.addEventListener('click', () => {
            this.copyReferralLink();
        });

        // Input validation
        const withdrawAmount = document.getElementById('withdrawAmount');
        withdrawAmount?.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            const button = document.getElementById('withdrawTokens');
            if (value < 100) {
                button.disabled = true;
                button.textContent = 'Minimum 100 DOVAZOL';
            } else {
                button.disabled = false;
                button.innerHTML = '<span class="btn-text">Withdraw Tokens</span>';
            }
        });
    }

    async loadUserData() {
        try {
            // First register/get user
            await this.registerUser();
            
            // Then load user profile
            const response = await this.apiCall(`/api/user/${this.telegramUser.id}`, 'GET');
            
            if (response.success) {
                this.user = response.user;
                this.updateUI();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    async registerUser() {
        try {
            const userData = {
                telegramId: this.telegramUser.id,
                firstName: this.telegramUser.first_name,
                lastName: this.telegramUser.last_name,
                username: this.telegramUser.username
            };

            const response = await this.apiCall('/api/register', 'POST', userData);
            
            if (response.success) {
                console.log('User registered/loaded successfully');
            }
        } catch (error) {
            console.error('Error registering user:', error);
        }
    }

    async loadTasks() {
        try {
            const response = await this.apiCall(`/api/tasks?telegramId=${this.telegramUser.id}`, 'GET');
            
            if (response.success) {
                this.renderTasks(response.tasks);
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }

    async loadReferralData() {
        try {
            const response = await this.apiCall(`/api/referral/${this.telegramUser.id}`, 'GET');
            
            if (response.success) {
                this.updateReferralUI(response);
            }
        } catch (error) {
            console.error('Error loading referral data:', error);
        }
    }

    async claimAirdrop() {
        try {
            this.showLoading(true);
            
            const response = await this.apiCall('/api/airdrop', 'POST', {
                telegramId: this.telegramUser.id
            });
            
            if (response.success) {
                this.user.balance = response.newBalance;
                this.updateUI();
                this.showToast(`🎉 Claimed ${response.amount} DOVAZOL tokens!`, 'success');
                
                // Add pulse animation to balance
                const balanceElement = document.getElementById('userBalance');
                balanceElement.classList.add('pulse');
                setTimeout(() => balanceElement.classList.remove('pulse'), 2000);
            } else {
                this.showToast(response.error || 'Failed to claim airdrop', 'error');
            }
        } catch (error) {
            console.error('Error claiming airdrop:', error);
            this.showToast('Failed to claim airdrop', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async completeTask(taskId) {
        try {
            this.showLoading(true);
            
            const response = await this.apiCall('/api/tasks/complete', 'POST', {
                telegramId: this.telegramUser.id,
                taskId: taskId
            });
            
            if (response.success) {
                this.user.balance = response.newBalance;
                this.updateUI();
                this.showToast(`✅ Task completed! Earned ${response.reward} DOVAZOL`, 'success');
                
                // Reload tasks to update UI
                await this.loadTasks();
            } else {
                this.showToast(response.error || 'Failed to complete task', 'error');
            }
        } catch (error) {
            console.error('Error completing task:', error);
            this.showToast('Failed to complete task', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async applyBoost() {
        try {
            if (this.user.balance < 200) {
                this.showToast('Insufficient balance. Need 200 DOVAZOL for boost.', 'warning');
                return;
            }

            this.showLoading(true);
            
            const response = await this.apiCall('/api/boost', 'POST', {
                telegramId: this.telegramUser.id
            });
            
            if (response.success) {
                this.user.balance = response.newBalance;
                this.user.boostActive = true;
                this.user.boostExpiry = response.expiresAt;
                
                this.updateUI();
                this.startBoostTimer();
                this.showToast('🚀 Boost activated! 1.5x rewards for 1 hour', 'success');
            } else {
                this.showToast(response.error || 'Failed to apply boost', 'error');
            }
        } catch (error) {
            console.error('Error applying boost:', error);
            this.showToast('Failed to apply boost', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async processWithdrawal() {
        try {
            const walletAddress = document.getElementById('walletAddress').value.trim();
            const amount = parseInt(document.getElementById('withdrawAmount').value);
            
            if (!walletAddress) {
                this.showToast('Please enter wallet address', 'warning');
                return;
            }
            
            if (!amount || amount < 100) {
                this.showToast('Minimum withdrawal amount is 100 DOVAZOL', 'warning');
                return;
            }
            
            if (amount > this.user.balance) {
                this.showToast('Insufficient balance', 'warning');
                return;
            }

            this.showLoading(true);
            
            const response = await this.apiCall('/api/withdraw', 'POST', {
                telegramId: this.telegramUser.id,
                walletAddress: walletAddress,
                amount: amount
            });
            
            if (response.success) {
                this.user.balance = response.newBalance;
                this.updateUI();
                this.showToast(`✅ Withdrawal processed! ${amount} DOVAZOL will arrive in 24-48 hours`, 'success');
                
                // Clear form
                document.getElementById('walletAddress').value = '';
                document.getElementById('withdrawAmount').value = '';
            } else {
                this.showToast(response.error || 'Failed to process withdrawal', 'error');
            }
        } catch (error) {
            console.error('Error processing withdrawal:', error);
            this.showToast('Failed to process withdrawal', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    copyReferralLink() {
        const linkInput = document.getElementById('referralLink');
        if (linkInput && linkInput.value) {
            navigator.clipboard.writeText(linkInput.value).then(() => {
                this.showToast('📋 Referral link copied!', 'success');
            }).catch(() => {
                // Fallback for older browsers
                linkInput.select();
                document.execCommand('copy');
                this.showToast('📋 Referral link copied!', 'success');
            });
        }
    }

    renderTasks(tasks) {
        const tasksList = document.getElementById('tasksList');
        if (!tasksList) return;
        
        tasksList.innerHTML = '';
        
        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item ${task.completed ? 'task-completed' : ''}`;
            
            taskElement.innerHTML = `
                <div class="task-header">
                    <div class="task-info">
                        <div class="task-name">${task.name}</div>
                        <div class="task-description">${task.description}</div>
                    </div>
                    <div class="task-reward">${task.reward} DOVAZOL</div>
                </div>
                <div class="task-actions">
                    ${task.completed 
                        ? '<button class="btn btn-small" disabled>✅ Completed</button>'
                        : `<button class="btn btn-small" onclick="app.completeTask(${task.id})">Complete Task</button>`
                    }
                </div>
            `;
            
            tasksList.appendChild(taskElement);
        });
    }

    updateReferralUI(data) {
        // Update referral count
        const referralCount = document.getElementById('referralCount');
        if (referralCount) {
            referralCount.textContent = data.referralCount || 0;
        }
        
        // Update referral link
        const referralLink = document.getElementById('referralLink');
        if (referralLink) {
            referralLink.value = data.referralLink || '';
        }
        
        // Update leaderboard
        this.renderLeaderboard(data.leaderboard || []);
    }

    renderLeaderboard(leaderboard) {
        const leaderboardElement = document.getElementById('leaderboard');
        if (!leaderboardElement) return;
        
        if (leaderboard.length === 0) {
            leaderboardElement.innerHTML = '<div class="text-center" style="color: #718096; padding: 20px;">No data available yet</div>';
            return;
        }
        
        leaderboardElement.innerHTML = '';
        
        leaderboard.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'leaderboard-item';
            
            itemElement.innerHTML = `
                <div class="leaderboard-rank">${item.rank}</div>
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${item.name}</div>
                    <div class="leaderboard-count">${item.referralCount} referrals</div>
                </div>
            `;
            
            leaderboardElement.appendChild(itemElement);
        });
    }

    startBoostTimer() {
        if (!this.user.boostExpiry) return;
        
        const boostStatus = document.getElementById('boostStatus');
        const boostTimer = document.getElementById('boostTimer');
        
        if (!boostStatus || !boostTimer) return;
        
        boostStatus.style.display = 'block';
        
        this.boostTimer = setInterval(() => {
            const now = new Date();
            const expiry = new Date(this.user.boostExpiry);
            const timeLeft = expiry - now;
            
            if (timeLeft <= 0) {
                clearInterval(this.boostTimer);
                boostStatus.style.display = 'none';
                this.user.boostActive = false;
                this.user.boostExpiry = null;
                this.showToast('⏰ Boost expired', 'warning');
                return;
            }
            
            const minutes = Math.floor(timeLeft / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            boostTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')} remaining`;
        }, 1000);
    }

    updateUI() {
        if (!this.user) return;
        
        // Update balance
        const balanceElement = document.getElementById('userBalance');
        if (balanceElement) {
            balanceElement.textContent = `${this.user.balance} DOVAZOL`;
        }
        
        // Check if boost is active
        if (this.user.boostActive && this.user.boostExpiry) {
            const now = new Date();
            const expiry = new Date(this.user.boostExpiry);
            
            if (now < expiry) {
                this.startBoostTimer();
            } else {
                this.user.boostActive = false;
                this.user.boostExpiry = null;
            }
        }
    }

    async apiCall(endpoint, method = 'GET', data = null) {
        try {
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            
            if (data && method !== 'GET') {
                options.body = JSON.stringify(data);
            }
            
            const response = await fetch(endpoint, options);
            const result = await response.json();
            
            return result;
        } catch (error) {
            console.error('API call error:', error);
            throw error;
        }
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
        }
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 4000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DOVAZOLApp();
});

// Handle Telegram WebApp events
if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.onEvent('mainButtonClicked', () => {
        console.log('Main button clicked');
    });
    
    window.Telegram.WebApp.onEvent('backButtonClicked', () => {
        console.log('Back button clicked');
    });
}
