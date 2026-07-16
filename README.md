# Lexicon: AI-Powered Vocabulary & Reading Comprehension Platform

Lexicon is a premium, gamified vocabulary builder and reading comprehension application. Powered by Google Gemini AI, it helps learners expand their English vocabulary through rich context, spaced repetition, adaptive quizzes, custom reading passages, and bilingual translations.

---

## 🌟 Key Features

### 📖 1. Interactive Vocabulary Library
*   **Comprehensive Cards**: Detailed cards showing parts of speech, CEFR difficulty (A1–C2), definitions, root origins, synonyms, antonyms, collocations, memory mnemonics, and common mistakes.
*   **Unsplash Visuals**: Automatic high-quality visual association images representing the concept of each word.
*   **Bilingual Easy Hindi Meanings**: Clean translations in simple, spoken Hindi (Devanagari script) alongside parenthetical Hinglish transliterations (e.g., `क्षणिक / थोड़े समय के लिए (thode samay ke liye)`) for quick learning.
*   **Text-to-Speech (TTS)**: Native pronunciation player with customizable speed rates and voice pitch settings.

### 🔍 2. AI-Powered Dictionary Lookup
*   Type any word in the dashboard lookup bar to query Gemini.
*   **Spelling Check / Gibberish Validation**: Rejects meaningless keysmashes or typos (e.g., `gkwhjei`) with descriptive spelling errors.
*   **One-Click Import**: Save newly discovered words directly to your local library.

### 📰 3. Reading Comprehension Mode
*   **AI-Generated Passages**: Generate 200–350 word reading articles on any custom topic.
*   **Adjustable Toughness**: 5 difficulty levels (Easy, Medium, Hard, Very Hard, Impossible) altering sentence structure and vocabulary complexity.
*   **Timer & Auto-Submit**: Configurable timer (e.g., 30s to 10 mins) with smooth countdowns, warning alerts, and automatic quiz submission upon expiry.
*   **Passage Library**: Save custom passages locally and delete them when completed.

### 📝 4. Dynamic MCQ Quiz Setup
*   **Source selection**: Quiz yourself using saved library vocabulary or paste custom list lines (e.g., `commence:to start or begin`).
*   **Filtered Lengths**: Take 5, 10, or 15-question tests with custom CEFR difficulty filtering.

### ⚙️ 5. Personalization & Settings
*   **Dark Mode & Theme Accent**: Full class-based dark mode toggle and accent color customizer (**Indigo**, **Emerald**, **Crimson**, **Amber**).
*   **Autoplay Audio Toggle**: Instantly play pronunciation audio when inspecting word cards.
*   **System Controls**: Easy database clear controls and custom passage cache resets.

---

## 🛠️ Tech Stack

*   **Frontend**: React (Hooks, Context), Vite, Tailwind CSS, Vanilla CSS (Smooth transitions)
*   **Backend**: Node.js, Express, MongoDB (Mongoose schemas)
*   **AI Service**: Gemini API (`gemini-3.1-flash-lite`, fallback models for robust uptime)

---

## 📂 Project Structure

```
Lexiocon/
├── backend/                  # Node/Express API Server
│   ├── models/Word.js        # MongoDB Word schema
│   ├── routes/words.js       # Vocabulary and AI routes
│   ├── services/geminiService# Gemini API prompts and calls
│   └── server.js             # API entrypoint
│
└── frontend/                 # React SPA Client
    ├── src/
    │   ├── components/       # UI Views (Library, Quiz, Passages, Settings)
    │   ├── App.jsx           # Routing and state coordinator
    │   └── index.css         # Styling system & global smooth animations
    └── tailwind.config.js    # Tailwind theme specifications
```

---

## ⚡ Setup & Installation

### Prerequisites
*   Node.js (v18+)
*   MongoDB Local Community Server running on `mongodb://localhost:27017`

### 1. Configure the Backend Environment
Create a `.env` file inside the `backend` folder:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lexicon
GEMINI_PASSAGE_API_KEY="YOUR_GEMINI_API_KEY"
```

### 2. Install Dependencies
```bash
# Install backend packages
cd backend
npm install

# Install frontend packages
cd ../frontend
npm install
```

### 3. Run the Development Environment
Run both backend and frontend concurrently:
```bash
# Start backend server (starts on Port 5000)
cd backend
npm start

# Start frontend Vite server (starts on Port 5173)
cd ../frontend
npm run dev
```

---

## 🎨 Design System & Animation Upgrades
*   **Smooth Navigation**: View switching utilizes custom `animate-fadeIn` entry animations with bouncy cubic-bezier curves.
*   **Fluid Theme Changes**: Theme and accent color switching utilizes hardware-accelerated transitions.
*   **Scrollbar**: Modern, unobtrusive scrollbars that blend into the light and dark visual mode surfaces.
