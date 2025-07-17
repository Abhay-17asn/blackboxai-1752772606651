const axios = require('axios');
const config = require('../config');

class TelegramService {
    constructor() {
        this.botToken = config.TELEGRAM_BOT_TOKEN;
        this.baseURL = `https://api.telegram.org/bot${this.botToken}`;
    }

    async sendNotification(telegramId, message) {
        try {
            if (!this.botToken || this.botToken === 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
                console.log(`[DEMO MODE] Would send to ${telegramId}: ${message}`);
                return { success: true, demo: true };
            }

            const response = await axios.post(`${this.baseURL}/sendMessage`, {
                chat_id: telegramId,
                text: message,
                parse_mode: 'HTML'
            });

            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error sending Telegram notification:', {
                telegramId,
                message,
                error: error.message
            });
            return { success: false, error: error.message };
        }
    }

    async sendAirdropNotification(telegramId, amount, newBalance) {
        const message = `🎉 <b>Airdrop Received!</b>\n\n💰 You received <b>${amount} DOVAZOL</b> tokens!\n📊 New Balance: <b>${newBalance} DOVAZOL</b>\n\n🚀 Keep earning more tokens by completing tasks!`;
        return await this.sendNotification(telegramId, message);
    }

    async sendWithdrawalNotification(telegramId, amount, walletAddress) {
        const message = `✅ <b>Withdrawal Processed!</b>\n\n💸 Amount: <b>${amount} DOVAZOL</b>\n🏦 To: <code>${walletAddress}</code>\n\n⏰ Processing time: 24-48 hours`;
        return await this.sendNotification(telegramId, message);
    }

    async sendTaskCompletionNotification(telegramId, taskName, reward, newBalance) {
        const message = `🎯 <b>Task Completed!</b>\n\n📋 Task: <b>${taskName}</b>\n💰 Reward: <b>${reward} DOVAZOL</b>\n📊 New Balance: <b>${newBalance} DOVAZOL</b>`;
        return await this.sendNotification(telegramId, message);
    }

    async sendReferralNotification(telegramId, referredUser, reward) {
        const message = `👥 <b>Referral Success!</b>\n\n🎉 <b>${referredUser}</b> joined using your link!\n💰 You earned <b>${reward} DOVAZOL</b> tokens!\n\n🔗 Keep sharing your referral link to earn more!`;
        return await this.sendNotification(telegramId, message);
    }

    async sendBoostNotification(telegramId, boostType, duration) {
        const message = `🚀 <b>Boost Activated!</b>\n\n⚡ Type: <b>${boostType}</b>\n⏰ Duration: <b>${duration} minutes</b>\n\n💪 Your rewards are now boosted!`;
        return await this.sendNotification(telegramId, message);
    }
}

module.exports = new TelegramService();
