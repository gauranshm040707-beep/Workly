// Dynamic Academic Workflow Management System - React 18 Engine & Multi-Profile System
const { useState, useEffect, useMemo, useRef, useCallback, createContext, useContext } = React;

// -------------------------------------------------------------
// SOUND SYNTHESIZER UTILITY (Web Audio API)
// -------------------------------------------------------------
const playAudioChime = (type = 'success') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    if (type === 'success' || type === 'complete') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'reminder' || type === 'alert' || type === 'switch') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.setValueAtTime(440, now + 0.15); // A4
      osc.frequency.setValueAtTime(880, now + 0.3); // A5
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === 'delete') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {
    console.warn("Audio chime failed to play", e);
  }
};

// -------------------------------------------------------------
// AVATAR PRESETS FOR PROFILE CREATION
// -------------------------------------------------------------
const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=250"
];

// -------------------------------------------------------------
// INITIAL PROFILES
// -------------------------------------------------------------
const DEFAULT_PROFILES = [
  {
    id: "usr-1",
    name: "Gauransh Mittal",
    email: "gauransh.mittal@university.edu",
    course: "B.Tech Computer Science & Engineering",
    semester: "Semester 5 (Fall 2026)",
    rollNo: "CS24B1089",
    university: "National Institute of Technology",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250",
    notificationSound: true,
    desktopNotifications: false,
    createdAt: "2026-08-01T00:00:00.000Z"
  },
  {
    id: "usr-2",
    name: "Aria Chen",
    email: "aria.chen@stanford.edu",
    course: "M.S. Artificial Intelligence & Data Science",
    semester: "Semester 2 (Fall 2026)",
    rollNo: "AI25M042",
    university: "Stanford University",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250",
    notificationSound: true,
    desktopNotifications: false,
    createdAt: "2026-08-15T00:00:00.000Z"
  }
];

const INITIAL_SUBJECTS = [
  {
    id: "sub-1",
    user_id: "usr-1",
    name: "Computer Networks",
    code: "CS-501",
    teacher: "Prof. Robert Davis",
    semester: "Semester 5",
    credits: 4,
    color: "#3b82f6",
    description: "OSI & TCP/IP architectures, routing protocols, flow control, transport layer security, and socket programming."
  },
  {
    id: "sub-2",
    user_id: "usr-1",
    name: "Database Management Systems",
    code: "CS-502",
    teacher: "Dr. Emily Watson",
    semester: "Semester 5",
    credits: 4,
    color: "#8b5cf6",
    description: "Relational models, SQL, Normalization, ACID properties, indexing, transaction management, and NoSQL fundamentals."
  },
  {
    id: "sub-3",
    user_id: "usr-1",
    name: "Operating Systems",
    code: "CS-503",
    teacher: "Prof. Alan Turing",
    semester: "Semester 5",
    credits: 4,
    color: "#10b981",
    description: "Process scheduling, thread synchronization, memory management, paging, virtual memory, and file systems."
  },
  {
    id: "sub-4",
    user_id: "usr-1",
    name: "Design & Analysis of Algorithms",
    code: "CS-504",
    teacher: "Dr. Donald Knuth",
    semester: "Semester 5",
    credits: 4,
    color: "#f59e0b",
    description: "Divide & Conquer, Dynamic Programming, Greedy approaches, Graph algorithms, NP-completeness."
  },
  {
    id: "sub-5",
    user_id: "usr-1",
    name: "Artificial Intelligence & ML",
    code: "CS-505",
    teacher: "Dr. Geoffrey Hinton",
    semester: "Semester 5",
    credits: 3,
    color: "#ec4899",
    description: "Search algorithms, heuristic search, neural networks, supervised/unsupervised learning, reinforcement learning."
  },
  {
    id: "sub-6",
    user_id: "usr-1",
    name: "Software Engineering & Agile",
    code: "CS-506",
    teacher: "Prof. Martin Fowler",
    semester: "Semester 5",
    credits: 3,
    color: "#06b6d4",
    description: "SDLC methodologies, Agile Scrum sprint planning, Git workflow, testing frameworks, CI/CD pipelines."
  },
  // Aria Chen's subjects
  {
    id: "sub-aria-1",
    user_id: "usr-2",
    name: "Deep Learning & Neural Architectures",
    code: "CS-231N",
    teacher: "Dr. Fei-Fei Li",
    semester: "Semester 2",
    credits: 4,
    color: "#8b5cf6",
    description: "Convolutional networks, Transformer attention mechanisms, and computer vision."
  },
  {
    id: "sub-aria-2",
    user_id: "usr-2",
    name: "Natural Language Processing with LLMs",
    code: "CS-224N",
    teacher: "Dr. Christopher Manning",
    semester: "Semester 2",
    credits: 4,
    color: "#ec4899",
    description: "Embeddings, Transformer decoders, RLHF, and prompt tuning architectures."
  }
];

