# Anomix: Live Social Media Trend Anomaly Detector

**Anomix** is a high-fidelity, real-time command center application built to detect and visualize social media trend anomalies. Designed as a cutting-edge monitoring dashboard, it enables users to observe global conversational velocity and viral spikes across platforms like Reddit using a stunning 3D Observatorium Globe and comprehensive data analytics.

![Anomix Dashboard](https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop) *(Demo visualization)*

## 🚀 Key Features

- **Live Intelligence Feed**: Ingests real-time data from social media platforms (including Reddit) to monitor trending topics and engagement velocity.
- **3D Observatorium Globe**: A highly interactive, Three.js-powered 3D visualization that maps viral trends geographically. Watch red velocity spikes appear in real-time across the globe.
- **Velocity Matrix & Regional Intel**: Switch between global views and deep-dive analytics for specific countries and anomalies.
- **Interactive Dashboards**: Seamless cross-component navigation from the monitoring dashboard to the localized globe space.
- **Premium Aesthetics**: Glassmorphism, dynamic animations, and neon accents create a professional, "command center" feel out of the box.

## 🛠️ Technology Stack

- **Core**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **3D & Visualization**: [Three.js](https://threejs.org/), [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction), [Three-Globe](https://github.com/vasturiano/three-globe), [Recharts](https://recharts.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & Framer Motion
- **Backend/Data**: [Firebase](https://firebase.google.com/) Firestore for global snapshots

---

## 🏁 Getting Started for Beginners

Follow these simple steps from your terminal to get the project running locally on your computer.

### 1. Prerequisites

Before you begin, make sure you have the following installed:
- **Node.js** (v18 or higher): [Download here](https://nodejs.org/)
- **Git**: [Download here](https://git-scm.com/)

### 2. Clone the Repository

Open your terminal (Command Prompt, PowerShell, or Terminal on Mac) and run the following command to download the code:

```bash
git clone https://github.com/Kuladeep-M-N/Anomix.git
```

Move into the project folder:

```bash
cd Anomix
```

### 3. Install Dependencies

Install all the required packages (like React, Three.js, etc.) by running:

```bash
npm install
```

### 4. Setup Environment Variables

To connect to live data, you need to configure Firebase. 
1. Create a `.env.local` file in the root directory (same folder as this README).
2. Ask the project owner for the Firebase API keys, or set up your own Firebase project and add these variables:
```env
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
```

### 5. Start the Development Server

Start the project locally so you can view it in your browser:

```bash
npm run dev
```

The terminal will give you a local URL (usually `http://localhost:5173` or `http://localhost:5174`). Open that link in your web browser!

---

## 🗺️ Navigation Guide

Once the app is running, you can explore the following routes:

- **`/`**: Landing Page (Hero section)
- **`/dashboard/monitor`**: The primary analytics dashboard. Monitor social media feeds, check sentiment analysis, and view charts.
- **`/dashboard/observatorium`**: The 3D Digital Twin visualization. 
  - Click on the glowing red spikes to focus the camera on viral anomalies.
  - Switch between **Global Pulse** (full worldview) and **Velocity Matrix** (localized mini-map analytics).

## 💡 Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit your changes: `git commit -m 'Added an amazing feature'`
3. Push to the branch: `git push origin feature/amazing-feature`
4. Open a Pull Request!

## 📄 License

This project is open-source and available for Hackathon use.
