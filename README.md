# 🎓 Workly

A complete, fully functional, responsive academic workflow management web application built with **React 18**, **Tailwind CSS**, and modern web APIs designed to streamline college and university students' academic workflows.

---

## 🌟 Core Modules & Features

### 1. 📊 Executive Dashboard
- **Summary Metrics**: Real-time cards for Total Subjects, Total Tasks, Completed Tasks, Incomplete Tasks, In-Progress Tasks, Upcoming Exams, and Deadlines.
- **Today's Tasks**: Quick checkbox-to-complete view for today's urgent submissions.
- **Upcoming Deadlines Timeline**: Dynamic urgency indicators with countdown badges.
- **Academic Progress Gauge**: Automatic $(Completed / Total) \times 100$ calculation with animated progress bar.
- **Pomodoro Study Companion**: Built-in 25-minute focus timer with sound alerts and session counter.
- **Recent Activity Feed**: Real-time timeline recording task additions, completions, and edits.

### 2. 📚 Syllabus Management System
- Subject-wise curriculum organization: `Subject → Units → Topics`.
- Real-time syllabus completion percentage bars per subject.
- Mark topics as **Completed** or **Pending**.
- Star high-yield **Important Topics** for exam revision.
- Add, Edit, and Delete units and topics dynamically.

### 3. 📝 Exam Scheduling System
- Supports all exam formats: **Internal Assessment**, **Mid-Term**, **Practical Lab**, **Viva Voce**, and **End Semester Final**.
- **Table View** & **Interactive Card View**.
- **Dynamic Countdowns**: Automatically changes status (`Upcoming`, `Today`, `Completed`) with remaining days.
- Details room numbers, timings, durations, and exam instructions.

### 4. 📋 Task Management & Sub-Tables
- **All Tasks View**: Search, filter by category/priority/subject, and multi-sort.
- **Completed Tasks Table**: Tracks completion timestamps, priority, and re-open actions.
- **Incomplete Tasks Table**: Automatic **OVERDUE** highlighting with glowing red alerts.
- **In-Progress Tasks Table**: Interactive 0–100% progress sliders directly editable inline.
- **Kanban Board View**: Agile board with draggable/movable task cards across columns.

### 5. ⏰ Reminders & Audio Notifications
- Set pre-defined offsets (10 min, 30 min, 1 hour, 1 day) or custom study alarms.
- **Web Audio API Synthesizer**: Native chime synthesizer with zero external audio assets required.
- **Browser Push Notifications**: Native desktop notification permission support.

### 6. 📅 Academic Calendar
- Month, Week, and Day views.
- Color-coded chips for Exams (Rose), Deadlines (Blue), and Reminders (Emerald).
- Click any date to view detailed event popups.

### 7. 📈 Academic Progress & Analytics
- Subject-wise comparison charts and velocity breakdowns.
- Category distribution (Assignments, Projects, Practicals, Study, Revision).
- Overdue bottleneck analytics.

### 8. ⚙️ Settings & Database Backups
- Editable Student Profile (Name, Course, Semester, Roll Number, University).
- Dark Mode / Light Mode toggle with instant theme synchronization.
- **Export JSON Backup** and **Import JSON Backup** to preserve and restore data across devices.
- One-click template reset to default university curriculum data.

---

## 🚀 How to Run

1. Open `index.html` in any modern web browser directly, OR
2. Start the local server:
   ```bash
   python3 -m http.server 3000
   ```
   Then navigate to `http://localhost:3000`.

---

## 🛠️ Technology Stack
- **Frontend Framework**: React 18
- **Styling**: Tailwind CSS & Vanilla CSS (Custom Glassmorphism, Animations)
- **Icons**: Font Awesome 6.5
- **Typography**: Google Fonts (*Outfit*, *Plus Jakarta Sans*, *JetBrains Mono*)
- **Sound**: Web Audio API Sound Synthesizer
- **Visuals**: Canvas Confetti
- **Storage**: Persistent LocalStorage Database Engine with React Context API