const INITIAL_SYLLABUS = [
  {
    id: "syl-1",
    subject_id: "sub-1",
    unit_number: 1,
    unit_name: "Introduction & Physical Layer",
    topics: [
      { id: "top-1-1", title: "Network Architecture & Topologies", completed: true, important: false },
      { id: "top-1-2", title: "OSI 7-Layer Model vs TCP/IP Protocol Stack", completed: true, important: true },
      { id: "top-1-3", title: "Transmission Media & Multiplexing Techniques", completed: true, important: false },
      { id: "top-1-4", title: "Switching: Circuit vs Packet vs Message", completed: true, important: true }
    ]
  },
  {
    id: "syl-2",
    subject_id: "sub-1",
    unit_number: 2,
    unit_name: "Data Link Layer & MAC Sublayer",
    topics: [
      { id: "top-2-1", title: "Framing & Error Detection (CRC, Checksum)", completed: true, important: true },
      { id: "top-2-2", title: "Flow Control: Stop-and-Wait, Go-Back-N, Selective Repeat", completed: true, important: true },
      { id: "top-2-3", title: "Ethernet & CSMA/CD, CSMA/CA Protocols", completed: false, important: false },
      { id: "top-2-4", title: "HDLC & PPP Protocols Analysis", completed: false, important: false }
    ]
  },
  {
    id: "syl-3",
    subject_id: "sub-1",
    unit_number: 3,
    unit_name: "Network Layer & Routing",
    topics: [
      { id: "top-3-1", title: "IPv4 & IPv6 Addressing & Subnetting", completed: false, important: true },
      { id: "top-3-2", title: "Routing Algorithms: Distance Vector & Link State", completed: false, important: true },
      { id: "top-3-3", title: "BGP, OSPF, and RIP Protocols", completed: false, important: false }
    ]
  },
  {
    id: "syl-4",
    subject_id: "sub-2",
    unit_number: 1,
    unit_name: "Relational Data Model & ER Diagrams",
    topics: [
      { id: "top-4-1", title: "Database Architecture & 3-Schema Architecture", completed: true, important: false },
      { id: "top-4-2", title: "ER Modeling and Extended ER Concepts", completed: true, important: true },
      { id: "top-4-3", title: "Relational Algebra & Relational Calculus", completed: true, important: true }
    ]
  },
  {
    id: "syl-5",
    subject_id: "sub-2",
    unit_number: 2,
    unit_name: "SQL & Relational Database Design",
    topics: [
      { id: "top-5-1", title: "Complex SQL Queries, Subqueries & Joins", completed: true, important: true },
      { id: "top-5-2", title: "Functional Dependencies & Normal Forms (1NF, 2NF, 3NF, BCNF)", completed: true, important: true },
      { id: "top-5-3", title: "Lossless Join & Dependency Preservation Decompositions", completed: false, important: true }
    ]
  },
  {
    id: "syl-6",
    subject_id: "sub-2",
    unit_number: 3,
    unit_name: "Transaction Processing & Concurrency",
    topics: [
      { id: "top-6-1", title: "ACID Properties & Schedules Serializability", completed: false, important: true },
      { id: "top-6-2", title: "Lock-Based Protocols & 2-Phase Locking (2PL)", completed: false, important: true },
      { id: "top-6-3", title: "Deadlock Detection, Prevention & Recovery", completed: false, important: false }
    ]
  },
  {
    id: "syl-7",
    subject_id: "sub-3",
    unit_number: 1,
    unit_name: "Processes & CPU Scheduling",
    topics: [
      { id: "top-7-1", title: "Process Control Block (PCB) & State Transitions", completed: true, important: false },
      { id: "top-7-2", title: "Scheduling Algorithms: FCFS, SJF, Round Robin, Priority", completed: true, important: true },
      { id: "top-7-3", title: "Inter-Process Communication (IPC) & Pipes", completed: true, important: false }
    ]
  },
  {
    id: "syl-8",
    subject_id: "sub-3",
    unit_number: 2,
    unit_name: "Process Synchronization & Deadlocks",
    topics: [
      { id: "top-8-1", title: "Critical Section Problem & Peterson's Algorithm", completed: true, important: true },
      { id: "top-8-2", title: "Semaphores, Mutex Locks & Classic Problems", completed: true, important: true },
      { id: "top-8-3", title: "Banker's Algorithm for Deadlock Avoidance", completed: true, important: true }
    ]
  },
  {
    id: "syl-aria-1",
    subject_id: "sub-aria-1",
    unit_number: 1,
    unit_name: "Attention & Self-Attention Mechanisms",
    topics: [
      { id: "top-aria-1", title: "Scaled Dot-Product Attention", completed: true, important: true },
      { id: "top-aria-2", title: "Multi-Head Cross Attention", completed: true, important: true },
      { id: "top-aria-3", title: "Rotary Positional Embeddings (RoPE)", completed: false, important: true }
    ]
  }
];

