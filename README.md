# English Quiz Mobile App

A React Native Web application for learning English through AI-powered quizzes and chat. Works on web, iOS, and Android.

![React Native](https://img.shields.io/badge/React_Native-0.74-blue)
![Expo](https://img.shields.io/badge/Expo-51-black)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### 📝 Quiz Mode
- AI-generated questions based on lesson content
- Real-time scoring (0-5 per question)
- Detailed feedback with grammar tips and examples
- Progress tracking with grades (A-F)
- Visual celebration on completion

### 💬 Chat Mode  
- Interactive AI English tutor
- Context-aware responses based on selected topic
- Real-time chat interface
- Message history

### 📊 History
- View all past quiz and chat sessions
- Filter by mode (Quiz/Chat)
- Expandable cards with full conversation details
- Score tracking and performance metrics

## Screenshots

| Home | Quiz | Chat | History |
|------|------|------|---------|
| User ID entry | Question & feedback | AI tutor chat | Session history |

## Tech Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - Development and build tools
- **React Navigation** - Navigation library
- **Axios** - HTTP client
- **AsyncStorage** - Local data persistence

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Backend API running (see [english-quiz-api](https://github.com/macrobian88/english-quiz-api))

## Installation

```bash
# Clone the repository
git clone https://github.com/macrobian88/english-quiz-mobile.git
cd english-quiz-mobile

# Install dependencies
npm install

# Start the development server
npx expo start
```

## Running the App

```bash
# Web
npx expo start --web

# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android

# Scan QR code with Expo Go app for physical device
npx expo start
```

## Configuration

Update the API base URL in `src/constants/config.js`:

```javascript
export const API_BASE_URL = 'http://localhost:3000';
// For production:
// export const API_BASE_URL = 'https://your-api-domain.com';
```

## Project Structure

```
english-quiz-mobile/
├── App.js                    # Main app entry with navigation
├── app.json                  # Expo configuration
├── package.json              # Dependencies
├── src/
│   ├── constants/
│   │   └── config.js         # App configuration & colors
│   ├── context/
│   │   └── UserContext.js    # User ID state management
│   ├── screens/
│   │   ├── HomeScreen.js     # Landing page
│   │   ├── QuizScreen.js     # Quiz mode
│   │   ├── ChatScreen.js     # Chat mode
│   │   └── HistoryScreen.js  # View history
│   └── services/
│       └── api.js            # API client
└── assets/                   # Images & icons
```

## API Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/topics` | GET | List available topics |
| `/api/quiz/start` | POST | Start a new quiz |
| `/api/quiz/answer` | POST | Submit quiz answer |
| `/api/quiz/status` | GET | Get quiz progress |
| `/api/chat` | POST | Send chat message |
| `/api/conversations` | GET | List user conversations |
| `/api/conversations/:id` | GET | Get conversation details |

## Usage

### 1. Set User ID
Enter any unique identifier on the home screen. This ID tracks your progress across sessions.

### 2. Start Quiz
1. Select "Start Quiz"
2. Choose a topic from the dropdown
3. Set number of questions (1-10)
4. Answer questions and receive instant feedback
5. View final results with grade

### 3. Chat with Tutor
1. Select "Chat with Tutor"
2. Choose a topic
3. Ask questions about the topic
4. Receive AI-powered explanations

### 4. View History
1. Go to "View My History"
2. Filter by All/Quiz/Chat
3. Tap a session to see details
4. Track your progress over time

## Color Scheme

| Score | Color | Meaning |
|-------|-------|---------|
| 5 | 🟢 Green | Perfect |
| 4 | 🟢 Light Green | Great |
| 3 | 🟡 Yellow | Good |
| 1-2 | 🟠 Orange | Needs Work |
| 0 | 🔴 Red | Incorrect |

## Building for Production

```bash
# Web
npx expo export:web

# iOS/Android
npx expo build:ios
npx expo build:android

# Using EAS Build
eas build --platform all
```

## Troubleshooting

### API Connection Issues
- Ensure backend is running on correct port
- Check API_BASE_URL in config.js
- For physical devices, use your computer's local IP instead of localhost

### Expo Issues
```bash
# Clear cache
npx expo start -c

# Reset dependencies
rm -rf node_modules
npm install
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## Related Projects

- [english-quiz-api](https://github.com/macrobian88/english-quiz-api) - Backend API

## License

MIT License - see LICENSE file for details
