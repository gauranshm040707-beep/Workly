// Dynamic Academic Workflow Management System - UI Components & Views

// -------------------------------------------------------------
// HELPER UTILITIES
// -------------------------------------------------------------
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  try {
    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch {
    return dateString;
  }
};

const getDaysRemaining = (targetDate) => {
  if (!targetDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const diffTime = target - today;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

const isTaskOverdue = (task) => {
  if (task.status === 'Completed') return false;
  if (!task.due_date) return false;
  const days = getDaysRemaining(task.due_date);
  if (days < 0) return true;
  if (days === 0 && task.due_time) {
    const now = new Date();
    const [hours, mins] = task.due_time.split(':').map(Number);
    const dueDateTime = new Date();
    dueDateTime.setHours(hours || 23, mins || 59, 0, 0);
    return now > dueDateTime;
  }
  return false;
};

const isDueToday = (dateString) => {
  if (!dateString) return false;
  return getDaysRemaining(dateString) === 0;
};

const getExamStatus = (examDate) => {
  const days = getDaysRemaining(examDate);
  if (days < 0) return "Completed";
  if (days === 0) return "Today";
  return "Upcoming";
};

// Category colors helper
const getCategoryColor = (category) => {
  switch (category) {
    case 'Assignment': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case 'Project': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    case 'Practical': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'Study': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    case 'Revision': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    case 'Exam Preparation': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    case 'Homework': return 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border-teal-200 dark:border-teal-800';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
  }
};

const getPriorityBadge = (priority) => {
  switch (priority) {
    case 'High':
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
        <i className="fas fa-fire mr-1 text-rose-500"></i> High
      </span>;
    case 'Medium':
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
        <i className="fas fa-layer-group mr-1 text-amber-500"></i> Medium
      </span>;
    case 'Low':
    default:
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
        <i className="fas fa-arrow-down mr-1 text-blue-500"></i> Low
      </span>;
  }
};

// -------------------------------------------------------------
// METRIC SUMMARY CARD COMPONENT
// -------------------------------------------------------------
function StatCard({ title, value, icon, colorClass, bgGradient, subtext, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl border transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg cursor-pointer ${bgGradient} border-gray-100 dark:border-gray-800/80`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900 dark:text-white mt-1">{value}</h3>
          {subtext && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner ${colorClass}`}>
          <i className={`fas ${icon}`}></i>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// POMODORO FOCUS STUDY TIMER WIDGET
// -------------------------------------------------------------
function FocusStudyTimer() {
  const { addToast } = useAcademic();
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('study');
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    let timer = null;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => setSecondsLeft(prev => prev - 1), 1000);
    } else if (secondsLeft === 0) {
      playAudioChime('reminder');
      if (mode === 'study') {
        setSessionCount(c => c + 1);
        setMode('break');
        setSecondsLeft(5 * 60);
        addToast("Great focus session! Take a 5-minute break.", "success");
      } else {
        setMode('study');
        setSecondsLeft(25 * 60);
        addToast("Break finished! Ready to study?", "info");
      }
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsLeft, mode, addToast]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = (newMode = 'study') => {
    setIsRunning(false);
    setMode(newMode);
    setSecondsLeft(newMode === 'study' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="bg-white dark:bg-gray-800/90 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
          <h4 className="font-heading font-semibold text-gray-900 dark:text-white text-sm">Study Focus Timer</h4>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
          {sessionCount} Sessions Done
        </span>
      </div>

      <div className="text-center my-3">
        <div className="font-mono text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5">
          {mode === 'study' ? '📖 Deep Study Interval (25m)' : '☕ Rest Break (5m)'}
        </p>
      </div>

      <div className="flex items-center justify-center space-x-2">
        <button
          onClick={toggleTimer}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 text-white transition shadow-sm ${isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
        >
          <i className={`fas ${isRunning ? 'fa-pause' : 'fa-play'}`}></i>
          <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
        </button>
        <button
          onClick={() => resetTimer(mode === 'study' ? 'break' : 'study')}
          className="px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition"
        >
          {mode === 'study' ? 'Switch Break' : 'Switch Study'}
        </button>
        <button
          onClick={() => resetTimer(mode)}
          className="p-1.5 rounded-xl text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          title="Reset"
        >
          <i className="fas fa-undo"></i>
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// VIEW 1: DASHBOARD VIEW
// -------------------------------------------------------------
function DashboardView({ setActiveTab, onOpenNewTaskModal, onOpenNewProfileModal }) {
  const { profile, subjects, tasks, exams, activities, toggleTaskComplete, syllabus } = useAcademic();

  const totalSubjects = subjects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const incompleteTasks = tasks.filter(t => t.status === 'Incomplete').length;

  const upcomingExams = exams
    .filter(e => getDaysRemaining(e.date) >= 0)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const todayTasks = tasks.filter(t => isDueToday(t.due_date));

  const upcomingDeadlines = tasks
    .filter(t => t.status !== 'Completed' && t.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5);

  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const subjectMap = useMemo(() => {
    const map = {};
    subjects.forEach(s => { map[s.id] = s; });
    return map;
  }, [subjects]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-700/40">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/4 -top-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-4">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/20 shadow-md flex-shrink-0"
            />
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 mb-2 border border-white/10">
                <i className="fas fa-graduation-cap"></i>
                <span>{profile.course} • {profile.semester}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold font-heading tracking-tight">
                Welcome Back, {profile.name}! 🚀
              </h1>
              <p className="text-indigo-200 text-xs sm:text-sm mt-1 max-w-xl">
                Student ID: <strong className="text-white">{profile.rollNo}</strong> • {profile.university}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewTaskModal}
              className="px-5 py-2.5 rounded-2xl bg-white text-indigo-950 hover:bg-indigo-50 font-bold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <i className="fas fa-plus text-indigo-600"></i>
              <span>+ Add Task</span>
            </button>
            <button
              onClick={onOpenNewProfileModal}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md border border-white/20 transition flex items-center space-x-2"
            >
              <i className="fas fa-user-plus"></i>
              <span>New Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
        <StatCard
          title="Total Subjects"
          value={totalSubjects}
          icon="fa-book"
          colorClass="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          bgGradient="bg-white dark:bg-gray-800/80"
          subtext="Enrolled courses"
          onClick={() => setActiveTab('subjects')}
        />
        <StatCard
          title="Total Tasks"
          value={totalTasks}
          icon="fa-tasks"
          colorClass="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
          bgGradient="bg-white dark:bg-gray-800/80"
          subtext="All assignments"
          onClick={() => setActiveTab('tasks')}
        />
        <StatCard
          title="Completed"
          value={completedTasks}
          icon="fa-check-circle"
          colorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          bgGradient="bg-white dark:bg-gray-800/80"
          subtext={`${overallProgress}% success rate`}
          onClick={() => setActiveTab('completed-tasks')}
        />
        <StatCard
          title="In Progress"
          value={inProgressTasks}
          icon="fa-spinner"
          colorClass="bg-purple-500/10 text-purple-600 dark:text-purple-400"
          bgGradient="bg-white dark:bg-gray-800/80"
          subtext="Active assignments"
          onClick={() => setActiveTab('in-progress')}
        />
        <StatCard
          title="Incomplete"
          value={incompleteTasks}
          icon="fa-hourglass-start"
          colorClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          bgGradient="bg-white dark:bg-gray-800/80"
          subtext="To-do backlog"
          onClick={() => setActiveTab('incomplete')}
        />
        <StatCard
          title="Upcoming Exams"
          value={upcomingExams.length}
          icon="fa-file-signature"
          colorClass="bg-rose-500/10 text-rose-600 dark:text-rose-400"
          bgGradient="bg-white dark:bg-gray-800/80"
          subtext="Scheduled tests"
          onClick={() => setActiveTab('exams')}
        />
        <StatCard
          title="Deadlines"
          value={upcomingDeadlines.length}
          icon="fa-stopwatch"
          colorClass="bg-teal-500/10 text-teal-600 dark:text-teal-400"
          bgGradient="bg-white dark:bg-gray-800/80"
          subtext="Due next 14 days"
          onClick={() => setActiveTab('tasks')}
        />
      </div>

      {/* Main Grid: Left Column (Tasks & Deadlines) | Right Column (Progress & Exams & Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-8">

          {/* Today's Tasks Section */}
          <div className="bg-white dark:bg-gray-800/90 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <i className="fas fa-calendar-check text-lg"></i>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-white">Today's Tasks</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Action items scheduled or due today</p>
                </div>
              </div>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                {todayTasks.length} Due Today
              </span>
            </div>

            {todayTasks.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-dashed border-gray-200 dark:border-gray-700">
                <i className="fas fa-award text-3xl text-emerald-500 mb-2"></i>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">All clear for today!</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">No tasks due today. You can relax or add a new task.</p>
                <button
                  onClick={onOpenNewTaskModal}
                  className="mt-3 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition"
                >
                  + Add Today's Goal
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {todayTasks.map(task => {
                  const sub = subjectMap[task.subject_id];
                  const isDone = task.status === 'Completed';
                  const isOver = isTaskOverdue(task);

                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${isDone
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50'
                          : isOver
                            ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60'
                            : 'bg-gray-50/70 dark:bg-gray-750 border-gray-200/80 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                        }`}
                    >
                      <div className="flex items-start space-x-3">
                        <button
                          onClick={() => toggleTaskComplete(task.id)}
                          className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${isDone
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-gray-400 dark:border-gray-600 hover:border-indigo-600 bg-white dark:bg-gray-700 text-transparent hover:text-gray-300'
                            }`}
                        >
                          <i className="fas fa-check text-xs"></i>
                        </button>

                        <div>
                          <h4 className={`text-sm font-semibold ${isDone ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                            {task.title}
                          </h4>

                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            {sub && (
                              <span
                                className="text-xs px-2 py-0.5 rounded font-medium text-white shadow-xs"
                                style={{ backgroundColor: sub.color || '#6366f1' }}
                              >
                                {sub.code || sub.name}
                              </span>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getCategoryColor(task.category)}`}>
                              {task.category}
                            </span>
                            {getPriorityBadge(task.priority)}
                            {task.due_time && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                <i className="far fa-clock mr-1"></i> {task.due_time}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {isOver && !isDone && (
                        <span className="px-2 py-1 rounded-md text-[10px] font-extrabold uppercase bg-rose-600 text-white glow-overdue tracking-wider">
                          OVERDUE
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Deadlines Timeline */}
          <div className="bg-white dark:bg-gray-800/90 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                  <i className="fas fa-hourglass-half text-lg"></i>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-white">Upcoming Deadlines</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Assignments and submissions in queue</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View All Tasks →
              </button>
            </div>

            {upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">No pending deadlines on your radar.</p>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map(task => {
                  const sub = subjectMap[task.subject_id];
                  const daysLeft = getDaysRemaining(task.due_date);
                  const isOver = isTaskOverdue(task);

                  let countdownText = "";
                  let countdownClass = "";

                  if (isOver) {
                    countdownText = "OVERDUE";
                    countdownClass = "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 font-bold border-rose-300 dark:border-rose-800";
                  } else if (daysLeft === 0) {
                    countdownText = "Due Today";
                    countdownClass = "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 font-semibold border-amber-300 dark:border-amber-800";
                  } else if (daysLeft === 1) {
                    countdownText = "Tomorrow";
                    countdownClass = "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 font-semibold border-teal-300 dark:border-teal-800";
                  } else {
                    countdownText = `${daysLeft} Days Left`;
                    countdownClass = "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-semibold border-blue-300 dark:border-blue-800";
                  }

                  return (
                    <div
                      key={task.id}
                      className="p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-800 border border-gray-200/70 dark:border-gray-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-xs transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          {sub && (
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: sub.color || '#6366f1' }}
                            ></span>
                          )}
                          <h5 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {task.title}
                          </h5>
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                          <span>{sub?.name || "General"}</span>
                          <span>•</span>
                          <span>Due {formatDate(task.due_date)} {task.due_time && `at ${task.due_time}`}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 self-end sm:self-auto">
                        <span className={`px-2.5 py-1 rounded-lg text-xs border ${countdownClass}`}>
                          {countdownText}
                        </span>
                        {task.status === 'In Progress' && (
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pomodoro study widget */}
          <FocusStudyTimer />

        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-8">

          {/* Academic Progress Summary */}
          <div className="bg-white dark:bg-gray-800/90 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-white flex items-center space-x-2">
                <i className="fas fa-chart-line text-indigo-500"></i>
                <span>Academic Progress</span>
              </h3>
              <button
                onClick={() => setActiveTab('progress')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Detailed Stats →
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/20 border border-indigo-100 dark:border-indigo-900/40 mb-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Overall Task Completion</p>
                  <h4 className="text-2xl font-extrabold font-heading text-indigo-950 dark:text-indigo-100">{overallProgress}%</h4>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold px-2 py-1 rounded bg-indigo-600 text-white">
                    {completedTasks} / {totalTasks} Tasks
                  </span>
                </div>
              </div>

              <div className="w-full bg-gray-200 dark:bg-gray-700 h-3.5 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 h-full rounded-full transition-all duration-700 progress-striped"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Subject-Wise Mini Progress Bars */}
            <div className="space-y-3.5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400">Subject-wise Syllabus & Tasks</h5>
              {subjects.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No subjects added yet.</p>
              ) : (
                subjects.slice(0, 4).map(sub => {
                  const subUnits = syllabus.filter(s => s.subject_id === sub.id);
                  let subTopicsCount = 0;
                  let subTopicsDone = 0;
                  subUnits.forEach(u => u.topics.forEach(t => {
                    subTopicsCount++;
                    if (t.completed) subTopicsDone++;
                  }));
                  const sylRate = subTopicsCount > 0 ? Math.round((subTopicsDone / subTopicsCount) * 100) : 0;

                  return (
                    <div key={sub.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[180px]">
                          {sub.name}
                        </span>
                        <span className="font-mono text-gray-500 dark:text-gray-400">
                          {sylRate}% Syllabus
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${sylRate}%`, backgroundColor: sub.color || '#6366f1' }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Upcoming Exams Highlight */}
          <div className="bg-white dark:bg-gray-800/90 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-white flex items-center space-x-2">
                <i className="fas fa-file-alt text-rose-500"></i>
                <span>Upcoming Exams</span>
              </h3>
              <button
                onClick={() => setActiveTab('exams')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Exams Hub →
              </button>
            </div>

            {upcomingExams.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No upcoming exams scheduled.</p>
            ) : (
              <div className="space-y-3">
                {upcomingExams.slice(0, 3).map(exam => {
                  const daysLeft = getDaysRemaining(exam.date);

                  return (
                    <div
                      key={exam.id}
                      className="p-4 rounded-2xl bg-gradient-to-r from-rose-50/50 to-orange-50/40 dark:from-rose-950/20 dark:to-orange-950/10 border border-rose-200/80 dark:border-rose-900/40 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-rose-600 text-white">
                          {exam.exam_type}
                        </span>
                        <span className="text-xs font-bold text-rose-700 dark:text-rose-300 font-heading">
                          {daysLeft === 0 ? 'TODAY 🔥' : daysLeft === 1 ? 'TOMORROW' : `${daysLeft} Days Remaining`}
                        </span>
                      </div>

                      <h5 className="text-sm font-bold text-gray-900 dark:text-white">
                        {exam.exam_name}
                      </h5>

                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 pt-1">
                        <span><i className="far fa-calendar mr-1"></i> {formatDate(exam.date)}</span>
                        <span><i className="fas fa-door-open mr-1"></i> {exam.room || "Main Hall"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Activity Log */}
          <div className="bg-white dark:bg-gray-800/90 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-white flex items-center space-x-2">
                <i className="fas fa-history text-indigo-500"></i>
                <span>Recent Activity</span>
              </h3>
            </div>

            {activities.length === 0 ? (
              <p className="text-sm text-gray-400 py-3 text-center">No activity recorded for this profile yet.</p>
            ) : (
              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
                {activities.slice(0, 5).map(act => (
                  <div key={act.id} className="relative flex items-start space-x-3 pl-2">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] z-10 ring-4 ring-white dark:ring-gray-800">
                      <i className={`fas fa-${act.icon || 'circle'}`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-800 dark:text-gray-200 leading-snug">{act.text}</p>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// VIEW 2: SYLLABUS MANAGEMENT SYSTEM
// -------------------------------------------------------------
function SyllabusView({ onOpenNewSubjectModal }) {
  const { subjects, syllabus, addUnit, updateUnit, deleteUnit, addTopic, toggleTopicCompleted, toggleTopicImportant, deleteTopic } = useAcademic();
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || "");
  const [newUnitName, setNewUnitName] = useState("");
  const [newTopicText, setNewTopicText] = useState({});
  const [isImportantChecked, setIsImportantChecked] = useState({});
  const [editingUnitId, setEditingUnitId] = useState(null);
  const [editingUnitName, setEditingUnitName] = useState("");

  useEffect(() => {
    if (subjects.length > 0 && (!selectedSubjectId || !subjects.find(s => s.id === selectedSubjectId))) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  const activeSubject = subjects.find(s => s.id === selectedSubjectId);
  const subjectUnits = syllabus.filter(s => s.subject_id === selectedSubjectId);

  let totalTopics = 0;
  let completedTopics = 0;
  subjectUnits.forEach(u => {
    u.topics.forEach(t => {
      totalTopics++;
      if (t.completed) completedTopics++;
    });
  });
  const subjectProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const handleAddUnit = (e) => {
    e.preventDefault();
    if (!newUnitName.trim() || !selectedSubjectId) return;
    addUnit(selectedSubjectId, newUnitName.trim());
    setNewUnitName("");
  };

  const handleAddTopic = (unitId) => {
    const text = newTopicText[unitId];
    if (!text || !text.trim()) return;
    const isImp = !!isImportantChecked[unitId];
    addTopic(unitId, text.trim(), isImp);
    setNewTopicText(prev => ({ ...prev, [unitId]: "" }));
    setIsImportantChecked(prev => ({ ...prev, [unitId]: false }));
  };

  const handleSaveUnitEdit = (unitId) => {
    if (editingUnitName.trim()) {
      updateUnit(unitId, editingUnitName.trim());
    }
    setEditingUnitId(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Syllabus Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track units, modules, and important topic masteries</p>
        </div>
        <button
          onClick={onOpenNewSubjectModal}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition flex items-center space-x-2 self-start"
        >
          <i className="fas fa-plus"></i>
          <span>+ Add Subject</span>
        </button>
      </div>

      {subjects.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
          <p className="text-gray-500">No subjects added yet.</p>
          <button
            onClick={onOpenNewSubjectModal}
            className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            + Add Subject
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {subjects.map(sub => {
            const isSelected = sub.id === selectedSubjectId;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubjectId(sub.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 border ${isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                  }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: isSelected ? '#ffffff' : (sub.color || '#6366f1') }}
                ></span>
                <span>{sub.code || sub.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {activeSubject && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800/95 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold text-white shadow-xs" style={{ backgroundColor: activeSubject.color || '#6366f1' }}>
                    {activeSubject.code}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {activeSubject.semester} • {activeSubject.credits} Credits
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-gray-900 dark:text-white">
                  {activeSubject.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Instructor: <strong className="text-gray-700 dark:text-gray-300">{activeSubject.teacher || "Faculty"}</strong>
                </p>
                {activeSubject.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 max-w-2xl">{activeSubject.description}</p>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-200/80 dark:border-gray-700 min-w-[280px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Syllabus Completion</span>
                  <span className="text-lg font-extrabold font-heading text-indigo-600 dark:text-indigo-400">{subjectProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${subjectProgress}%`, backgroundColor: activeSubject.color || '#6366f1' }}
                  ></div>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 text-right">
                  {completedTopics} of {totalTopics} topics completed
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleAddUnit} className="bg-white dark:bg-gray-800/80 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex items-center gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="e.g. Unit 4: Transport Layer & TCP Congestion Control"
                value={newUnitName}
                onChange={e => setNewUnitName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={!newUnitName.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm transition flex items-center space-x-2"
            >
              <i className="fas fa-folder-plus"></i>
              <span>Add Unit</span>
            </button>
          </form>

          <div className="space-y-4">
            {subjectUnits.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                <i className="fas fa-book-open text-3xl text-gray-400 mb-2"></i>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No syllabus units created yet.</p>
                <p className="text-xs text-gray-400 mt-1">Use the field above to add your first unit or chapter.</p>
              </div>
            ) : (
              subjectUnits.map((unit, uIdx) => {
                const uTotal = unit.topics.length;
                const uCompleted = unit.topics.filter(t => t.completed).length;
                const uPercent = uTotal > 0 ? Math.round((uCompleted / uTotal) * 100) : 0;
                const isEditing = editingUnitId === unit.id;

                return (
                  <div
                    key={unit.id}
                    className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
                  >
                    <div className="p-5 bg-gray-50/70 dark:bg-gray-750 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                          U{uIdx + 1}
                        </span>

                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={editingUnitName}
                              onChange={e => setEditingUnitName(e.target.value)}
                              className="px-3 py-1 rounded-lg text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                            />
                            <button
                              onClick={() => handleSaveUnitEdit(unit.id)}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingUnitId(null)}
                              className="px-2.5 py-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div>
                            <h4 className="font-heading font-bold text-base text-gray-900 dark:text-white">
                              {unit.unit_name}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {uCompleted}/{uTotal} topics completed ({uPercent}%)
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 self-end sm:self-auto">
                        <div className="w-28 bg-gray-200 dark:bg-gray-600 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uPercent}%` }}
                          ></div>
                        </div>

                        <button
                          onClick={() => {
                            setEditingUnitId(unit.id);
                            setEditingUnitName(unit.unit_name);
                          }}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 transition text-xs"
                          title="Edit Unit Name"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => deleteUnit(unit.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 transition text-xs"
                          title="Delete Unit"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      {unit.topics.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No topics listed in this unit yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {unit.topics.map(topic => (
                            <div
                              key={topic.id}
                              className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${topic.completed
                                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40'
                                  : 'bg-gray-50/50 dark:bg-gray-750/50 border-gray-200/60 dark:border-gray-700'
                                }`}
                            >
                              <div className="flex items-center space-x-3 flex-1">
                                <input
                                  type="checkbox"
                                  checked={topic.completed}
                                  onChange={() => toggleTopicCompleted(unit.id, topic.id)}
                                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                                <span className={`text-sm ${topic.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>
                                  {topic.title}
                                </span>
                              </div>

                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => toggleTopicImportant(unit.id, topic.id)}
                                  className={`p-1.5 rounded-lg text-xs transition ${topic.important
                                      ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                                      : 'text-gray-300 hover:text-amber-400'
                                    }`}
                                  title="Mark as Exam Important Topic"
                                >
                                  <i className="fas fa-star"></i>
                                </button>
                                <button
                                  onClick={() => deleteTopic(unit.id, topic.id)}
                                  className="p-1.5 text-gray-300 hover:text-rose-500 transition text-xs"
                                  title="Delete Topic"
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                        <input
                          type="text"
                          placeholder="+ Add topic (e.g. Sliding Window Protocol & CRC)"
                          value={newTopicText[unit.id] || ""}
                          onChange={e => setNewTopicText({ ...newTopicText, [unit.id]: e.target.value })}
                          onKeyDown={e => { if (e.key === 'Enter') handleAddTopic(unit.id); }}
                          className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="flex items-center space-x-2 self-end sm:self-auto">
                          <label className="flex items-center space-x-1 text-xs text-amber-600 dark:text-amber-400 cursor-pointer whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={!!isImportantChecked[unit.id]}
                              onChange={e => setIsImportantChecked({ ...isImportantChecked, [unit.id]: e.target.checked })}
                              className="rounded text-amber-500 cursor-pointer"
                            />
                            <span>★ Important</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => handleAddTopic(unit.id)}
                            className="px-3 py-2 rounded-xl bg-gray-900 hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600 text-white text-xs font-semibold transition"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// VIEW 3: EXAM SCHEDULING SYSTEM
// -------------------------------------------------------------
function ExamsView({ onOpenNewExamModal }) {
  const { exams, subjects, deleteExam } = useAcademic();
  const [viewMode, setViewMode] = useState('cards');
  const [filterType, setFilterType] = useState('All');

  const subjectMap = useMemo(() => {
    const map = {};
    subjects.forEach(s => { map[s.id] = s; });
    return map;
  }, [subjects]);

  const examTypes = ['All', 'Internal', 'Mid-Term', 'Practical', 'Viva', 'End Semester', 'Other'];

  const filteredExams = exams.filter(e => {
    if (filterType !== 'All' && e.exam_type !== filterType) return false;
    return true;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Exam Scheduling System</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Timetable, countdowns, exam rooms, and viva preparations</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="p-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${viewMode === 'cards' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-xs' : 'text-gray-500'
                }`}
            >
              <i className="fas fa-th-large mr-1.5"></i> Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${viewMode === 'table' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-xs' : 'text-gray-500'
                }`}
            >
              <i className="fas fa-table mr-1.5"></i> Table
            </button>
          </div>
          <button
            onClick={onOpenNewExamModal}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-sm transition flex items-center space-x-2"
          >
            <i className="fas fa-plus"></i>
            <span>+ Schedule Exam</span>
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {examTypes.map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${filterType === t
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {filteredExams.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
          <i className="fas fa-calendar-times text-4xl text-gray-400 mb-3"></i>
          <p className="text-base font-semibold text-gray-700 dark:text-gray-300">No exams scheduled under this category</p>
          <button
            onClick={onOpenNewExamModal}
            className="mt-3 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold"
          >
            + Add Exam Schedule
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map(exam => {
            const sub = subjectMap[exam.subject_id];
            const daysLeft = getDaysRemaining(exam.date);
            const status = getExamStatus(exam.date);

            return (
              <div
                key={exam.id}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                      {exam.exam_type}
                    </span>

                    <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${status === 'Today' ? 'bg-amber-500 text-white animate-bounce' :
                        status === 'Upcoming' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' :
                          'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                      {status === 'Today' ? 'TODAY 🔥' : status === 'Upcoming' ? `${daysLeft} Days Left` : 'Completed'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-1">
                    {exam.exam_name}
                  </h3>

                  <div className="flex items-center space-x-2 text-xs font-semibold text-gray-600 dark:text-gray-400 mb-4">
                    {sub && (
                      <span className="px-2 py-0.5 rounded text-white text-[11px]" style={{ backgroundColor: sub.color || '#6366f1' }}>
                        {sub.code || sub.name}
                      </span>
                    )}
                    <span>{sub?.name}</span>
                  </div>

                  <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-750 p-3.5 rounded-2xl mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400"><i className="far fa-calendar mr-1.5"></i> Date:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{formatDate(exam.date)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400"><i className="far fa-clock mr-1.5"></i> Time & Duration:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{exam.time || "TBA"} ({exam.duration || "2 hrs"})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400"><i className="fas fa-map-marker-alt mr-1.5"></i> Room / Hall:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{exam.room || "Main Auditorium"}</span>
                    </div>
                  </div>

                  {exam.instructions && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                      <strong>Instructions:</strong> {exam.instructions}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-mono text-[11px]">ID: {exam.id}</span>
                  <button
                    onClick={() => deleteExam(exam.id)}
                    className="text-gray-400 hover:text-rose-600 transition"
                  >
                    <i className="fas fa-trash-alt mr-1"></i> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-750 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="py-4 px-6">Subject</th>
                <th className="py-4 px-6">Exam Name</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Date & Time</th>
                <th className="py-4 px-6">Room</th>
                <th className="py-4 px-6">Countdown Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredExams.map(exam => {
                const sub = subjectMap[exam.subject_id];
                const daysLeft = getDaysRemaining(exam.date);
                const status = getExamStatus(exam.date);

                return (
                  <tr key={exam.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-750/50 transition">
                    <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      {sub ? `${sub.code} - ${sub.name}` : "General"}
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                      {exam.exam_name}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs px-2 py-0.5 rounded font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                        {exam.exam_type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                      {formatDate(exam.date)} at {exam.time || "09:00"}
                    </td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                      {exam.room || "TBA"}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${status === 'Today' ? 'bg-amber-500 text-white' :
                          status === 'Upcoming' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' :
                            'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                        {status === 'Today' ? 'TODAY' : status === 'Upcoming' ? `${daysLeft} Days Remaining` : 'Completed'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => deleteExam(exam.id)}
                        className="text-gray-400 hover:text-rose-600 transition"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// VIEW 4: TASK MANAGEMENT & SUB-TABLES
// -------------------------------------------------------------
function TasksView({ activeSubTab = 'all', onOpenNewTaskModal }) {
  const { tasks, subjects, deleteTask, toggleTaskComplete, updateTask } = useAcademic();
  const [currentTab, setCurrentTab] = useState(activeSubTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [sortBy, setSortBy] = useState("deadline");

  useEffect(() => {
    if (activeSubTab) setCurrentTab(activeSubTab);
  }, [activeSubTab]);

  const subjectMap = useMemo(() => {
    const map = {};
    subjects.forEach(s => { map[s.id] = s; });
    return map;
  }, [subjects]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (currentTab === 'completed' && task.status !== 'Completed') return false;
      if (currentTab === 'in-progress' && task.status !== 'In Progress') return false;
      if (currentTab === 'incomplete' && task.status !== 'Incomplete') return false;
      if (selectedSubject !== 'All' && task.subject_id !== selectedSubject) return false;
      if (selectedCategory !== 'All' && task.category !== selectedCategory) return false;
      if (selectedPriority !== 'All' && task.priority !== selectedPriority) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const sub = subjectMap[task.subject_id];
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description?.toLowerCase().includes(q);
        const matchSub = sub?.name.toLowerCase().includes(q) || sub?.code.toLowerCase().includes(q);
        const matchCat = task.category?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchSub && !matchCat) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'deadline') {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
      } else if (sortBy === 'priority') {
        const weights = { High: 3, Medium: 2, Low: 1 };
        return (weights[b.priority] || 0) - (weights[a.priority] || 0);
      } else if (sortBy === 'created') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === 'alpha') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [tasks, currentTab, selectedSubject, selectedCategory, selectedPriority, searchQuery, sortBy, subjectMap]);

  const categories = ['All', 'Assignment', 'Homework', 'Project', 'Practical', 'Study', 'Revision', 'Exam Preparation', 'Personal', 'Other'];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Task Management Center</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage assignments, deadlines, priorities and progress trackers</p>
        </div>
        <button
          onClick={onOpenNewTaskModal}
          className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center space-x-2 self-start"
        >
          <i className="fas fa-plus"></i>
          <span>+ Add New Task</span>
        </button>
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none border-b border-gray-200 dark:border-gray-800">
        {[
          { id: 'all', label: 'All Tasks', icon: 'fa-list-check', count: tasks.length },
          { id: 'incomplete', label: 'Incomplete Tasks', icon: 'fa-hourglass-start', count: tasks.filter(t => t.status === 'Incomplete').length },
          { id: 'in-progress', label: 'In-Progress Tasks', icon: 'fa-spinner', count: tasks.filter(t => t.status === 'In Progress').length },
          { id: 'completed', label: 'Completed Tasks', icon: 'fa-check-circle', count: tasks.filter(t => t.status === 'Completed').length },
          { id: 'kanban', label: 'Kanban Board', icon: 'fa-columns', count: null }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${currentTab === tab.id
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
          >
            <i className={`fas ${tab.icon}`}></i>
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className="px-2 py-0.5 rounded-full text-[11px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {currentTab !== 'kanban' && (
        <div className="bg-white dark:bg-gray-800/90 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative lg:col-span-2">
              <i className="fas fa-search absolute left-3.5 top-3 text-gray-400 text-xs"></i>
              <input
                type="text"
                placeholder="Search tasks, subjects, keywords..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Subjects</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="deadline">Sort by Deadline</option>
                <option value="priority">Sort by Priority</option>
                <option value="created">Sort by Date Created</option>
                <option value="alpha">Sort Alphabetically</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {currentTab === 'kanban' ? (
        <KanbanBoard onOpenNewTaskModal={onOpenNewTaskModal} />
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
          <i className="fas fa-clipboard-list text-4xl text-gray-400 mb-3"></i>
          <p className="text-base font-semibold text-gray-700 dark:text-gray-300">No tasks match your selected criteria</p>
          <button
            onClick={onOpenNewTaskModal}
            className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            + Create New Task
          </button>
        </div>
      ) : currentTab === 'completed' ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-750 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="py-4 px-6">Task</th>
                <th className="py-4 px-6">Subject</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Completed Date</th>
                <th className="py-4 px-6">Priority</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredTasks.map(task => {
                const sub = subjectMap[task.subject_id];
                return (
                  <tr key={task.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-750/50">
                    <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white flex items-center space-x-3">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">
                        <i className="fas fa-check"></i>
                      </span>
                      <span className="line-through text-gray-500 dark:text-gray-400">{task.title}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                      {sub ? `${sub.code} - ${sub.name}` : "General"}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getCategoryColor(task.category)}`}>
                        {task.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {formatDate(task.completed_at || task.created_at)}
                    </td>
                    <td className="py-4 px-6">
                      {getPriorityBadge(task.priority)}
                    </td>
                    <td className="py-4 px-6 text-right space-x-3">
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                        title="Re-open task"
                      >
                        Re-open
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-gray-400 hover:text-rose-600 transition"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : currentTab === 'in-progress' ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-750 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="py-4 px-6">Task</th>
                <th className="py-4 px-6">Subject</th>
                <th className="py-4 px-6">Start Date</th>
                <th className="py-4 px-6">Deadline</th>
                <th className="py-4 px-6 min-w-[200px]">Progress (%)</th>
                <th className="py-4 px-6">Priority</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredTasks.map(task => {
                const sub = subjectMap[task.subject_id];
                const isOver = isTaskOverdue(task);

                return (
                  <tr key={task.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-750/50">
                    <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      <div>
                        {task.title}
                        {isOver && (
                          <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white uppercase glow-overdue">
                            OVERDUE
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300 text-xs font-semibold">
                      {sub ? `${sub.code}` : "General"}
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500">
                      {formatDate(task.start_date || task.created_at)}
                    </td>
                    <td className="py-4 px-6 text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {formatDate(task.due_date)} {task.due_time}
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">{task.progress}%</span>
                          <span className="text-[10px] text-gray-400">Slide to update</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={task.progress}
                          onChange={(e) => updateTask(task.id, { progress: Number(e.target.value) })}
                          className="w-full accent-indigo-600 cursor-pointer h-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getPriorityBadge(task.priority)}
                    </td>
                    <td className="py-4 px-6 text-right space-x-3">
                      <button
                        onClick={() => updateTask(task.id, { status: 'Completed', progress: 100 })}
                        className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 hover:bg-emerald-200 text-xs font-semibold"
                        title="Mark Complete"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-gray-400 hover:text-rose-600 transition"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-750 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="py-4 px-6">Task</th>
                <th className="py-4 px-6">Subject</th>
                <th className="py-4 px-6">Deadline</th>
                <th className="py-4 px-6">Priority</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Reminder</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredTasks.map(task => {
                const sub = subjectMap[task.subject_id];
                const isOver = isTaskOverdue(task);
                const isDone = task.status === 'Completed';

                return (
                  <tr
                    key={task.id}
                    className={`hover:bg-gray-50/50 dark:hover:bg-gray-750/50 transition ${isOver && !isDone ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''
                      }`}
                  >
                    <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleTaskComplete(task.id)}
                          className={`w-5 h-5 rounded border flex items-center justify-center text-xs transition ${isDone
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-gray-400 hover:border-indigo-600 bg-white dark:bg-gray-700'
                            }`}
                        >
                          {isDone && <i className="fas fa-check"></i>}
                        </button>
                        <span className={isDone ? 'line-through text-gray-400' : ''}>{task.title}</span>
                      </div>
                      {isOver && !isDone && (
                        <span className="mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-600 text-white uppercase glow-overdue">
                          OVERDUE — Action Required
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300 text-xs font-semibold">
                      {sub ? `${sub.code} - ${sub.name}` : "General"}
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-600 dark:text-gray-300">
                      <div>{formatDate(task.due_date)}</div>
                      {task.due_time && <div className="text-[11px] text-gray-400">{task.due_time}</div>}
                    </td>
                    <td className="py-4 px-6">
                      {getPriorityBadge(task.priority)}
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={task.status}
                        onChange={(e) => updateTask(task.id, { status: e.target.value })}
                        className={`text-xs px-2.5 py-1 rounded-xl font-semibold border focus:outline-none ${task.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                            task.status === 'In Progress' ? 'bg-purple-50 text-purple-700 border-purple-300' :
                              'bg-amber-50 text-amber-700 border-amber-300'
                          }`}
                      >
                        <option value="Incomplete">Incomplete</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500">
                      {task.reminder && task.reminder !== 'None' ? (
                        <span className="text-indigo-600 dark:text-indigo-400 flex items-center">
                          <i className="far fa-bell mr-1"></i> {task.reminder}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right space-x-3">
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-gray-400 hover:text-rose-600 transition"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// KANBAN BOARD VIEW
// -------------------------------------------------------------
function KanbanBoard({ onOpenNewTaskModal }) {
  const { tasks, subjects, updateTask, deleteTask } = useAcademic();

  const columns = [
    { id: 'Incomplete', label: 'To Do / Incomplete', color: 'border-amber-500 text-amber-600', icon: 'fa-circle-dot' },
    { id: 'In Progress', label: 'In Progress', color: 'border-purple-500 text-purple-600', icon: 'fa-spinner' },
    { id: 'Completed', label: 'Completed', color: 'border-emerald-500 text-emerald-600', icon: 'fa-circle-check' }
  ];

  const subjectMap = useMemo(() => {
    const map = {};
    subjects.forEach(s => { map[s.id] = s; });
    return map;
  }, [subjects]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id);

        return (
          <div key={col.id} className="bg-gray-50 dark:bg-gray-800/60 rounded-3xl p-4 border border-gray-200/80 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center space-x-2">
                <i className={`fas ${col.icon} ${col.color}`}></i>
                <h4 className="font-heading font-bold text-sm text-gray-900 dark:text-white">{col.label}</h4>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-xs">
                {colTasks.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[320px]">
              {colTasks.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                  No tasks here
                </div>
              ) : (
                colTasks.map(task => {
                  const sub = subjectMap[task.subject_id];
                  const isOver = isTaskOverdue(task);

                  return (
                    <div
                      key={task.id}
                      className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200/70 dark:border-gray-700 shadow-xs hover:shadow-md transition space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${getCategoryColor(task.category)}`}>
                          {task.category}
                        </span>
                        {getPriorityBadge(task.priority)}
                      </div>

                      <h5 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                        {task.title}
                      </h5>

                      {sub && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sub.color || '#6366f1' }}></span>
                          <span>{sub.code} - {sub.name}</span>
                        </div>
                      )}

                      {task.due_date && (
                        <div className="flex items-center justify-between text-xs pt-1 text-gray-500">
                          <span><i className="far fa-clock mr-1"></i> {formatDate(task.due_date)}</span>
                          {isOver && task.status !== 'Completed' && (
                            <span className="text-rose-600 font-bold text-[10px] uppercase">Overdue</span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                        <select
                          value={task.status}
                          onChange={(e) => updateTask(task.id, { status: e.target.value })}
                          className="text-[11px] font-semibold bg-gray-50 dark:bg-gray-700 rounded-lg px-2 py-1 text-gray-700 dark:text-gray-200 border-0"
                        >
                          <option value="Incomplete">Move to Incomplete</option>
                          <option value="In Progress">Move to In Progress</option>
                          <option value="Completed">Move to Completed</option>
                        </select>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-gray-400 hover:text-rose-600 text-xs"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// -------------------------------------------------------------
// VIEW 5: SUBJECTS MANAGEMENT VIEW
// -------------------------------------------------------------
function SubjectsView({ onOpenNewSubjectModal, setActiveTab }) {
  const { subjects, syllabus, tasks, exams, deleteSubject } = useAcademic();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Subject Directory</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage course curriculums, instructors, and credit allocations</p>
        </div>
        <button
          onClick={onOpenNewSubjectModal}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition flex items-center space-x-2"
        >
          <i className="fas fa-plus"></i>
          <span>+ Add Subject</span>
        </button>
      </div>

      {subjects.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
          <i className="fas fa-book-reader text-4xl text-gray-400 mb-3"></i>
          <p className="text-base font-semibold text-gray-700 dark:text-gray-300">No subjects configured</p>
          <button
            onClick={onOpenNewSubjectModal}
            className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            + Create First Subject
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(sub => {
            const subTasks = tasks.filter(t => t.subject_id === sub.id);
            const subCompleted = subTasks.filter(t => t.status === 'Completed').length;
            const subPending = subTasks.filter(t => t.status !== 'Completed').length;

            const subUnits = syllabus.filter(s => s.subject_id === sub.id);
            let totalTopics = 0;
            let completedTopics = 0;
            subUnits.forEach(u => u.topics.forEach(t => {
              totalTopics++;
              if (t.completed) completedTopics++;
            }));
            const syllabusProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

            const nextExam = exams
              .filter(e => e.subject_id === sub.id && getDaysRemaining(e.date) >= 0)
              .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

            return (
              <div
                key={sub.id}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className="px-3 py-1 rounded-xl text-xs font-bold text-white shadow-xs"
                      style={{ backgroundColor: sub.color || '#6366f1' }}
                    >
                      {sub.code}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      {sub.credits} Credits
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold font-heading text-gray-900 dark:text-white">
                      {sub.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Faculty: <strong className="text-gray-700 dark:text-gray-300">{sub.teacher || "TBA"}</strong> • {sub.semester}
                    </p>
                  </div>

                  {sub.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{sub.description}</p>
                  )}

                  <div className="space-y-1.5 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-750">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-gray-500">Syllabus Covered</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-mono">{syllabusProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${syllabusProgress}%`, backgroundColor: sub.color || '#6366f1' }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-750">
                      <p className="text-gray-400 text-[10px] uppercase font-bold">Total</p>
                      <p className="font-bold text-gray-900 dark:text-white mt-0.5">{subTasks.length}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20">
                      <p className="text-emerald-600 text-[10px] uppercase font-bold">Done</p>
                      <p className="font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">{subCompleted}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20">
                      <p className="text-amber-600 text-[10px] uppercase font-bold">Pending</p>
                      <p className="font-bold text-amber-700 dark:text-amber-300 mt-0.5">{subPending}</p>
                    </div>
                  </div>

                  {nextExam && (
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-xs flex items-center justify-between text-rose-700 dark:text-rose-300">
                      <span><i className="fas fa-file-alt mr-1"></i> {nextExam.exam_name}</span>
                      <span className="font-bold">{getDaysRemaining(nextExam.date)}d left</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setActiveTab('syllabus')}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    View Syllabus →
                  </button>
                  <button
                    onClick={() => deleteSubject(sub.id)}
                    className="text-gray-400 hover:text-rose-600 transition"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// VIEW 6: ACADEMIC CALENDAR VIEW
// -------------------------------------------------------------
function CalendarView({ onOpenNewTaskModal, onOpenNewExamModal }) {
  const { tasks, exams, reminders, subjects } = useAcademic();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const eventsByDate = useMemo(() => {
    const map = {};

    tasks.forEach(t => {
      if (t.due_date) {
        if (!map[t.due_date]) map[t.due_date] = [];
        map[t.due_date].push({ type: 'task', data: t, title: t.title, color: 'bg-blue-500' });
      }
    });

    exams.forEach(e => {
      if (e.date) {
        if (!map[e.date]) map[e.date] = [];
        map[e.date].push({ type: 'exam', data: e, title: `EXAM: ${e.exam_name}`, color: 'bg-rose-500' });
      }
    });

    reminders.forEach(r => {
      if (r.target_date) {
        if (!map[r.target_date]) map[r.target_date] = [];
        map[r.target_date].push({ type: 'reminder', data: r, title: `⏰ ${r.title}`, color: 'bg-emerald-500' });
      }
    });

    return map;
  }, [tasks, exams, reminders]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Academic Calendar</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Consolidated overview of exams, assignments, and reminder alerts</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleToday}
            className="px-3.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-xs font-semibold text-gray-700 dark:text-gray-200"
          >
            Today
          </button>
          <div className="flex items-center space-x-1">
            <button onClick={handlePrevMonth} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <i className="fas fa-chevron-left text-xs"></i>
            </button>
            <span className="font-heading font-bold text-sm text-gray-900 dark:text-white px-2">
              {monthNames[month]} {year}
            </span>
            <button onClick={handleNextMonth} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <i className="fas fa-chevron-right text-xs"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500"></span>
          <span className="text-gray-600 dark:text-gray-400">Exams & Tests</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          <span className="text-gray-600 dark:text-gray-400">Task Deadlines</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          <span className="text-gray-600 dark:text-gray-400">Scheduled Reminders</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 sm:p-6">
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-24 sm:h-28 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30"></div>
          ))}

          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const events = eventsByDate[dateStr] || [];
            const isTodayCell = isDueToday(dateStr);

            return (
              <div
                key={dateStr}
                onClick={() => events.length > 0 && setSelectedDayEvents({ date: dateStr, events })}
                className={`h-24 sm:h-28 rounded-2xl p-1.5 sm:p-2 border transition flex flex-col justify-between cursor-pointer ${isTodayCell
                    ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30'
                    : 'border-gray-100 dark:border-gray-700/80 bg-gray-50/60 dark:bg-gray-750/60 hover:bg-gray-100/80'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isTodayCell ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center' : 'text-gray-700 dark:text-gray-300'}`}>
                    {dayNum}
                  </span>
                  {events.length > 0 && (
                    <span className="text-[10px] font-bold text-gray-400">
                      {events.length}
                    </span>
                  )}
                </div>

                <div className="space-y-1 overflow-hidden">
                  {events.slice(0, 2).map((ev, eIdx) => (
                    <div
                      key={eIdx}
                      className={`text-[10px] px-1.5 py-0.5 rounded truncate text-white font-medium ${ev.color}`}
                    >
                      {ev.title}
                    </div>
                  ))}
                  {events.length > 2 && (
                    <div className="text-[9px] text-gray-400 font-bold">
                      +{events.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedDayEvents && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-6 border border-gray-100 dark:border-gray-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-white">
                Events on {formatDate(selectedDayEvents.date)}
              </h3>
              <button
                onClick={() => setSelectedDayEvents(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {selectedDayEvents.events.map((ev, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-200/80 dark:border-gray-700 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${ev.color}`}></span>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{ev.type}</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">{ev.title}</h4>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedDayEvents(null)}
              className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// VIEW 7: REMINDERS HUB
// -------------------------------------------------------------
function RemindersView() {
  const { reminders, addReminder, deleteReminder, dismissReminder, requestNotificationPermission, profile } = useAcademic();
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState(getRelativeDate(1));
  const [newTime, setNewTime] = useState("10:00");
  const [reminderType, setReminderType] = useState("1 hour before");

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addReminder({
      title: newTitle.trim(),
      item_type: "custom",
      item_id: null,
      target_date: newDate,
      target_time: newTime,
      reminder_type: reminderType
    });
    setNewTitle("");
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Reminders & Notification Engine</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Configured study alerts, audio chimes, and browser push notifications</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => playAudioChime('reminder')}
            className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-xs font-semibold text-gray-700 dark:text-gray-200 flex items-center space-x-1.5"
          >
            <i className="fas fa-volume-high text-indigo-500"></i>
            <span>Test Sound</span>
          </button>
          <button
            onClick={requestNotificationPermission}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition flex items-center space-x-1.5"
          >
            <i className="fas fa-bell"></i>
            <span>{profile.desktopNotifications ? 'Notifications Active' : 'Enable Browser Push'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h3 className="text-base font-bold font-heading text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <i className="fas fa-plus-circle text-indigo-500"></i>
          <span>Schedule New Study Alert</span>
        </h3>

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2">
            <input
              type="text"
              placeholder="Reminder label (e.g. Revise Computer Networks Unit 3)"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <input
              type="date"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <input
              type="time"
              value={newTime}
              onChange={e => setNewTime(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition"
          >
            + Set Reminder
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h4 className="font-heading font-bold text-base text-gray-900 dark:text-white">Active & Upcoming Reminders</h4>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600">
            {reminders.length} Total
          </span>
        </div>

        {reminders.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400">No active reminders configured.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-750 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="py-4 px-6">Reminder Title</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Alert Date & Time</th>
                <th className="py-4 px-6">Offset Type</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {reminders.map(rem => (
                <tr key={rem.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-750/50">
                  <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white">
                    <div className="flex items-center space-x-2">
                      <i className="far fa-bell text-indigo-500"></i>
                      <span>{rem.title}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-xs px-2 py-0.5 rounded font-bold uppercase bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      {rem.item_type || "General"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-gray-600 dark:text-gray-300">
                    {formatDate(rem.target_date)} at {rem.target_time || "12:00"}
                  </td>
                  <td className="py-4 px-6 text-xs text-gray-500">
                    {rem.reminder_type}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${rem.status === 'Dismissed' ? 'bg-gray-200 text-gray-600' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      }`}>
                      {rem.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    {rem.status !== 'Dismissed' && (
                      <button
                        onClick={() => dismissReminder(rem.id)}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        Dismiss
                      </button>
                    )}
                    <button
                      onClick={() => deleteReminder(rem.id)}
                      className="text-gray-400 hover:text-rose-600 transition ml-2"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// VIEW 8: PROGRESS & ANALYTICS DASHBOARD
// -------------------------------------------------------------
function ProgressView() {
  const { tasks, subjects, syllabus } = useAcademic();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const incompleteTasks = tasks.filter(t => t.status === 'Incomplete').length;
  const overdueTasks = tasks.filter(t => isTaskOverdue(t)).length;

  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const categoryCounts = useMemo(() => {
    const map = {};
    tasks.forEach(t => {
      map[t.category] = (map[t.category] || 0) + 1;
    });
    return map;
  }, [tasks]);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Academic Analytics & Progress</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Real-time productivity insights, subject masteries and completion velocities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm text-center">
          <p className="text-xs uppercase font-bold text-gray-400">Completed Velocity</p>
          <h3 className="text-3xl font-extrabold font-heading text-emerald-600 mt-1">{completedTasks}</h3>
          <p className="text-xs text-gray-500 mt-1">{overallProgress}% of total pipeline</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm text-center">
          <p className="text-xs uppercase font-bold text-gray-400">In-Progress Work</p>
          <h3 className="text-3xl font-extrabold font-heading text-purple-600 mt-1">{inProgressTasks}</h3>
          <p className="text-xs text-gray-500 mt-1">Currently in development</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm text-center">
          <p className="text-xs uppercase font-bold text-amber-600">Pending Backlog</p>
          <h3 className="text-3xl font-extrabold font-heading text-amber-600 mt-1">{incompleteTasks}</h3>
          <p className="text-xs text-gray-500 mt-1">Awaiting start</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm text-center">
          <p className="text-xs uppercase font-bold text-rose-500">Overdue Bottlenecks</p>
          <h3 className="text-3xl font-extrabold font-heading text-rose-600 mt-1">{overdueTasks}</h3>
          <p className="text-xs text-gray-500 mt-1">Requires immediate catch-up</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
        <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-white">Subject-Wise Mastery Breakdown</h3>

        {subjects.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No subjects configured.</p>
        ) : (
          <div className="space-y-5">
            {subjects.map(sub => {
              const subTasks = tasks.filter(t => t.subject_id === sub.id);
              const subDone = subTasks.filter(t => t.status === 'Completed').length;
              const taskRate = subTasks.length > 0 ? Math.round((subDone / subTasks.length) * 100) : 0;

              const subUnits = syllabus.filter(s => s.subject_id === sub.id);
              let sTopics = 0;
              let sTopicsDone = 0;
              subUnits.forEach(u => u.topics.forEach(t => {
                sTopics++;
                if (t.completed) sTopicsDone++;
              }));
              const sylRate = sTopics > 0 ? Math.round((sTopicsDone / sTopics) * 100) : 0;

              return (
                <div key={sub.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-200/60 dark:border-gray-700 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color || '#6366f1' }}></span>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">{sub.name} ({sub.code})</h4>
                    </div>
                    <div className="flex items-center space-x-4 text-xs font-mono">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">Tasks: {taskRate}%</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Syllabus: {sylRate}%</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>Task Completion</span>
                      <span>{subDone}/{subTasks.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${taskRate}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>Syllabus Topics Covered</span>
                      <span>{sTopicsDone}/{sTopics} topics</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${sylRate}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-white mb-4">Academic Category Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(categoryCounts).map(([cat, count]) => (
            <div key={cat} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-200/80 dark:border-gray-700">
              <span className={`text-[11px] px-2 py-0.5 rounded border font-medium ${getCategoryColor(cat)}`}>
                {cat}
              </span>
              <h4 className="text-2xl font-extrabold font-heading text-gray-900 dark:text-white mt-2">{count}</h4>
              <p className="text-[11px] text-gray-400">Tasks logged</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// VIEW 9: SETTINGS & PROFILES VIEW
// -------------------------------------------------------------
function SettingsView({ onOpenNewProfileModal }) {
  const { profile, setProfile, profiles, activeUserId, switchProfile, deleteProfile, resetToDefaultData, exportDataJSON, importDataJSON, addToast } = useAcademic();
  const [formData, setFormData] = useState({ ...profile });
  const fileInputRef = useRef(null);

  useEffect(() => {
    setFormData({ ...profile });
  }, [profile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setProfile(formData);
    addToast("Student Profile updated successfully!", "success");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      importDataJSON(event.target.result);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Settings & Student Accounts</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Switch student profiles, create new logins and manage database backups</p>
        </div>
        <button
          onClick={onOpenNewProfileModal}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-2 self-start"
        >
          <i className="fas fa-user-plus"></i>
          <span>+ Add New Login Profile</span>
        </button>
      </div>

      {/* Profile Switcher Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white flex items-center space-x-2">
            <i className="fas fa-users text-indigo-500"></i>
            <span>Active Student Profiles ({profiles.length})</span>
          </h3>
          <span className="text-xs text-gray-400">Switch profiles to view isolated student academic workspaces</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {profiles.map(p => {
            const isActive = p.id === activeUserId;
            return (
              <div
                key={p.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${isActive
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                    : 'bg-gray-50 dark:bg-gray-750 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <img
                    src={p.avatarUrl}
                    alt={p.name}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/30 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{p.name}</h4>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{p.course}</p>
                    <p className="text-[11px] text-gray-400 font-mono truncate">{p.rollNo} • {p.semester}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  {!isActive ? (
                    <button
                      onClick={() => switchProfile(p.id)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition"
                    >
                      Switch
                    </button>
                  ) : null}
                  {profiles.length > 1 && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete profile "${p.name}" and all their associated data?`)) {
                          deleteProfile(p.id);
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-rose-600 transition text-xs"
                      title="Delete profile"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Current Profile Form */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
          <i className="fas fa-user-circle text-indigo-500"></i>
          <span>Edit Active Profile Details: <span className="text-indigo-600">{profile.name}</span></span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Degree / Course</label>
              <input
                type="text"
                value={formData.course || ""}
                onChange={e => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Semester / Term</label>
              <input
                type="text"
                value={formData.semester || ""}
                onChange={e => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Roll / Student ID Number</label>
              <input
                type="text"
                value={formData.rollNo || ""}
                onChange={e => setFormData({ ...formData, rollNo: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">University / Institute</label>
              <input
                type="text"
                value={formData.university || ""}
                onChange={e => setFormData({ ...formData, university: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
            <label className="flex items-center space-x-2 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={!!formData.notificationSound}
                onChange={e => setFormData({ ...formData, notificationSound: e.target.checked })}
                className="rounded text-indigo-600 cursor-pointer"
              />
              <span>Enable Web Audio Synthesizer Chimes</span>
            </label>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Database Management & Backups */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white flex items-center space-x-2">
          <i className="fas fa-database text-teal-500"></i>
          <span>Data Storage & Backups</span>
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          All student accounts, academic workflows, subjects, syllabus items, exams, and tasks are saved securely in browser database storage.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={exportDataJSON}
            className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-800 dark:text-gray-200 font-semibold text-xs transition flex items-center space-x-2"
          >
            <i className="fas fa-file-export"></i>
            <span>Export JSON Backup</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-800 dark:text-gray-200 font-semibold text-xs transition flex items-center space-x-2"
          >
            <i className="fas fa-file-import"></i>
            <span>Import JSON Backup</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm("Reset all academic accounts and data to default university templates?")) {
                resetToDefaultData();
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 hover:bg-rose-100 text-xs font-semibold transition flex items-center space-x-2"
          >
            <i className="fas fa-rotate-left"></i>
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Progressive Web App (PWA) & Offline System */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white flex items-center space-x-2">
            <i className="fas fa-mobile-screen-button text-indigo-500"></i>
            <span>Progressive Web App (PWA) & Offline Engine</span>
          </h3>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            PWA Ready
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Workly operates as a standalone Progressive Web App with zero-latency offline caching. You can install it on iOS, Android, macOS, Windows, and Linux.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-200/60 dark:border-gray-700/60 space-y-1">
            <div className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-1.5">
              <i className="fas fa-signal text-emerald-500"></i>
              <span>Offline Capability</span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">100% Local & Offline. Never lose your assignment list without internet.</p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-200/60 dark:border-gray-700/60 space-y-1">
            <div className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-1.5">
              <i className="fas fa-shield-halved text-indigo-500"></i>
              <span>Service Worker</span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Cache Strategy: Stale-While-Revalidate with asset versioning v1.0.0</p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-200/60 dark:border-gray-700/60 space-y-1">
            <div className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-1.5">
              <i className="fas fa-laptop text-purple-500"></i>
              <span>App Mode</span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone)
                ? 'Running in Standalone Window'
                : 'Running in Browser Tab'}
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap gap-3">
          {typeof window !== 'undefined' && window.pwaInstallPrompt && (
            <button
              onClick={async () => {
                if (window.pwaInstallPrompt) {
                  window.pwaInstallPrompt.prompt();
                  await window.pwaInstallPrompt.userChoice;
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-2"
            >
              <i className="fas fa-download"></i>
              <span>Install Workly App</span>
            </button>
          )}

          <button
            onClick={() => {
              if ('Notification' in window) {
                Notification.requestPermission().then((permission) => {
                  if (permission === 'granted') {
                    addToast("Academic push notifications enabled!", "success");
                    new Notification("Workly Academic", {
                      body: "PWA notifications are active and working!",
                      icon: "icons/icon-192x192.png"
                    });
                  } else {
                    addToast("Notification permission was not granted", "warning");
                  }
                });
              } else {
                addToast("Notifications are not supported by this browser", "info");
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-800 dark:text-gray-200 font-semibold text-xs transition flex items-center space-x-2"
          >
            <i className="far fa-bell"></i>
            <span>Enable System Notifications</span>
          </button>

          <button
            onClick={() => {
              if ('caches' in window) {
                caches.keys().then((names) => {
                  return Promise.all(names.map(name => caches.delete(name)));
                }).then(() => {
                  addToast("PWA cache refreshed. Reloading...", "info");
                  setTimeout(() => window.location.reload(), 800);
                });
              } else {
                window.location.reload();
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-800 dark:text-gray-200 font-semibold text-xs transition flex items-center space-x-2"
          >
            <i className="fas fa-arrows-rotate"></i>
            <span>Purge & Refresh Offline Cache</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MODAL: ADD NEW LOGIN PROFILE / STUDENT REGISTRATION
// -------------------------------------------------------------
function NewProfileModal({ isOpen, onClose }) {
  const { createProfile, AVATAR_PRESETS } = useAcademic();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    course: "B.Tech Computer Science & Engineering",
    semester: "Semester 1 (Fall 2026)",
    rollNo: "",
    university: "National Institute of Technology",
    avatarUrl: AVATAR_PRESETS[0]
  });

  const [templateOption, setTemplateOption] = useState("sample"); // 'sample' | 'blank'

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;
    createProfile(formData, templateOption);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm shadow-sm">
              <i className="fas fa-user-plus"></i>
            </div>
            <div>
              <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white">Create New Login Profile</h3>
              <p className="text-xs text-gray-400">Add another student account to this system</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-2">Choose Student Avatar</label>
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              {AVATAR_PRESETS.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Avatar ${i}`}
                  onClick={() => setFormData({ ...formData, avatarUrl: url })}
                  className={`w-12 h-12 rounded-2xl object-cover cursor-pointer transition-all flex-shrink-0 ${formData.avatarUrl === url
                      ? 'ring-4 ring-indigo-600 scale-105 shadow-md'
                      : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Student Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">College Email *</label>
              <input
                type="email"
                placeholder="e.g. rahul.student@college.edu"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Degree Program / Course</label>
              <input
                type="text"
                placeholder="e.g. B.Tech Computer Science"
                value={formData.course}
                onChange={e => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Semester</label>
              <input
                type="text"
                placeholder="e.g. Semester 3 (Fall 2026)"
                value={formData.semester}
                onChange={e => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Roll / Student ID</label>
              <input
                type="text"
                placeholder="e.g. CS24B2005"
                value={formData.rollNo}
                onChange={e => setFormData({ ...formData, rollNo: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">University / Institute</label>
              <input
                type="text"
                placeholder="e.g. IIT / NIT / Stanford"
                value={formData.university}
                onChange={e => setFormData({ ...formData, university: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Starter Template Options */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-2">Initial Workspace Setup</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className={`p-3 rounded-2xl border cursor-pointer transition flex items-start space-x-2 ${templateOption === 'sample'
                  ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-500'
                  : 'bg-gray-50 dark:bg-gray-750 border-gray-200 dark:border-gray-700'
                }`}>
                <input
                  type="radio"
                  name="templateOption"
                  value="sample"
                  checked={templateOption === 'sample'}
                  onChange={() => setTemplateOption('sample')}
                  className="mt-0.5 text-indigo-600 cursor-pointer"
                />
                <div>
                  <h5 className="text-xs font-bold text-gray-900 dark:text-white">Sample Starter Courses</h5>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Pre-loads Data Structures & Discrete Math starter syllabus.</p>
                </div>
              </label>

              <label className={`p-3 rounded-2xl border cursor-pointer transition flex items-start space-x-2 ${templateOption === 'blank'
                  ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-500'
                  : 'bg-gray-50 dark:bg-gray-750 border-gray-200 dark:border-gray-700'
                }`}>
                <input
                  type="radio"
                  name="templateOption"
                  value="blank"
                  checked={templateOption === 'blank'}
                  onChange={() => setTemplateOption('blank')}
                  className="mt-0.5 text-indigo-600 cursor-pointer"
                />
                <div>
                  <h5 className="text-xs font-bold text-gray-900 dark:text-white">Empty Workspace</h5>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Starts with a completely clean slate.</p>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
            >
              Create & Login Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MODALS: ADD/EDIT TASK, EXAM, SUBJECT
// -------------------------------------------------------------
function TaskModal({ isOpen, onClose, initialData = null }) {
  const { subjects, addTask, updateTask } = useAcademic();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject_id: subjects[0]?.id || "",
    category: "Assignment",
    priority: "High",
    status: "Incomplete",
    progress: 0,
    start_date: getRelativeDate(0),
    due_date: getRelativeDate(3),
    due_time: "23:59",
    reminder: "1 hour before",
    notes: ""
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    } else {
      setFormData({
        title: "",
        description: "",
        subject_id: subjects[0]?.id || "",
        category: "Assignment",
        priority: "High",
        status: "Incomplete",
        progress: 0,
        start_date: getRelativeDate(0),
        due_date: getRelativeDate(3),
        due_time: "23:59",
        reminder: "1 hour before",
        notes: ""
      });
    }
  }, [initialData, isOpen, subjects]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (initialData?.id) {
      updateTask(initialData.id, formData);
    } else {
      addTask(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
          <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white flex items-center space-x-2">
            <i className="fas fa-plus-circle text-indigo-600"></i>
            <span>{initialData ? "Edit Task" : "Add New Academic Task"}</span>
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Task Title *</label>
            <input
              type="text"
              placeholder="e.g. Complete DBMS Assignment 4 on Normalization"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Subject *</label>
              <select
                value={formData.subject_id}
                onChange={e => setFormData({ ...formData, subject_id: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                required
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              >
                <option value="Assignment">Assignment</option>
                <option value="Homework">Homework</option>
                <option value="Project">Project</option>
                <option value="Practical">Practical</option>
                <option value="Study">Study</option>
                <option value="Revision">Revision</option>
                <option value="Exam Preparation">Exam Preparation</option>
                <option value="Personal">Personal</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              >
                <option value="High">🔥 High Priority</option>
                <option value="Medium">⚡ Medium Priority</option>
                <option value="Low">🌱 Low Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Due Date *</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Due Time</label>
              <input
                type="time"
                value={formData.due_time}
                onChange={e => setFormData({ ...formData, due_time: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Status</label>
              <select
                value={formData.status}
                onChange={e => {
                  const s = e.target.value;
                  const prog = s === 'Completed' ? 100 : (s === 'In Progress' && formData.progress === 0 ? 25 : formData.progress);
                  setFormData({ ...formData, status: s, progress: prog });
                }}
                className="w-full px-3 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              >
                <option value="Incomplete">Incomplete</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Reminder</label>
              <select
                value={formData.reminder}
                onChange={e => setFormData({ ...formData, reminder: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              >
                <option value="10 minutes before">10 minutes before</option>
                <option value="30 minutes before">30 minutes before</option>
                <option value="1 hour before">1 hour before</option>
                <option value="1 day before">1 day before</option>
                <option value="None">None</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Description & Guidelines</label>
            <textarea
              rows="2"
              placeholder="Specific guidelines, submission links, page references..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
            >
              {initialData ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ExamModal({ isOpen, onClose }) {
  const { subjects, addExam } = useAcademic();

  const [formData, setFormData] = useState({
    subject_id: subjects[0]?.id || "",
    exam_name: "",
    exam_type: "Mid-Term",
    date: getRelativeDate(5),
    time: "10:00",
    duration: "2 Hours",
    room: "Hall 201",
    instructions: "",
    notes: ""
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.exam_name.trim()) return;
    addExam(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
          <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white flex items-center space-x-2">
            <i className="fas fa-file-signature text-rose-600"></i>
            <span>Schedule New Exam</span>
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Exam Title *</label>
            <input
              type="text"
              placeholder="e.g. Operating Systems End Semester Theory Exam"
              value={formData.exam_name}
              onChange={e => setFormData({ ...formData, exam_name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Subject</label>
              <select
                value={formData.subject_id}
                onChange={e => setFormData({ ...formData, subject_id: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Exam Type</label>
              <select
                value={formData.exam_type}
                onChange={e => setFormData({ ...formData, exam_type: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              >
                <option value="Internal">Internal Assessment</option>
                <option value="Mid-Term">Mid-Term Exam</option>
                <option value="Practical">Practical Lab Exam</option>
                <option value="Viva">Viva Voce</option>
                <option value="End Semester">End Semester Final</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Room / Hall</label>
              <input
                type="text"
                placeholder="e.g. Hall 4B"
                value={formData.room}
                onChange={e => setFormData({ ...formData, room: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Instructions / Notes</label>
            <textarea
              rows="2"
              placeholder="Allowed equipment, unit syllabus covered..."
              value={formData.instructions}
              onChange={e => setFormData({ ...formData, instructions: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
            ></textarea>
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition"
            >
              Schedule Exam
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SubjectModal({ isOpen, onClose }) {
  const { addSubject } = useAcademic();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    teacher: "",
    semester: "Semester 5",
    credits: 4,
    color: "#6366f1",
    description: ""
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    addSubject(formData);
    onClose();
  };

  const colors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#f43f5e", "#6366f1"];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
          <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white flex items-center space-x-2">
            <i className="fas fa-book-medical text-indigo-600"></i>
            <span>Add New Subject</span>
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Subject Name *</label>
            <input
              type="text"
              placeholder="e.g. Cloud Computing & DevOps"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Subject Code</label>
              <input
                type="text"
                placeholder="e.g. CS-507"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Credits</label>
              <input
                type="number"
                min="1"
                max="6"
                value={formData.credits}
                onChange={e => setFormData({ ...formData, credits: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Faculty / Teacher</label>
              <input
                type="text"
                placeholder="e.g. Dr. Jane Doe"
                value={formData.teacher}
                onChange={e => setFormData({ ...formData, teacher: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Semester</label>
              <input
                type="text"
                value={formData.semester}
                onChange={e => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Color Theme</label>
            <div className="flex items-center space-x-2">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: c })}
                  className={`w-7 h-7 rounded-full transition-transform ${formData.color === c ? 'scale-125 ring-2 ring-indigo-500' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                ></button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
            >
              Add Subject
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// COMPONENT: FULL AUTHENTICATION PORTAL (LOGIN / SIGN UP / SWITCHER)
// -------------------------------------------------------------
function AuthPortal({ defaultMode = 'signin' }) {
  const {
    isDark,
    setIsDark,
    loginUser,
    signUpUser,
    continueAsGuest,
    resetPasswordSimulation,
    profiles,
    activeUserId,
    deleteProfile,
    AVATAR_PRESETS,
    addToast
  } = useAcademic();

  const [authMode, setAuthMode] = useState(defaultMode); // 'signin' | 'signup' | 'saved-accounts' | 'forgot-password'
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [heroFeatureIndex, setHeroFeatureIndex] = useState(0);

  // Sign In Form State
  const [loginForm, setLoginForm] = useState({
    emailOrRoll: "gauransh.mittal@university.edu",
    password: "password123"
  });

  // Sign Up Form State
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    university: "National Institute of Technology",
    course: "B.Tech Computer Science & Engineering",
    semester: "Semester 1 (Fall 2026)",
    rollNo: "",
    password: "",
    confirmPassword: "",
    avatarUrl: AVATAR_PRESETS[0],
    templateOption: "sample",
    agreeTerms: true
  });

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  // Hero Features Carousel
  const heroFeatures = [
    {
      icon: "fa-book-open",
      color: "from-blue-500 to-indigo-600",
      title: "Intelligent Syllabus Tracker",
      desc: "Granular unit & topic tracking with real-time subject completion gauges and revision stars."
    },
    {
      icon: "fa-list-check",
      color: "from-purple-500 to-pink-600",
      title: "Agile Academic Kanban",
      desc: "Stay ahead of assignment deadlines with automatic overdue alerts and visual progress sliders."
    },
    {
      icon: "fa-file-signature",
      color: "from-rose-500 to-amber-600",
      title: "Smart Exam Schedules",
      desc: "Live countdowns, room allocations, syllabus coverage links, and customizable study alarms."
    },
    {
      icon: "fa-brain",
      color: "from-emerald-500 to-teal-600",
      title: "Integrated Focus Companion",
      desc: "Built-in Pomodoro focus synthesizer, Web Audio notifications, and multi-profile workflow."
    }
  ];

  // Auto-rotate hero highlights
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroFeatureIndex(prev => (prev + 1) % heroFeatures.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [heroFeatures.length]);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const pwd = signupForm.password;
    if (!pwd) return { score: 0, text: 'None', color: 'bg-gray-300 dark:bg-gray-700' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score, text: 'Weak', color: 'bg-rose-500', width: '30%' };
    if (score <= 3) return { score, text: 'Good', color: 'bg-amber-500', width: '65%' };
    return { score, text: 'Strong', color: 'bg-emerald-500', width: '100%' };
  }, [signupForm.password]);

  // Handle Login Submit
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginForm.emailOrRoll.trim()) {
      addToast("Please enter your email or roll number", "alert");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      loginUser({
        emailOrRoll: loginForm.emailOrRoll,
        password: loginForm.password,
        rememberMe
      });
      setIsLoading(false);
    }, 400);
  };

  // Quick 1-click login for demo / saved profile
  const handleQuickLogin = (profileId) => {
    setIsLoading(true);
    setTimeout(() => {
      loginUser({ profileId });
      setIsLoading(false);
    }, 300);
  };

  // Handle Sign Up Submit
  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    if (!signupForm.name.trim() || !signupForm.email.trim()) {
      addToast("Please fill in your name and student email.", "alert");
      return;
    }
    if (signupForm.password && signupForm.password !== signupForm.confirmPassword) {
      addToast("Passwords do not match!", "alert");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      signUpUser({
        name: signupForm.name,
        email: signupForm.email,
        university: signupForm.university,
        course: signupForm.course,
        semester: signupForm.semester,
        rollNo: signupForm.rollNo || `ID-${Math.floor(1000 + Math.random() * 9000)}`,
        avatarUrl: signupForm.avatarUrl,
        password: signupForm.password || "password123"
      }, signupForm.templateOption);
      setIsLoading(false);
    }, 500);
  };

  // Handle SSO Simulation
  const handleSSOLogin = (providerName) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Auto sign in as first profile or active
      loginUser({ profileId: activeUserId || (profiles[0] && profiles[0].id) });
      addToast(`Authenticated via ${providerName} Single Sign-On!`, "success");
    }, 600);
  };

  // Handle Forgot Password
  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      addToast("Please enter your student email address", "alert");
      return;
    }
    resetPasswordSimulation(forgotEmail);
    setForgotSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-mesh-light dark:bg-mesh-dark text-gray-900 dark:text-gray-100 transition-colors duration-200">

      {/* Floating Background Glow Orbs */}
      <div className="fixed top-10 left-10 w-72 h-72 bg-indigo-500/15 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="fixed bottom-10 right-10 w-96 h-96 bg-purple-500/15 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      {/* Main Container Card */}
      <div className="relative w-full max-w-6xl rounded-3xl auth-glass-card shadow-2xl overflow-hidden border border-white/60 dark:border-gray-800/80 grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">

        {/* ------------------------------------------------------------- */}
        {/* LEFT BRAND & HERO COLUMN (lg:col-span-5) */}
        {/* ------------------------------------------------------------- */}
        <div className="lg:col-span-5 p-8 sm:p-10 lg:p-12 bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-800 text-white flex flex-col justify-between relative overflow-hidden">

          {/* Subtle geometric lines */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

          {/* Top Brand Header */}
          <div className="relative z-10 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white text-2xl font-black shadow-lg border border-white/20">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <div>
                <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight text-white flex items-center gap-1.5">
                  Work<span className="text-amber-300">ly</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-white/20 text-white ml-2">v2.5 Pro</span>
                </h1>
                <p className="text-xs text-indigo-100 font-medium tracking-wide">Academic Workflow Management System</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white leading-tight">
                Master your college semester with ease.
              </h2>
              <p className="text-sm text-indigo-100/90 leading-relaxed">
                One unified workspace for syllabus tracking, assignment kanban, exam timetables, and Pomodoro study sessions.
              </p>
            </div>
          </div>

          {/* Middle Dynamic Feature Carousel Card */}
          <div className="relative z-10 my-8">
            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-r ${heroFeatures[heroFeatureIndex].color} flex items-center justify-center text-white text-sm shadow-md`}>
                  <i className={`fas ${heroFeatures[heroFeatureIndex].icon}`}></i>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-white">{heroFeatures[heroFeatureIndex].title}</h3>
                  <span className="text-[10px] text-indigo-200">Key Academic Capability</span>
                </div>
              </div>
              <p className="text-xs text-indigo-100 leading-relaxed">
                {heroFeatures[heroFeatureIndex].desc}
              </p>

              {/* Carousel Indicators */}
              <div className="flex items-center space-x-1.5 mt-4">
                {heroFeatures.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setHeroFeatureIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${idx === heroFeatureIndex ? 'w-6 bg-amber-300' : 'w-1.5 bg-white/30 hover:bg-white/60'}`}
                  ></button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Trust Metrics & Testimonial */}
          <div className="relative z-10 pt-4 border-t border-white/15 space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <p className="font-heading font-black text-lg text-white">50k+</p>
                <p className="text-[10px] text-indigo-200 uppercase font-semibold">Active Students</p>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <p className="font-heading font-black text-lg text-amber-300">99.4%</p>
                <p className="text-[10px] text-indigo-200 uppercase font-semibold">On-Time Submissions</p>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <p className="font-heading font-black text-lg text-white">4.9 ★</p>
                <p className="text-[10px] text-indigo-200 uppercase font-semibold">Student Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* RIGHT AUTH FORM COLUMN (lg:col-span-7) */}
        {/* ------------------------------------------------------------- */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white dark:bg-gray-900/90">

          {/* Top Bar: Auth Mode Tabs & Theme Switcher */}
          <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800">

            {/* Mode Switcher Tabs */}
            <div className="flex items-center p-1 rounded-2xl bg-gray-100 dark:bg-gray-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className={`px-4 py-2 rounded-xl transition-all ${authMode === 'signin'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                <i className="fas fa-right-to-bracket mr-1.5"></i>
                Sign In
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`px-4 py-2 rounded-xl transition-all ${authMode === 'signup'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                <i className="fas fa-user-plus mr-1.5"></i>
                Sign Up
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('saved-accounts')}
                className={`px-3 py-2 rounded-xl transition-all ${authMode === 'saved-accounts'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                title="View and switch between saved student profiles"
              >
                <i className="fas fa-users mr-1"></i>
                <span className="hidden sm:inline">Accounts ({profiles.length})</span>
              </button>
            </div>

            {/* Dark/Light Mode Button */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-indigo-600 transition shadow-xs"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <i className={`fas ${isDark ? 'fa-sun text-amber-400' : 'fa-moon text-indigo-600'}`}></i>
            </button>
          </div>

          {/* --------------------------------------------------------- */}
          {/* TAB 1: SIGN IN VIEW */}
          {/* --------------------------------------------------------- */}
          {authMode === 'signin' && (
            <div className="py-6 space-y-6 animate-fadeIn">

              <div>
                <h3 className="font-heading font-black text-2xl text-gray-900 dark:text-white">
                  Welcome back, scholar! 🎓
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter your credentials or click any demo account below to instantly jump in.
                </p>
              </div>

              {/* Quick 1-Click Demo Profiles */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ⚡ 1-Click Instant Demo Login
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {profiles.slice(0, 2).map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleQuickLogin(p.id)}
                      className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 hover:border-indigo-500 hover:shadow-md cursor-pointer transition-all flex items-center space-x-3 group"
                    >
                      <img
                        src={p.avatarUrl}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/30 group-hover:ring-indigo-600 transition"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">{p.name}</h4>
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform">
                            Log In →
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{p.university}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-gray-400 tracking-wider">Or sign in with email</span>
                <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">

                {/* Email or Roll No */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Student Email or Roll Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <i className="fas fa-envelope text-xs"></i>
                    </div>
                    <input
                      type="text"
                      value={loginForm.emailOrRoll}
                      onChange={e => setLoginForm({ ...loginForm, emailOrRoll: e.target.value })}
                      placeholder="e.g. gauransh.mittal@university.edu or CS24B1089"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthMode('forgot-password')}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <i className="fas fa-lock text-xs"></i>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={loginForm.password}
                      onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer text-gray-600 dark:text-gray-400">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                    />
                    <span>Remember this session on this device</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-heading font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all transform active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-right-to-bracket"></i>
                      <span>Sign In to Workspace</span>
                    </>
                  )}
                </button>
              </form>

              {/* SSO Integrations */}
              <div className="space-y-2 pt-2">
                <p className="text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Or Connect with Institutional SSO
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSSOLogin("Google")}
                    className="py-2.5 px-3 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 text-xs font-semibold flex items-center justify-center space-x-1.5 transition text-gray-700 dark:text-gray-300"
                  >
                    <i className="fab fa-google text-red-500"></i>
                    <span className="hidden sm:inline">Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSSOLogin("University SAML / EduID")}
                    className="py-2.5 px-3 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 text-xs font-semibold flex items-center justify-center space-x-1.5 transition text-gray-700 dark:text-gray-300"
                  >
                    <i className="fas fa-university text-indigo-500"></i>
                    <span className="hidden sm:inline">EduID SSO</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSSOLogin("GitHub Student")}
                    className="py-2.5 px-3 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 text-xs font-semibold flex items-center justify-center space-x-1.5 transition text-gray-700 dark:text-gray-300"
                  >
                    <i className="fab fa-github text-gray-900 dark:text-white"></i>
                    <span className="hidden sm:inline">GitHub</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------- */}
          {/* TAB 2: SIGN UP VIEW */}
          {/* --------------------------------------------------------- */}
          {authMode === 'signup' && (
            <div className="py-4 space-y-4 animate-fadeIn max-h-[70vh] overflow-y-auto pr-1">

              <div>
                <h3 className="font-heading font-black text-2xl text-gray-900 dark:text-white">
                  Create Student Account 🚀
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Set up your personalized academic workflow in under 30 seconds.
                </p>
              </div>

              <form onSubmit={handleSignUpSubmit} className="space-y-3.5">

                {/* Avatar Picker */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Choose Your Student Avatar
                  </label>
                  <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                    {AVATAR_PRESETS.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Avatar ${idx}`}
                        onClick={() => setSignupForm({ ...signupForm, avatarUrl: url })}
                        className={`w-11 h-11 rounded-2xl object-cover cursor-pointer transition-all flex-shrink-0 ${signupForm.avatarUrl === url
                            ? 'ring-4 ring-indigo-600 scale-105 shadow-md'
                            : 'opacity-70 hover:opacity-100 hover:scale-105'
                          }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Johnson"
                      value={signupForm.name}
                      onChange={e => setSignupForm({ ...signupForm, name: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Student Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="alex.j@university.edu"
                      value={signupForm.email}
                      onChange={e => setSignupForm({ ...signupForm, email: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                {/* University & Degree */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      University / College
                    </label>
                    <input
                      type="text"
                      placeholder="National Institute of Technology"
                      value={signupForm.university}
                      onChange={e => setSignupForm({ ...signupForm, university: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Degree Program / Major
                    </label>
                    <input
                      type="text"
                      placeholder="B.Tech Computer Science"
                      value={signupForm.course}
                      onChange={e => setSignupForm({ ...signupForm, course: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Semester & Student Roll */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Semester
                    </label>
                    <input
                      type="text"
                      placeholder="Semester 3 (Fall 2026)"
                      value={signupForm.semester}
                      onChange={e => setSignupForm({ ...signupForm, semester: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Roll / Student ID Number
                    </label>
                    <input
                      type="text"
                      placeholder="CS24B1090"
                      value={signupForm.rollNo}
                      onChange={e => setSignupForm({ ...signupForm, rollNo: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={signupForm.password}
                      onChange={e => setSignupForm({ ...signupForm, password: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={signupForm.confirmPassword}
                      onChange={e => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {signupForm.password && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-500 dark:text-gray-400">Password Strength:</span>
                      <span className="font-bold">{passwordStrength.text}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: passwordStrength.width }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Starter Template Choice */}
                <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
                  <label className="block text-[11px] font-bold text-indigo-900 dark:text-indigo-300 uppercase">
                    Curriculum Initialization
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center space-x-2 transition ${signupForm.templateOption === 'sample'
                        ? 'bg-white dark:bg-gray-800 border-indigo-600 shadow-xs font-bold text-indigo-600 dark:text-indigo-400'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                      <input
                        type="radio"
                        name="templateOption"
                        checked={signupForm.templateOption === 'sample'}
                        onChange={() => setSignupForm({ ...signupForm, templateOption: 'sample' })}
                        className="hidden"
                      />
                      <i className="fas fa-magic text-indigo-600"></i>
                      <span>Load Sample Syllabus & Tasks</span>
                    </label>

                    <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center space-x-2 transition ${signupForm.templateOption === 'blank'
                        ? 'bg-white dark:bg-gray-800 border-indigo-600 shadow-xs font-bold text-indigo-600 dark:text-indigo-400'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                      <input
                        type="radio"
                        name="templateOption"
                        checked={signupForm.templateOption === 'blank'}
                        onChange={() => setSignupForm({ ...signupForm, templateOption: 'blank' })}
                        className="hidden"
                      />
                      <i className="fas fa-file text-gray-400"></i>
                      <span>Start with Blank Workspace</span>
                    </label>
                  </div>
                </div>

                {/* Agree terms */}
                <label className="flex items-center space-x-2 cursor-pointer text-xs text-gray-600 dark:text-gray-400">
                  <input
                    type="checkbox"
                    checked={signupForm.agreeTerms}
                    onChange={e => setSignupForm({ ...signupForm, agreeTerms: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    required
                  />
                  <span>I agree to the Academic Code of Conduct and Student Privacy Guidelines</span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-heading font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Setting Up Your Workspace...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-rocket"></i>
                      <span>Create Account & Launch Workspace</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* --------------------------------------------------------- */}
          {/* TAB 3: SAVED ACCOUNTS / MULTI-PROFILE PORTAL */}
          {/* --------------------------------------------------------- */}
          {authMode === 'saved-accounts' && (
            <div className="py-6 space-y-6 animate-fadeIn">

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-black text-2xl text-gray-900 dark:text-white">
                    Saved Student Accounts
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Select a student profile to continue your academic session.
                  </p>
                </div>
                <button
                  onClick={() => setAuthMode('signup')}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-100 flex items-center space-x-1"
                >
                  <i className="fas fa-plus"></i>
                  <span>New Student</span>
                </button>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {profiles.map(p => {
                  const isActive = p.id === activeUserId;
                  return (
                    <div
                      key={p.id}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${isActive
                          ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 shadow-sm'
                          : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200/80 dark:border-gray-700/80 hover:border-indigo-400'
                        }`}
                    >
                      <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                        <img
                          src={p.avatarUrl}
                          alt={p.name}
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/40 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-heading font-bold text-sm text-gray-900 dark:text-white truncate">
                              {p.name}
                            </h4>
                            {isActive && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-600 text-white">
                                Active Profile
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{p.email}</p>
                          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium truncate">
                            {p.university} • {p.course} ({p.rollNo})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-3">
                        <button
                          type="button"
                          onClick={() => handleQuickLogin(p.id)}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center space-x-1.5"
                        >
                          <i className="fas fa-right-to-bracket"></i>
                          <span>Sign In</span>
                        </button>

                        {profiles.length > 1 && (
                          <button
                            type="button"
                            onClick={() => deleteProfile(p.id)}
                            className="p-2 rounded-xl text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-xs"
                            title="Remove profile"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => setAuthMode('signin')}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  ← Back to standard Sign In
                </button>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------- */}
          {/* TAB 4: FORGOT PASSWORD SIMULATION */}
          {/* --------------------------------------------------------- */}
          {authMode === 'forgot-password' && (
            <div className="py-6 space-y-6 animate-fadeIn">

              <div>
                <h3 className="font-heading font-black text-2xl text-gray-900 dark:text-white">
                  Reset Password 🔑
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter your registered student email address to receive password recovery instructions.
                </p>
              </div>

              {!forgotSent ? (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Registered Student Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <i className="fas fa-envelope text-xs"></i>
                      </div>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        placeholder="e.g. gauransh.mittal@university.edu"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-heading font-bold text-sm shadow-md transition flex items-center justify-center space-x-2"
                  >
                    <i className="fas fa-paper-plane"></i>
                    <span>Send Password Reset Instructions</span>
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode('signin')}
                      className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto text-xl">
                    <i className="fas fa-check"></i>
                  </div>
                  <h4 className="font-heading font-bold text-base text-emerald-900 dark:text-emerald-200">
                    Reset Link Dispatched!
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300/90 leading-relaxed">
                    A secure password reset link has been dispatched to <b>{forgotEmail}</b>. For demo purposes, you can immediately sign in using your account.
                  </p>
                  <button
                    onClick={() => {
                      setForgotSent(false);
                      setAuthMode('signin');
                    }}
                    className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition mt-2"
                  >
                    Proceed to Sign In
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Bottom Guest / Demo Access Shortcut */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Just exploring?</span>
            <button
              onClick={continueAsGuest}
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
            >
              <span>Explore as Guest / Instant Preview</span>
              <i className="fas fa-arrow-right text-[10px]"></i>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