const getRelativeDate = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const INITIAL_TASKS = [
  {
    id: "tsk-1",
    user_id: "usr-1",
    title: "Complete DBMS Lab Assignment 4 (BCNF Decomposition)",
    description: "Write SQL scripts and normalization proofs for 5 complex relation schemas. Submit on Google Classroom.",
    subject_id: "sub-2",
    category: "Assignment",
    priority: "High",
    status: "Incomplete",
    progress: 30,
    start_date: getRelativeDate(-2),
    due_date: getRelativeDate(0),
    due_time: "23:59",
    reminder: "1 hour before",
    notes: "Check lecture notes page 45 for BCNF algorithm reference.",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    completed_at: null
  },
  {
    id: "tsk-2",
    user_id: "usr-1",
    title: "Revise Operating Systems Unit 2 (Banker's Algorithm)",
    description: "Solve 4 numerical problems on deadlock avoidance and mutex semaphores for upcoming midterm.",
    subject_id: "sub-3",
    category: "Revision",
    priority: "Medium",
    status: "Incomplete",
    progress: 0,
    start_date: getRelativeDate(-1),
    due_date: getRelativeDate(0),
    due_time: "18:00",
    reminder: "30 minutes before",
    notes: "Review Silberschatz Chapter 6 questions.",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    completed_at: null
  },
  {
    id: "tsk-3",
    user_id: "usr-1",
    title: "Socket Programming Project (Multi-Client Chat Server)",
    description: "Develop Python TCP socket client-server application with multi-threading and message encryption.",
    subject_id: "sub-1",
    category: "Project",
    priority: "High",
    status: "In Progress",
    progress: 65,
    start_date: getRelativeDate(-5),
    due_date: getRelativeDate(3),
    due_time: "17:00",
    reminder: "1 day before",
    notes: "GitHub repository must include README with execution screenshots.",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    completed_at: null
  },
  {
    id: "tsk-4",
    user_id: "usr-1",
    title: "Dynamic Programming Problem Set (LeetCode 10 Problems)",
    description: "Solve Knapsack, Longest Common Subsequence, and Matrix Chain Multiplication problems.",
    subject_id: "sub-4",
    category: "Study",
    priority: "Medium",
    status: "In Progress",
    progress: 50,
    start_date: getRelativeDate(-3),
    due_date: getRelativeDate(5),
    due_time: "20:00",
    reminder: "1 hour before",
    notes: "Document time and space complexities in study journal.",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    completed_at: null
  },
  {
    id: "tsk-5",
    user_id: "usr-1",
    title: "Machine Learning Linear Regression & Gradient Descent Practical",
    description: "Implement custom cost function and batch gradient descent in Jupyter Notebook using NumPy.",
    subject_id: "sub-5",
    category: "Practical",
    priority: "High",
    status: "In Progress",
    progress: 80,
    start_date: getRelativeDate(-4),
    due_date: getRelativeDate(2),
    due_time: "14:00",
    reminder: "1 day before",
    notes: "Plot convergence curve with matplotlib.",
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    completed_at: null
  },
  {
    id: "tsk-6",
    user_id: "usr-1",
    title: "Operating Systems Process Scheduling Simulator",
    description: "Build Gantt chart visualizer for FCFS, SJF, and Round Robin in JavaScript.",
    subject_id: "sub-3",
    category: "Assignment",
    priority: "High",
    status: "Completed",
    progress: 100,
    start_date: getRelativeDate(-10),
    due_date: getRelativeDate(-3),
    due_time: "23:59",
    reminder: "1 day before",
    notes: "Scored 10/10 in evaluation.",
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    completed_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: "tsk-7",
    user_id: "usr-1",
    title: "Computer Networks CRC & Checksum Implementation",
    description: "C++ implementation of Cyclic Redundancy Check error detection polynomial division.",
    subject_id: "sub-1",
    category: "Practical",
    priority: "Medium",
    status: "Completed",
    progress: 100,
    start_date: getRelativeDate(-12),
    due_date: getRelativeDate(-6),
    due_time: "17:00",
    reminder: "1 hour before",
    notes: "Verified with CRC-32 generator.",
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    completed_at: new Date(Date.now() - 6 * 86400000).toISOString()
  },
  {
    id: "tsk-aria-1",
    user_id: "usr-2",
    title: "Implement Vision Transformer (ViT) from Scratch in PyTorch",
    description: "Patch embeddings, multi-head self attention and classifier head for CIFAR-100 dataset.",
    subject_id: "sub-aria-1",
    category: "Project",
    priority: "High",
    status: "In Progress",
    progress: 70,
    start_date: getRelativeDate(-3),
    due_date: getRelativeDate(4),
    due_time: "23:59",
    reminder: "1 day before",
    notes: "Target top-1 accuracy > 88%.",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    completed_at: null
  }
];

const INITIAL_EXAMS = [
  {
    id: "ex-1",
    user_id: "usr-1",
    subject_id: "sub-2",
    exam_name: "DBMS Mid-Term Examination",
    exam_type: "Mid-Term",
    date: getRelativeDate(3),
    time: "10:00",
    duration: "2 Hours",
    room: "Auditorium Hall 2B",
    instructions: "Scientific calculators allowed. Bring university ID card and blue/black pens. No mobile phones.",
    notes: "Covers Units 1, 2, and 3 (Relational Algebra, SQL, Normalization)."
  },
  {
    id: "ex-2",
    user_id: "usr-1",
    subject_id: "sub-1",
    exam_name: "Computer Networks Theory Exam",
    exam_type: "Mid-Term",
    date: getRelativeDate(8),
    time: "14:00",
    duration: "2.5 Hours",
    room: "CS Seminar Block Room 402",
    instructions: "Strict seated placement. Reach 15 minutes before scheduled start time.",
    notes: "Focus heavily on Subnetting calculations and Distance Vector Routing."
  },
  {
    id: "ex-aria-1",
    user_id: "usr-2",
    subject_id: "sub-aria-1",
    exam_name: "Deep Learning Mid-Term Exam",
    exam_type: "Mid-Term",
    date: getRelativeDate(6),
    time: "11:00",
    duration: "2 Hours",
    room: "Gates Computer Science Building 104",
    instructions: "Closed book, one double-sided cheat sheet permitted.",
    notes: "Focus on Backpropagation math and Transformer complexity."
  }
];

