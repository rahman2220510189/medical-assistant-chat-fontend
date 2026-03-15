# MediCare Plus — AI-Powered Healthcare Platform

> An intelligent medical assistant that lets patients describe symptoms, get instant AI-powered diagnoses, and consult verified doctors via real-time video call — all from the browser.

![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen) ![React](https://img.shields.io/badge/React-18-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8) ![Firebase](https://img.shields.io/badge/Firebase-Auth-orange)

---

## 🎯 Problem

In Bangladesh and many developing countries, patients face long wait times, geographic barriers, and high consultation costs when trying to access quality healthcare. There is no easy way to get a quick, reliable first opinion before booking a costly doctor visit.

---

## ⚡ Solution

MediCare Plus bridges the gap between patients and doctors using AI. Patients describe symptoms in plain text, the AI instantly identifies the most likely disease, suggests medicines, and recommends the right specialist. They can then book an appointment and consult via live video call — all in one platform.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Tailwind CSS |
| Auth | Firebase Authentication |
| Payments | Stripe |
| Video Call | WebRTC + Socket.io |
| HTTP Client | Axios |
| Icons | React Icons, Lucide React |
| Deployment | Vercel |

---

## ✨ Features

### Patient
- 🤖 AI symptom checker with Groq LLM fallback
- 👨‍⚕️ Browse doctors by specialty with availability status
- 📅 Book appointments with real-time slot selection
- 💳 Stripe payment integration
- 📹 Video call with doctor (WebRTC)
- 💬 In-call chat with image sharing
- 📄 Download PDF prescription after consultation
- 🔔 Incoming call notifications (Browser Notification API)

### Doctor
- 🔐 Separate doctor authentication portal
- 📊 Dashboard with earnings, appointment stats
- ✅ Accept / reject appointments
- 📝 Write and send prescriptions digitally
- 🟢 Online / Offline status toggle

### Admin
- 📈 Platform-wide statistics dashboard
- 👨‍⚕️ Add, edit, delete doctors
- 📋 Manage all appointments and patients
- 🔑 Role management

---

## 🚀 Live Demo

🌐 **Live:** [https://medical-assistant-chat-fontend.vercel.app](https://medical-assistant-chat-fontend.vercel.app)

🎥 **Demo Video:** [Watch on Google Drive](https://drive.google.com/file/d/1T_a3GU62vFl7LXAtQPwTtLsNQeFHzYHz/view?usp=drive_link)

### Test Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@gmail.com | admin@gmail.com |
| Patient | kutu@gmail.com | kutu@gmail.com |
| Doctor | nazia@gmail.com | nazia@gmail.com |

---

## 📸 Screenshots

| Doctors Page | Doctor Dashboard |
|---|---|
| Browse verified doctors by specialty with live status | Real-time appointments, earnings, and patient management |

---

## ⚙️ Installation

```bash
# Clone the repository
git clone https://github.com/rahman2220510189/medical-assistant-chat-fontend
cd medical-assistant-chat-fontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

Add these to your `.env` file:

```env
VITE_API_URL=https://medical-assistant-backend-1.onrender.com
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

```bash
# Run development server
npm run dev

# Build for production
npm run build
```

---

## 📁 Project Structure

```
src/
├── Components/        # Reusable UI components (NavBar, etc.)
├── Pages/
│   ├── Home/          # Landing page
│   ├── Doctors/       # Doctor listing & booking
│   ├── Appointments/  # Patient appointments
│   ├── VideoCall/     # WebRTC video call
│   ├── Prescription/  # PDF prescription viewer
│   ├── Admin/         # Admin dashboard pages
│   └── Doctor/        # Doctor portal pages
├── Provider/          # AuthContext (Firebase)
├── Routes/            # React Router config
└── main.jsx
```

---

## 🔗 Related Repositories

- 🔧 **Backend API:** [medical-assistant-backend](https://github.com/rahman2220510189/medical-assistant-backend)
- 🤖 **ML Model:** [medical-assistand-ml](https://github.com/rahman2220510189/medical-assistand-ml)

---

## 👨‍💻 Author

**Riyad Rahman**
- GitHub: [@rahman2220510189](https://github.com/rahman2220510189)