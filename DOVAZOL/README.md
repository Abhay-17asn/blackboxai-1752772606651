# DOVAZOL Telegram Mini App

A comprehensive Telegram Mini App for the DOVAZOL token ecosystem featuring airdrop, withdrawal, boost, tasks, and referral systems.

## Features

### 🎁 Token Airdrop
- Users can claim free DOVAZOL tokens
- Automatic notifications via Telegram bot
- One-click claiming system

### 💰 Withdrawal System
- Withdraw tokens to external wallets
- Minimum threshold: 100 DOVAZOL
- Processing time: 24-48 hours
- Secure wallet address validation

### 🚀 Boost Feature
- 1.5x reward multiplier for 1 hour
- Cost: 200 DOVAZOL tokens
- Real-time countdown timer
- Enhanced task rewards

### 📋 Tasks System
- Complete tasks to earn tokens
- Daily check-in rewards
- Social media tasks
- Referral tasks
- Dynamic task completion tracking

### 👥 Referral Program
- Unique referral links for each user
- 150 DOVAZOL reward per successful referral
- Real-time leaderboard
- Track referral statistics

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: Modern CSS with gradients and animations
- **Fonts**: Google Fonts (Inter)
- **API**: RESTful API design
- **Telegram**: Telegram Bot API integration

## Project Structure

```
DOVAZOL/
├── package.json              # Project dependencies
├── server.js                 # Main server file
├── config.js                 # Configuration settings
├── README.md                 # Project documentation
├── controllers/
│   └── miniAppController.js  # Business logic
├── services/
│   └── telegramService.js    # Telegram API integration
├── routes/
│   └── index.js              # API routes
├── utils/
│   └── errorHandler.js       # Error handling middleware
├── views/
│   └── index.html            # Main HTML template
└── public/
    ├── css/
    │   └── style.css         # Styling
    └── js/
        └── app.js            # Frontend JavaScript
```

## Installation & Setup

### 1. Install Dependencies
```bash
cd DOVAZOL
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
PORT=8000
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
```

### 3. Get Telegram Bot Token
1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Create a new bot with `/newbot`
3. Get your bot token
4. Add the token to your `.env` file

### 4. Start the Application
```bash
npm start
```

The app will be available at `http://localhost:8000`

## API Endpoints

### User Management
- `POST /api/register` - Register new user
- `GET /api/user/:telegramId` - Get user profile

### Token Operations
- `POST /api/airdrop` - Claim airdrop tokens
- `POST /api/withdraw` - Process withdrawal

### Tasks & Rewards
- `GET /api/tasks` - Get available tasks
- `POST /api/tasks/complete` - Complete a task
- `POST /api/boost` - Apply reward boost

### Referral System
- `GET /api/referral/:telegramId` - Get referral data
- `POST /api/referral` - Process referral

### Health Check
- `GET /api/health` - API health status

## Configuration Options

Edit `config.js` to customize:

```javascript
{
    PORT: 8000,                    // Server port
    MIN_WITHDRAWAL_THRESHOLD: 100, // Minimum withdrawal amount
    AIRDROP_AMOUNT: 50,           // Tokens per airdrop
    TASK_REWARDS: {               // Task reward amounts
        SHARE_APP: 25,
        INVITE_FRIEND: 100,
        DAILY_CHECK: 10,
        FOLLOW_CHANNEL: 75
    },
    BOOST_COST: 200,              // Cost to activate boost
    BOOST_DURATION: 3600000,      // Boost duration (1 hour)
    REFERRAL_REWARD: 150          // Reward per referral
}
```

## Telegram Integration

### Setting up the Mini App
1. Create your bot with BotFather
2. Set the Web App URL: `/setmenubutton`
3. Configure the menu button to open your app
4. Test the integration

### Web App Features
- Automatic user authentication via Telegram
- Theme adaptation to Telegram's UI
- Native Telegram notifications
- Seamless user experience

## Development

### Demo Mode
The app includes a demo mode for testing without Telegram:
- Automatic demo user creation
- All features work in standalone mode
- Console logging for debugging

### Adding New Features
1. Add API endpoints in `routes/index.js`
2. Implement business logic in `controllers/miniAppController.js`
3. Update frontend in `public/js/app.js`
4. Style new components in `public/css/style.css`

## Security Features

- Input validation and sanitization
- Error handling and logging
- Rate limiting ready
- Secure token operations
- Environment variable protection

## Deployment

### Production Checklist
- [ ] Set production environment variables
- [ ] Configure HTTPS
- [ ] Set up database (replace in-memory storage)
- [ ] Configure logging
- [ ] Set up monitoring
- [ ] Test Telegram integration

### Recommended Hosting
- Heroku
- Vercel
- Railway
- DigitalOcean App Platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

**DOVAZOL Token Ecosystem** - Empowering users through innovative token distribution and reward systems.