const INITIAL_REMINDERS = [
  {
    id: "rem-1",
    user_id: "usr-1",
    title: "Submit DBMS Assignment 4",
    item_type: "task",
    item_id: "tsk-1",
    target_date: getRelativeDate(0),
    target_time: "22:59",
    reminder_type: "1 hour before",
    status: "Upcoming",
    created_at: new Date().toISOString()
  },
  {
    id: "rem-aria-1",
    user_id: "usr-2",
    title: "ViT PyTorch Implementation Milestone",
    item_type: "task",
    item_id: "tsk-aria-1",
    target_date: getRelativeDate(3),
    target_time: "18:00",
    reminder_type: "1 day before",
    status: "Upcoming",
    created_at: new Date().toISOString()
  }
];

const INITIAL_ACTIVITIES = [
  {
    id: "act-1",
    user_id: "usr-1",
    action: "completed",
    text: "Completed Operating Systems Process Scheduling Simulator",
    timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
    icon: "check-circle",
    color: "emerald"
  },
  {
    id: "act-2",
    user_id: "usr-1",
    action: "added",
    text: "Added new task: Socket Programming Project",
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
    icon: "plus-circle",
    color: "blue"
  }
];

// -------------------------------------------------------------
// LOCALSTORAGE DATABASE STORAGE KEYS
// -------------------------------------------------------------
const STORAGE_KEYS = {
  PROFILES: "acad_flow_profiles_v2",
  ACTIVE_USER_ID: "acad_flow_active_uid_v2",
  SUBJECTS: "acad_flow_subjects_v2",
  SYLLABUS: "acad_flow_syllabus_v2",
  TASKS: "acad_flow_tasks_v2",
  EXAMS: "acad_flow_exams_v2",
  REMINDERS: "acad_flow_reminders_v2",
  ACTIVITIES: "acad_flow_activities_v2",
  THEME: "acad_flow_theme_v2"
};

const AcademicContext = createContext(null);

