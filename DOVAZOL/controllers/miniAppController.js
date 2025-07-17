const telegramService = require('../services/telegramService');
const config = require('../config');

// In-memory storage (replace with database in production)
let users = {};
let tasks = [
    {
        id: 1,
        name: 'Share App',
        description: 'Share the DOVAZOL app with your friends',
        reward: config.TASK_REWARDS.SHARE_APP,
        type: 'share'
    },
    {
        id: 2,
        name: 'Invite Friend',
        description: 'Invite a friend to join DOVAZOL',
        reward: config.TASK_REWARDS.INVITE_FRIEND,
        type: 'invite'
    },
    {
        id: 3,
        name: 'Daily Check-in',
        description: 'Check in daily to earn tokens',
        reward: config.TASK_REWARDS.DAILY_CHECK,
        type: 'daily'
    },
    {
        id: 4,
        name: 'Follow Channel',
        description: 'Follow our official Telegram channel',
        reward: config.TASK_REWARDS.FOLLOW_CHANNEL,
        type: 'follow'
    }
];

class MiniAppController {
    // Register a new user
    async registerUser(req, res, next) {
        try {
            const { telegramId, firstName, lastName, username } = req.body;
            
            if (!telegramId) {
                return res.status(400).json({
                    success: false,
                    error: 'Telegram ID is required'
                });
            }

            const name = `${firstName || ''} ${lastName || ''}`.trim() || username || 'User';
            
            // Check if user already exists
            if (users[telegramId]) {
                return res.status(200).json({
                    success: true,
                    message: 'User already registered',
                    user: users[telegramId]
                });
            }

            // Create new user
            users[telegramId] = {
                telegramId,
                name,
                username,
                balance: 0,
                referralLink: `https://t.me/DOVAZOLBot?start=${telegramId}`,
                referralCount: 0,
                completedTasks: [],
                lastDailyCheck: null,
                boostActive: false,
                boostExpiry: null,
                joinDate: new Date().toISOString()
            };

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                user: users[telegramId]
            });

        } catch (error) {
            next(error);
        }
    }

    // Get user profile
    async getUserProfile(req, res, next) {
        try {
            const { telegramId } = req.params;
            
            if (!users[telegramId]) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            res.status(200).json({
                success: true,
                user: users[telegramId]
            });

        } catch (error) {
            next(error);
        }
    }

    // Trigger airdrop
    async triggerAirdrop(req, res, next) {
        try {
            const { telegramId } = req.body;
            
            if (!telegramId || !users[telegramId]) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            const user = users[telegramId];
            const airdropAmount = config.AIRDROP_AMOUNT;
            
            // Add tokens to user balance
            user.balance += airdropAmount;
            user.lastAirdrop = new Date().toISOString();

            // Send notification
            await telegramService.sendAirdropNotification(telegramId, airdropAmount, user.balance);

            res.status(200).json({
                success: true,
                message: 'Airdrop claimed successfully',
                amount: airdropAmount,
                newBalance: user.balance
            });

        } catch (error) {
            next(error);
        }
    }

    // Process withdrawal
    async processWithdrawal(req, res, next) {
        try {
            const { telegramId, walletAddress, amount } = req.body;
            
            if (!telegramId || !walletAddress || !amount) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields'
                });
            }

            if (!users[telegramId]) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            const user = users[telegramId];

            // Check minimum withdrawal threshold
            if (amount < config.MIN_WITHDRAWAL_THRESHOLD) {
                return res.status(400).json({
                    success: false,
                    error: `Minimum withdrawal amount is ${config.MIN_WITHDRAWAL_THRESHOLD} DOVAZOL`
                });
            }

            // Check if user has sufficient balance
            if (user.balance < amount) {
                return res.status(400).json({
                    success: false,
                    error: 'Insufficient balance'
                });
            }

            // Process withdrawal
            user.balance -= amount;
            user.lastWithdrawal = {
                amount,
                walletAddress,
                timestamp: new Date().toISOString(),
                status: 'processing'
            };

            // Send notification
            await telegramService.sendWithdrawalNotification(telegramId, amount, walletAddress);

            res.status(200).json({
                success: true,
                message: 'Withdrawal request processed',
                amount,
                newBalance: user.balance,
                estimatedTime: '24-48 hours'
            });

        } catch (error) {
            next(error);
        }
    }

    // Get available tasks
    async getTasks(req, res, next) {
        try {
            const { telegramId } = req.query;
            
            if (!telegramId || !users[telegramId]) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            const user = users[telegramId];
            const availableTasks = tasks.map(task => ({
                ...task,
                completed: user.completedTasks.includes(task.id),
                canComplete: this.canCompleteTask(user, task)
            }));

            res.status(200).json({
                success: true,
                tasks: availableTasks
            });

        } catch (error) {
            next(error);
        }
    }

    // Complete a task
    async completeTask(req, res, next) {
        try {
            const { telegramId, taskId } = req.body;
            
            if (!telegramId || !taskId) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields'
                });
            }

            if (!users[telegramId]) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            const user = users[telegramId];
            const task = tasks.find(t => t.id === taskId);

            if (!task) {
                return res.status(404).json({
                    success: false,
                    error: 'Task not found'
                });
            }

            // Check if task already completed
            if (user.completedTasks.includes(taskId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Task already completed'
                });
            }

            // Check if user can complete this task
            if (!this.canCompleteTask(user, task)) {
                return res.status(400).json({
                    success: false,
                    error: 'Task cannot be completed at this time'
                });
            }

            // Complete the task
            user.completedTasks.push(taskId);
            let reward = task.reward;

            // Apply boost if active
            if (user.boostActive && new Date() < new Date(user.boostExpiry)) {
                reward = Math.floor(reward * 1.5); // 50% boost
            }

            user.balance += reward;

            // Update daily check timestamp if it's a daily task
            if (task.type === 'daily') {
                user.lastDailyCheck = new Date().toISOString();
            }

            // Send notification
            await telegramService.sendTaskCompletionNotification(telegramId, task.name, reward, user.balance);

            res.status(200).json({
                success: true,
                message: 'Task completed successfully',
                task: task.name,
                reward,
                newBalance: user.balance
            });

        } catch (error) {
            next(error);
        }
    }

    // Apply boost
    async applyBoost(req, res, next) {
        try {
            const { telegramId, boostType = 'reward_multiplier' } = req.body;
            
            if (!telegramId) {
                return res.status(400).json({
                    success: false,
                    error: 'Telegram ID is required'
                });
            }

            if (!users[telegramId]) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            const user = users[telegramId];

            // Check if user has sufficient balance
            if (user.balance < config.BOOST_COST) {
                return res.status(400).json({
                    success: false,
                    error: `Insufficient balance. Boost costs ${config.BOOST_COST} DOVAZOL`
                });
            }

            // Check if boost is already active
            if (user.boostActive && new Date() < new Date(user.boostExpiry)) {
                return res.status(400).json({
                    success: false,
                    error: 'Boost is already active'
                });
            }

            // Apply boost
            user.balance -= config.BOOST_COST;
            user.boostActive = true;
            user.boostExpiry = new Date(Date.now() + config.BOOST_DURATION).toISOString();

            const durationMinutes = config.BOOST_DURATION / 60000;

            // Send notification
            await telegramService.sendBoostNotification(telegramId, boostType, durationMinutes);

            res.status(200).json({
                success: true,
                message: 'Boost activated successfully',
                boostType,
                duration: durationMinutes,
                newBalance: user.balance,
                expiresAt: user.boostExpiry
            });

        } catch (error) {
            next(error);
        }
    }

    // Get referral details
    async getReferralDetails(req, res, next) {
        try {
            const { telegramId } = req.params;
            
            if (!users[telegramId]) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            const user = users[telegramId];

            // Get leaderboard (top 10 referrers)
            const leaderboard = Object.values(users)
                .sort((a, b) => b.referralCount - a.referralCount)
                .slice(0, 10)
                .map((u, index) => ({
                    rank: index + 1,
                    name: u.name,
                    referralCount: u.referralCount
                }));

            res.status(200).json({
                success: true,
                referralLink: user.referralLink,
                referralCount: user.referralCount,
                leaderboard
            });

        } catch (error) {
            next(error);
        }
    }

    // Process referral
    async processReferral(req, res, next) {
        try {
            const { telegramId, referrerId } = req.body;
            
            if (!telegramId || !referrerId) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields'
                });
            }

            if (telegramId === referrerId) {
                return res.status(400).json({
                    success: false,
                    error: 'Cannot refer yourself'
                });
            }

            if (!users[telegramId] || !users[referrerId]) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            const referrer = users[referrerId];
            const newUser = users[telegramId];

            // Check if referral already processed
            if (newUser.referredBy) {
                return res.status(400).json({
                    success: false,
                    error: 'User already referred by someone else'
                });
            }

            // Process referral
            referrer.referralCount += 1;
            referrer.balance += config.REFERRAL_REWARD;
            newUser.referredBy = referrerId;

            // Send notification to referrer
            await telegramService.sendReferralNotification(referrerId, newUser.name, config.REFERRAL_REWARD);

            res.status(200).json({
                success: true,
                message: 'Referral processed successfully',
                referrerReward: config.REFERRAL_REWARD
            });

        } catch (error) {
            next(error);
        }
    }

    // Helper method to check if user can complete a task
    canCompleteTask(user, task) {
        if (task.type === 'daily') {
            const lastCheck = user.lastDailyCheck ? new Date(user.lastDailyCheck) : null;
            const today = new Date();
            
            if (!lastCheck) return true;
            
            // Check if it's a new day
            return lastCheck.toDateString() !== today.toDateString();
        }
        
        return true;
    }
}

module.exports = new MiniAppController();