function AcademicProvider({ children }) {
  // Theme state
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved !== null) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Toast notifications state
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    if (type === 'success') playAudioChime('success');
    if (type === 'reminder' || type === 'switch') playAudioChime('reminder');
    if (type === 'delete') playAudioChime('delete');
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // Multi-Profile State
  const [profiles, setProfiles] = useState(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILES);
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.map(p => {
          if (p.id === 'usr-1' && (p.name === 'Gauransh Sharma' || p.avatarUrl.includes('1534528741775'))) {
            return {
              ...p,
              name: 'Gauransh Mittal',
              email: 'gauransh.mittal@university.edu',
              avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250'
            };
          }
          return p;
        });
      }
      return DEFAULT_PROFILES;
    } catch { return DEFAULT_PROFILES; }
  });

  const [activeUserId, setActiveUserId] = useState(() => {
    try {
      const savedUid = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
      return savedUid || "usr-1";
    } catch { return "usr-1"; }
  });

  // Current active profile
  const profile = useMemo(() => {
    const found = profiles.find(p => p.id === activeUserId);
    return found || profiles[0] || DEFAULT_PROFILES[0];
  }, [profiles, activeUserId]);

  // Database states
  const [allSubjects, setAllSubjects] = useState(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      return data ? JSON.parse(data) : INITIAL_SUBJECTS;
    } catch { return INITIAL_SUBJECTS; }
  });

  const [allSyllabus, setAllSyllabus] = useState(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SYLLABUS);
      return data ? JSON.parse(data) : INITIAL_SYLLABUS;
    } catch { return INITIAL_SYLLABUS; }
  });

  const [allTasks, setAllTasks] = useState(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : INITIAL_TASKS;
    } catch { return INITIAL_TASKS; }
  });

  const [allExams, setAllExams] = useState(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXAMS);
      return data ? JSON.parse(data) : INITIAL_EXAMS;
    } catch { return INITIAL_EXAMS; }
  });

  const [allReminders, setAllReminders] = useState(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      return data ? JSON.parse(data) : INITIAL_REMINDERS;
    } catch { return INITIAL_REMINDERS; }
  });

  const [allActivities, setAllActivities] = useState(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      return data ? JSON.parse(data) : INITIAL_ACTIVITIES;
    } catch { return INITIAL_ACTIVITIES; }
  });

  // Filtered views for current active student user
  const subjects = useMemo(() => allSubjects.filter(s => s.user_id === activeUserId || !s.user_id), [allSubjects, activeUserId]);
  
  // Active subject IDs
  const activeSubjectIds = useMemo(() => new Set(subjects.map(s => s.id)), [subjects]);

  const syllabus = useMemo(() => allSyllabus.filter(s => activeSubjectIds.has(s.subject_id)), [allSyllabus, activeSubjectIds]);
  const tasks = useMemo(() => allTasks.filter(t => t.user_id === activeUserId || (!t.user_id && activeSubjectIds.has(t.subject_id))), [allTasks, activeUserId, activeSubjectIds]);
  const exams = useMemo(() => allExams.filter(e => e.user_id === activeUserId || (!e.user_id && activeSubjectIds.has(e.subject_id))), [allExams, activeUserId, activeSubjectIds]);
  const reminders = useMemo(() => allReminders.filter(r => r.user_id === activeUserId || !r.user_id), [allReminders, activeUserId]);
  const activities = useMemo(() => allActivities.filter(a => a.user_id === activeUserId || !a.user_id), [allActivities, activeUserId]);

  // Sync to localStorage
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles)); }, [profiles]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, activeUserId); }, [activeUserId]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(allSubjects)); }, [allSubjects]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SYLLABUS, JSON.stringify(allSyllabus)); }, [allSyllabus]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(allTasks)); }, [allTasks]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(allExams)); }, [allExams]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(allReminders)); }, [allReminders]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(allActivities)); }, [allActivities]);

  // Log Activity Helper
  const logActivity = useCallback((action, text, icon = 'activity', color = 'indigo') => {
    const newAct = {
      id: "act-" + Date.now(),
      user_id: activeUserId,
      action,
      text,
      timestamp: new Date().toISOString(),
      icon,
      color
    };
    setAllActivities(prev => [newAct, ...prev.slice(0, 100)]);
  }, [activeUserId]);

  // -------------------------------------------------------------
  // MULTI-PROFILE OPERATIONS (ADD, SWITCH, EDIT, DELETE)
  // -------------------------------------------------------------
  const createProfile = useCallback((profileData, templateOption = 'sample') => {
    const newUid = "usr-" + Date.now();
    const newProfile = {
      id: newUid,
      name: profileData.name.trim(),
      email: profileData.email.trim(),
      course: profileData.course || "B.Tech Computer Science",
      semester: profileData.semester || "Semester 1",
      rollNo: profileData.rollNo || `ID-${Math.floor(1000 + Math.random() * 9000)}`,
      university: profileData.university || "University Campus",
      avatarUrl: profileData.avatarUrl || AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)],
      notificationSound: true,
      desktopNotifications: false,
      createdAt: new Date().toISOString()
    };

    setProfiles(prev => [...prev, newProfile]);
    setActiveUserId(newUid);

    // If template option is sample, clone a standard set of starter courses for the new student
    if (templateOption === 'sample') {
      const starterSubId1 = "sub-" + Date.now() + "-1";
      const starterSubId2 = "sub-" + Date.now() + "-2";
      
      const newSubs = [
        {
          id: starterSubId1,
          user_id: newUid,
          name: "Data Structures & Algorithms",
          code: "CS-101",
          teacher: "Dr. Robert Sedgewick",
          semester: newProfile.semester,
          credits: 4,
          color: "#3b82f6",
          description: "Arrays, Linked Lists, Trees, Heaps, Dynamic Programming & Sorting Algorithms."
        },
        {
          id: starterSubId2,
          user_id: newUid,
          name: "Discrete Mathematics",
          code: "MA-102",
          teacher: "Dr. Kenneth Rosen",
          semester: newProfile.semester,
          credits: 4,
          color: "#8b5cf6",
          description: "Propositional logic, set theory, combinatorics, graph theory, and recurrence relations."
        }
      ];

      const starterSyl = [
        {
          id: "syl-" + Date.now() + "-1",
          subject_id: starterSubId1,
          unit_number: 1,
          unit_name: "Arrays, Stacks & Queues",
          topics: [
            { id: "top-" + Date.now() + "-1", title: "Array Operations & Memory Mapping", completed: true, important: false },
            { id: "top-" + Date.now() + "-2", title: "Stack Applications: Infix to Postfix", completed: false, important: true },
            { id: "top-" + Date.now() + "-3", title: "Circular Queue & Deque Implementation", completed: false, important: false }
          ]
        },
        {
          id: "syl-" + Date.now() + "-2",
          subject_id: starterSubId2,
          unit_number: 1,
          unit_name: "Logic & Proof Methods",
          topics: [
            { id: "top-" + Date.now() + "-4", title: "Truth Tables & Logical Equivalences", completed: true, important: true },
            { id: "top-" + Date.now() + "-5", title: "Direct & Indirect Mathematical Proofs", completed: false, important: true }
          ]
        }
      ];

      const starterTasks = [
        {
          id: "tsk-" + Date.now() + "-1",
          user_id: newUid,
          title: "Implement Stack with Linked List",
          description: "Write C++ class implementing push, pop, peek, and isEmpty.",
          subject_id: starterSubId1,
          category: "Assignment",
          priority: "High",
          status: "In Progress",
          progress: 50,
          start_date: getRelativeDate(0),
          due_date: getRelativeDate(3),
          due_time: "23:59",
          reminder: "1 day before",
          notes: "Include unit test assertions.",
          created_at: new Date().toISOString(),
          completed_at: null
        }
      ];

      const starterExam = [
        {
          id: "ex-" + Date.now() + "-1",
          user_id: newUid,
          subject_id: starterSubId1,
          exam_name: "Data Structures Quiz 1",
          exam_type: "Internal",
          date: getRelativeDate(7),
          time: "10:00",
          duration: "1 Hour",
          room: "Lecture Hall 101",
          instructions: "Closed book.",
          notes: "Covers Unit 1."
        }
      ];

      setAllSubjects(prev => [...prev, ...newSubs]);
      setAllSyllabus(prev => [...prev, ...starterSyl]);
      setAllTasks(prev => [...prev, ...starterTasks]);
      setAllExams(prev => [...prev, ...starterExam]);
    }

    addToast(`Welcome ${newProfile.name}! Logged in successfully.`, "success");
    return newProfile;
  }, [addToast]);

  const switchProfile = useCallback((profileId) => {
    const target = profiles.find(p => p.id === profileId);
    if (!target) return;
    setActiveUserId(profileId);
    addToast(`Switched profile to ${target.name}`, "switch");
  }, [profiles, addToast]);

  const setProfile = useCallback((updatedFields) => {
    setProfiles(prev => prev.map(p => {
      if (p.id === activeUserId) {
        return { ...p, ...updatedFields };
      }
      return p;
    }));
  }, [activeUserId]);

  const deleteProfile = useCallback((profileId) => {
    if (profiles.length <= 1) {
      addToast("Cannot delete the only remaining profile!", "info");
      return;
    }
    const target = profiles.find(p => p.id === profileId);
    const remaining = profiles.filter(p => p.id !== profileId);
    setProfiles(remaining);

    // If currently active was deleted, switch to first remaining
    if (activeUserId === profileId) {
      setActiveUserId(remaining[0].id);
    }

    // Clean up associated user records
    setAllSubjects(prev => prev.filter(s => s.user_id !== profileId));
    setAllTasks(prev => prev.filter(t => t.user_id !== profileId));
    setAllExams(prev => prev.filter(e => e.user_id !== profileId));
    setAllReminders(prev => prev.filter(r => r.user_id !== profileId));
    setAllActivities(prev => prev.filter(a => a.user_id !== profileId));

    if (target) {
      addToast(`Profile ${target.name} removed.`, "delete");
    }
  }, [profiles, activeUserId, addToast]);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window) {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        setProfile({ desktopNotifications: true });
        addToast("Browser notifications enabled!", "success");
      } else {
        setProfile({ desktopNotifications: false });
        addToast("Notification permission denied", "info");
      }
    } else {
      addToast("Browser notifications are not supported in this browser", "info");
    }
  }, [setProfile, addToast]);

  // Trigger browser notification
  const triggerNotification = useCallback((title, body) => {
    if (profile.notificationSound) {
      playAudioChime('reminder');
    }
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, {
          body,
          icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
        });
      } catch (e) {
        console.warn(e);
      }
    }
  }, [profile.notificationSound]);

  // Trigger celebration confetti
  const triggerConfetti = useCallback(() => {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, []);

  // -------------------------------------------------------------
  // TASK CRUD OPERATIONS
  // -------------------------------------------------------------
  const addTask = useCallback((taskData) => {
    const newTask = {
      id: "tsk-" + Date.now(),
      user_id: activeUserId,
      ...taskData,
      created_at: new Date().toISOString(),
      completed_at: taskData.status === 'Completed' ? new Date().toISOString() : null,
      progress: taskData.status === 'Completed' ? 100 : (Number(taskData.progress) || 0)
    };
    setAllTasks(prev => [newTask, ...prev]);
    logActivity('added', `Added task: ${newTask.title}`, 'plus-circle', 'blue');
    addToast(`Task "${newTask.title.substring(0, 24)}..." added!`, 'success');

    if (newTask.reminder && newTask.reminder !== 'None' && newTask.due_date) {
      const rem = {
        id: "rem-" + Date.now(),
        user_id: activeUserId,
        title: `Task Reminder: ${newTask.title}`,
        item_type: "task",
        item_id: newTask.id,
        target_date: newTask.due_date,
        target_time: newTask.due_time || "12:00",
        reminder_type: newTask.reminder,
        status: "Upcoming",
        created_at: new Date().toISOString()
      };
      setAllReminders(prev => [rem, ...prev]);
    }
    return newTask;
  }, [activeUserId, logActivity, addToast]);

  const updateTask = useCallback((id, updates) => {
    setAllTasks(prev => prev.map(t => {
      if (t.id === id) {
        const wasCompleted = t.status === 'Completed';
        const isNowCompleted = updates.status === 'Completed' || updates.progress === 100;
        
        let newStatus = updates.status !== undefined ? updates.status : t.status;
        let newProgress = updates.progress !== undefined ? Number(updates.progress) : t.progress;

        if (updates.status === 'Completed') {
          newProgress = 100;
        } else if (updates.progress === 100) {
          newStatus = 'Completed';
        } else if (updates.status === 'In Progress' && newProgress === 0) {
          newProgress = 25;
        } else if (updates.progress > 0 && updates.progress < 100 && newStatus === 'Incomplete') {
          newStatus = 'In Progress';
        }

        const completedAt = (isNowCompleted && !wasCompleted) 
          ? new Date().toISOString() 
          : (newStatus !== 'Completed' ? null : t.completed_at);

        if (isNowCompleted && !wasCompleted) {
          triggerConfetti();
          playAudioChime('complete');
        }

        const updated = {
          ...t,
          ...updates,
          status: newStatus,
          progress: newProgress,
          completed_at: completedAt
        };

        logActivity('updated', `Updated task: ${updated.title}`, 'refresh-cw', 'purple');
        return updated;
      }
      return t;
    }));
    addToast("Task updated successfully!", "info");
  }, [logActivity, addToast, triggerConfetti]);

  const deleteTask = useCallback((id) => {
    const taskToDelete = allTasks.find(t => t.id === id);
    setAllTasks(prev => prev.filter(t => t.id !== id));
    setAllReminders(prev => prev.filter(r => r.item_id !== id));
    if (taskToDelete) {
      logActivity('deleted', `Deleted task: ${taskToDelete.title}`, 'trash-2', 'rose');
    }
    addToast("Task deleted", "delete");
  }, [allTasks, logActivity, addToast]);

  const toggleTaskComplete = useCallback((id) => {
    const t = allTasks.find(item => item.id === id);
    if (!t) return;
    if (t.status === 'Completed') {
      updateTask(id, { status: 'Incomplete', progress: 0 });
    } else {
      updateTask(id, { status: 'Completed', progress: 100 });
    }
  }, [allTasks, updateTask]);

  // -------------------------------------------------------------
  // SUBJECT CRUD OPERATIONS
  // -------------------------------------------------------------
  const addSubject = useCallback((subData) => {
    const newSub = {
      id: "sub-" + Date.now(),
      user_id: activeUserId,
      ...subData,
      credits: Number(subData.credits) || 3
    };
    setAllSubjects(prev => [...prev, newSub]);
    logActivity('added', `Added subject: ${newSub.name} (${newSub.code})`, 'book-open', 'indigo');
    addToast(`Subject "${newSub.name}" created!`, 'success');
    return newSub;
  }, [activeUserId, logActivity, addToast]);

  const updateSubject = useCallback((id, updates) => {
    setAllSubjects(prev => prev.map(s => s.id === id ? { ...s, ...updates, credits: Number(updates.credits || s.credits) } : s));
    logActivity('updated', `Updated subject details`, 'edit-3', 'indigo');
    addToast("Subject updated successfully!", "info");
  }, [logActivity, addToast]);

  const deleteSubject = useCallback((id) => {
    const sub = allSubjects.find(s => s.id === id);
    setAllSubjects(prev => prev.filter(s => s.id !== id));
    setAllSyllabus(prev => prev.filter(s => s.subject_id !== id));
    setAllTasks(prev => prev.filter(t => t.subject_id !== id));
    setAllExams(prev => prev.filter(e => e.subject_id !== id));
    if (sub) {
      logActivity('deleted', `Deleted subject: ${sub.name}`, 'trash-2', 'rose');
    }
    addToast("Subject and associated syllabus/tasks deleted", "delete");
  }, [allSubjects, logActivity, addToast]);

  // -------------------------------------------------------------
  // SYLLABUS OPERATIONS
  // -------------------------------------------------------------
  const addUnit = useCallback((subjectId, unitName) => {
    const existing = allSyllabus.filter(s => s.subject_id === subjectId);
    const newUnit = {
      id: "syl-" + Date.now(),
      subject_id: subjectId,
      unit_number: existing.length + 1,
      unit_name: unitName,
      topics: []
    };
    setAllSyllabus(prev => [...prev, newUnit]);
    logActivity('added', `Added Unit: ${unitName}`, 'folder-plus', 'emerald');
    addToast(`Unit added to syllabus!`, 'success');
  }, [allSyllabus, logActivity, addToast]);

  const updateUnit = useCallback((unitId, newName) => {
    setAllSyllabus(prev => prev.map(u => u.id === unitId ? { ...u, unit_name: newName } : u));
    addToast("Unit name updated", "info");
  }, [addToast]);

  const deleteUnit = useCallback((unitId) => {
    setAllSyllabus(prev => prev.filter(u => u.id !== unitId));
    addToast("Unit removed from syllabus", "delete");
  }, [addToast]);

  const addTopic = useCallback((unitId, title, important = false) => {
    const newTopic = {
      id: "top-" + Date.now(),
      title,
      completed: false,
      important
    };
    setAllSyllabus(prev => prev.map(u => {
      if (u.id === unitId) {
        return { ...u, topics: [...u.topics, newTopic] };
      }
      return u;
    }));
    addToast("Topic added!", 'success');
  }, [addToast]);

  const toggleTopicCompleted = useCallback((unitId, topicId) => {
    setAllSyllabus(prev => prev.map(u => {
      if (u.id === unitId) {
        const updatedTopics = u.topics.map(t => {
          if (t.id === topicId) {
            const nextVal = !t.completed;
            if (nextVal) playAudioChime('success');
            return { ...t, completed: nextVal };
          }
          return t;
        });
        return { ...u, topics: updatedTopics };
      }
      return u;
    }));
  }, []);

  const toggleTopicImportant = useCallback((unitId, topicId) => {
    setAllSyllabus(prev => prev.map(u => {
      if (u.id === unitId) {
        return {
          ...u,
          topics: u.topics.map(t => t.id === topicId ? { ...t, important: !t.important } : t)
        };
      }
      return u;
    }));
  }, []);

  const deleteTopic = useCallback((unitId, topicId) => {
    setAllSyllabus(prev => prev.map(u => {
      if (u.id === unitId) {
        return {
          ...u,
          topics: u.topics.filter(t => t.id !== topicId)
        };
      }
      return u;
    }));
    addToast("Topic deleted", "delete");
  }, [addToast]);

  // -------------------------------------------------------------
  // EXAM OPERATIONS
  // -------------------------------------------------------------
  const addExam = useCallback((examData) => {
    const newExam = {
      id: "ex-" + Date.now(),
      user_id: activeUserId,
      ...examData
    };
    setAllExams(prev => [newExam, ...prev]);
    logActivity('added', `Scheduled exam: ${newExam.exam_name}`, 'calendar-plus', 'amber');
    addToast(`Exam "${newExam.exam_name}" scheduled!`, 'success');

    const examDate = new Date(newExam.date);
    examDate.setDate(examDate.getDate() - 1);
    const rem = {
      id: "rem-" + Date.now(),
      user_id: activeUserId,
      title: `Upcoming Exam: ${newExam.exam_name}`,
      item_type: "exam",
      item_id: newExam.id,
      target_date: examDate.toISOString().split('T')[0],
      target_time: newExam.time || "09:00",
      reminder_type: "1 day before",
      status: "Upcoming",
      created_at: new Date().toISOString()
    };
    setAllReminders(prev => [rem, ...prev]);
  }, [activeUserId, logActivity, addToast]);

  const updateExam = useCallback((id, updates) => {
    setAllExams(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    logActivity('updated', `Updated exam details`, 'edit', 'amber');
    addToast("Exam details updated!", "info");
  }, [logActivity, addToast]);

  const deleteExam = useCallback((id) => {
    const exam = allExams.find(e => e.id === id);
    setAllExams(prev => prev.filter(e => e.id !== id));
    setAllReminders(prev => prev.filter(r => r.item_id !== id));
    if (exam) {
      logActivity('deleted', `Deleted exam: ${exam.exam_name}`, 'trash-2', 'rose');
    }
    addToast("Exam deleted", "delete");
  }, [allExams, logActivity, addToast]);

  // -------------------------------------------------------------
  // REMINDER OPERATIONS
  // -------------------------------------------------------------
  const addReminder = useCallback((remData) => {
    const newRem = {
      id: "rem-" + Date.now(),
      user_id: activeUserId,
      ...remData,
      status: "Upcoming",
      created_at: new Date().toISOString()
    };
    setAllReminders(prev => [newRem, ...prev]);
    addToast("Reminder set successfully!", "success");
  }, [activeUserId, addToast]);

  const deleteReminder = useCallback((id) => {
    setAllReminders(prev => prev.filter(r => r.id !== id));
    addToast("Reminder removed", "delete");
  }, [addToast]);

  const dismissReminder = useCallback((id) => {
    setAllReminders(prev => prev.map(r => r.id === id ? { ...r, status: "Dismissed" } : r));
    addToast("Reminder marked as completed", "info");
  }, [addToast]);

  // -------------------------------------------------------------
  // RESET / BACKUP / RESTORE
  // -------------------------------------------------------------
  const resetToDefaultData = useCallback(() => {
    setProfiles(DEFAULT_PROFILES);
    setActiveUserId("usr-1");
    setAllSubjects(INITIAL_SUBJECTS);
    setAllSyllabus(INITIAL_SYLLABUS);
    setAllTasks(INITIAL_TASKS);
    setAllExams(INITIAL_EXAMS);
    setAllReminders(INITIAL_REMINDERS);
    setAllActivities(INITIAL_ACTIVITIES);
    addToast("Reset all data to default university templates!", "success");
  }, [addToast]);

  const exportDataJSON = useCallback(() => {
    const backup = {
      profiles,
      activeUserId,
      subjects: allSubjects,
      syllabus: allSyllabus,
      tasks: allTasks,
      exams: allExams,
      reminders: allReminders,
      activities: allActivities,
      exportedAt: new Date().toISOString(),
      app: "Workly"
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academic-workflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("Academic database backup exported!", "success");
  }, [profiles, activeUserId, allSubjects, allSyllabus, allTasks, allExams, allReminders, allActivities, addToast]);

  const importDataJSON = useCallback((jsonData) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.profiles) setProfiles(parsed.profiles);
      if (parsed.activeUserId) setActiveUserId(parsed.activeUserId);
      if (parsed.subjects) setAllSubjects(parsed.subjects);
      if (parsed.syllabus) setAllSyllabus(parsed.syllabus);
      if (parsed.tasks) setAllTasks(parsed.tasks);
      if (parsed.exams) setAllExams(parsed.exams);
      if (parsed.reminders) setAllReminders(parsed.reminders);
      if (parsed.activities) setAllActivities(parsed.activities);
      addToast("Academic data successfully restored!", "success");
    } catch (e) {
      addToast("Invalid JSON backup file format", "info");
    }
  }, [addToast]);

  // Context value
  const value = useMemo(() => ({
    isDark,
    setIsDark,
    toasts,
    addToast,
    // Multi-profile
    profiles,
    activeUserId,
    profile,
    setProfile,
    createProfile,
    switchProfile,
    deleteProfile,
    AVATAR_PRESETS,
    // Database models
    subjects,
    syllabus,
    tasks,
    exams,
    reminders,
    activities,
    // Task CRUD
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    // Subject CRUD
    addSubject,
    updateSubject,
    deleteSubject,
    // Syllabus CRUD
    addUnit,
    updateUnit,
    deleteUnit,
    addTopic,
    toggleTopicCompleted,
    toggleTopicImportant,
    deleteTopic,
    // Exam CRUD
    addExam,
    updateExam,
    deleteExam,
    // Reminder CRUD
    addReminder,
    deleteReminder,
    dismissReminder,
    // Utilities
    triggerConfetti,
    triggerNotification,
    requestNotificationPermission,
    resetToDefaultData,
    exportDataJSON,
    importDataJSON
  }), [
    isDark, toasts, addToast,
    profiles, activeUserId, profile, setProfile, createProfile, switchProfile, deleteProfile,
    subjects, syllabus, tasks, exams, reminders, activities,
    addTask, updateTask, deleteTask, toggleTaskComplete,
    addSubject, updateSubject, deleteSubject,
    addUnit, updateUnit, deleteUnit, addTopic, toggleTopicCompleted, toggleTopicImportant, deleteTopic,
    addExam, updateExam, deleteExam,
    addReminder, deleteReminder, dismissReminder,
    triggerConfetti, triggerNotification, requestNotificationPermission, resetToDefaultData, exportDataJSON, importDataJSON
  ]);

  return <AcademicContext.Provider value={value}>{children}</AcademicContext.Provider>;
}

const useAcademic = () => useContext(AcademicContext);
