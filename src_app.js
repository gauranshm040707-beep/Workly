// Dynamic Academic Workflow Management System - Main Layout & Multi-Profile Router

function AppLayout() {
  const { 
    isDark, 
    setIsDark, 
    toasts, 
    profile, 
    profiles, 
    activeUserId, 
    switchProfile, 
    tasks, 
    exams, 
    reminders, 
    subjects 
  } = useAcademic();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isNewProfileModalOpen, setIsNewProfileModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");

  // Counts for sidebar badges
  const overdueCount = useMemo(() => tasks.filter(t => isTaskOverdue(t)).length, [tasks]);
  const todayTaskCount = useMemo(() => tasks.filter(t => isDueToday(t.due_date)).length, [tasks]);
  const upcomingExamCount = useMemo(() => exams.filter(e => getDaysRemaining(e.date) >= 0).length, [exams]);

  // Keyboard shortcut (Cmd+K / Ctrl+K for search)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('#profile-dropdown-container')) {
        setIsProfileDropdownOpen(false);
      }
      if (!e.target.closest('#notification-container')) {
        setIsNotificationOpen(false);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Navigation items config
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-house', badge: null },
    { id: 'syllabus', label: 'Syllabus', icon: 'fa-book-open', badge: null },
    { id: 'subjects', label: 'Subjects', icon: 'fa-graduation-cap', badge: subjects.length },
    { id: 'tasks', label: 'All Tasks', icon: 'fa-list-check', badge: overdueCount > 0 ? `${overdueCount} Overdue` : tasks.length, badgeColor: overdueCount > 0 ? 'bg-rose-600 text-white animate-pulse' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300' },
    { id: 'incomplete', label: 'Incomplete', icon: 'fa-hourglass-start', badge: tasks.filter(t => t.status === 'Incomplete').length },
    { id: 'in-progress', label: 'In Progress', icon: 'fa-spinner', badge: tasks.filter(t => t.status === 'In Progress').length },
    { id: 'completed-tasks', label: 'Completed Tasks', icon: 'fa-check-circle', badge: tasks.filter(t => t.status === 'Completed').length, badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
    { id: 'exams', label: 'Exams Schedule', icon: 'fa-file-signature', badge: upcomingExamCount > 0 ? `${upcomingExamCount} Upcoming` : null, badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' },
    { id: 'calendar', label: 'Calendar', icon: 'fa-calendar-days', badge: null },
    { id: 'reminders', label: 'Reminders', icon: 'fa-bell', badge: reminders.length },
    { id: 'progress', label: 'Progress & Stats', icon: 'fa-chart-pie', badge: null },
    { id: 'settings', label: 'Settings & Profiles', icon: 'fa-gear', badge: `${profiles.length} Users` },
  ];

  // Search Results
  const searchResults = useMemo(() => {
    if (!globalSearchTerm.trim()) return [];
    const q = globalSearchTerm.toLowerCase();
    const results = [];

    tasks.forEach(t => {
      if (t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)) {
        results.push({ type: 'Task', title: t.title, subtitle: `Due: ${formatDate(t.due_date)} • ${t.status}`, tab: 'tasks', id: t.id });
      }
    });

    subjects.forEach(s => {
      if (s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)) {
        results.push({ type: 'Subject', title: `${s.code} - ${s.name}`, subtitle: `Teacher: ${s.teacher}`, tab: 'syllabus', id: s.id });
      }
    });

    exams.forEach(e => {
      if (e.exam_name.toLowerCase().includes(q)) {
        results.push({ type: 'Exam', title: e.exam_name, subtitle: `Date: ${formatDate(e.date)} • ${e.room}`, tab: 'exams', id: e.id });
      }
    });

    return results.slice(0, 8);
  }, [globalSearchTerm, tasks, subjects, exams]);

  return (
    <div className={`min-h-screen flex bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased`}>
      
      {/* --------------------------------------------------------- */}
      {/* LEFT SIDEBAR NAVIGATION */}
      {/* --------------------------------------------------------- */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 lg:w-72 bg-white dark:bg-gray-900 border-r border-gray-200/80 dark:border-gray-800 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
        isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Brand Header */}
        <div>
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-500/20">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <div>
                <h1 className="font-heading font-extrabold text-lg text-gray-900 dark:text-white tracking-tight leading-tight">
                  Work<span className="text-indigo-600">ly</span>
                </h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Academic Workspace</p>
              </div>
            </div>

            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>

          {/* Nav List */}
          <nav className="p-4 space-y-1.5 max-h-[calc(100vh-230px)] overflow-y-auto">
            {navItems.map(item => {
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <i className={`fas ${item.icon} w-5 text-center text-sm ${isActive ? 'text-white' : 'text-gray-400'}`}></i>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== null && item.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : (item.badgeColor || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400')
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Mini Profile & Quick Switch Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60">
            <div 
              onClick={() => setIsNewProfileModalOpen(true)}
              className="flex items-center space-x-2.5 min-w-0 cursor-pointer flex-1"
              title="Click to add new profile"
            >
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500/30 flex-shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">{profile.name}</h4>
                <p className="text-[10px] text-gray-400 truncate">{profile.rollNo} • {profile.semester}</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsNewProfileModalOpen(true)}
                className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs"
                title="Add New Student Profile"
              >
                <i className="fas fa-user-plus"></i>
              </button>
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-xl bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-indigo-600 shadow-xs transition"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                <i className={`fas ${isDark ? 'fa-sun text-amber-400' : 'fa-moon text-indigo-500'}`}></i>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-xs animate-fadeIn"
        ></div>
      )}

      {/* --------------------------------------------------------- */}
      {/* MAIN CONTENT AREA */}
      {/* --------------------------------------------------------- */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        
        {/* TOP NAVBAR */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/70 dark:border-gray-800 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <i className="fas fa-bars text-base"></i>
            </button>

            {/* Global Search Bar */}
            <div
              onClick={() => setSearchModalOpen(true)}
              className="hidden sm:flex items-center space-x-2.5 px-4 py-2 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200/70 dark:hover:bg-gray-750 text-gray-400 dark:text-gray-400 text-xs cursor-pointer border border-transparent hover:border-gray-300 dark:hover:border-gray-700 transition w-64 md:w-80"
            >
              <i className="fas fa-search"></i>
              <span className="flex-1 truncate">Search tasks, subjects, exams...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-700 text-[10px] font-mono text-gray-500 font-bold shadow-xs">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center space-x-3">
            
            {/* Quick Add Task Button */}
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center space-x-1.5"
            >
              <i className="fas fa-plus"></i>
              <span className="hidden sm:inline">Add Task</span>
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative" id="notification-container">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsNotificationOpen(!isNotificationOpen);
                  setIsProfileDropdownOpen(false);
                }}
                className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center relative transition"
              >
                <i className="far fa-bell"></i>
                {(overdueCount > 0 || todayTaskCount > 0) && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-gray-900 animate-pulse"></span>
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-2xl p-4 z-50 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 mb-3">
                    <h4 className="font-heading font-bold text-sm text-gray-900 dark:text-white">Academic Notifications</h4>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer" onClick={() => setIsNotificationOpen(false)}>
                      Close
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto">
                    {overdueCount > 0 && (
                      <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs space-y-1">
                        <div className="flex items-center space-x-2 text-rose-700 dark:text-rose-300 font-bold">
                          <i className="fas fa-triangle-exclamation"></i>
                          <span>{overdueCount} Overdue Assignment(s)!</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-[11px]">Check incomplete task table and submit immediately.</p>
                      </div>
                    )}

                    {todayTaskCount > 0 && (
                      <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs space-y-1">
                        <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-300 font-bold">
                          <i className="fas fa-clock"></i>
                          <span>{todayTaskCount} Task(s) due today</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-[11px]">Stay focused and finish before midnight.</p>
                      </div>
                    )}

                    {reminders.slice(0, 3).map(rem => (
                      <div key={rem.id} className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-750 text-xs space-y-1">
                        <div className="flex items-center space-x-2 font-bold text-gray-900 dark:text-white">
                          <i className="far fa-bell text-indigo-500"></i>
                          <span className="truncate">{rem.title}</span>
                        </div>
                        <p className="text-[10px] text-gray-400">{formatDate(rem.target_date)} at {rem.target_time}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('reminders');
                      setIsNotificationOpen(false);
                    }}
                    className="w-full mt-3 py-2 text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View All Reminders →
                  </button>
                </div>
              )}
            </div>

            {/* Profile Avatar & Multi-Account Dropdown */}
            <div className="relative" id="profile-dropdown-container">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsProfileDropdownOpen(!isProfileDropdownOpen);
                  setIsNotificationOpen(false);
                }}
                className="flex items-center space-x-2 cursor-pointer p-1.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition border border-gray-200/60 dark:border-gray-700/60"
              >
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-8 h-8 rounded-xl object-cover ring-2 ring-indigo-500/30"
                />
                <div className="hidden md:block text-left pr-1">
                  <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight truncate max-w-[120px]">{profile.name}</p>
                  <p className="text-[10px] text-gray-400 leading-tight">Switch / Add</p>
                </div>
                <i className="fas fa-chevron-down text-[10px] text-gray-400"></i>
              </div>

              {/* Profile Switcher Popover Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-2xl p-4 z-50 animate-fadeIn space-y-3">
                  
                  {/* Active Profile Info */}
                  <div className="flex items-center space-x-3 p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="w-11 h-11 rounded-xl object-cover ring-2 ring-indigo-600"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">{profile.name}</h4>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-600 text-white">Active</span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{profile.email}</p>
                      <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium truncate">{profile.course}</p>
                    </div>
                  </div>

                  {/* Switch to Other Profiles */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">Switch Student Account</p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {profiles.map(p => {
                        const isCurrent = p.id === activeUserId;
                        return (
                          <div
                            key={p.id}
                            onClick={() => {
                              if (!isCurrent) switchProfile(p.id);
                              setIsProfileDropdownOpen(false);
                            }}
                            className={`p-2.5 rounded-2xl flex items-center justify-between cursor-pointer transition ${
                              isCurrent
                                ? 'bg-gray-100 dark:bg-gray-750 font-bold'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <img
                                src={p.avatarUrl}
                                alt={p.name}
                                className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold truncate">{p.name}</p>
                                <p className="text-[10px] text-gray-400 truncate">{p.rollNo}</p>
                              </div>
                            </div>
                            {isCurrent ? (
                              <i className="fas fa-check text-indigo-600 text-xs"></i>
                            ) : (
                              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">Switch</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions: Add New Profile + Settings */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-1.5">
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setIsNewProfileModalOpen(true);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center space-x-2 transition shadow-xs"
                    >
                      <i className="fas fa-user-plus"></i>
                      <span>+ Add New Login Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setActiveTab('settings');
                      }}
                      className="w-full py-1.5 text-center text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                    >
                      Manage All Profiles & Settings
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* MAIN BODY CONTAINER */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto pb-24">
          {activeTab === 'dashboard' && (
            <DashboardView
              setActiveTab={setActiveTab}
              onOpenNewTaskModal={() => setIsTaskModalOpen(true)}
              onOpenNewProfileModal={() => setIsNewProfileModalOpen(true)}
            />
          )}

          {activeTab === 'syllabus' && (
            <SyllabusView
              onOpenNewSubjectModal={() => setIsSubjectModalOpen(true)}
            />
          )}

          {activeTab === 'subjects' && (
            <SubjectsView
              onOpenNewSubjectModal={() => setIsSubjectModalOpen(true)}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              activeSubTab="all"
              onOpenNewTaskModal={() => setIsTaskModalOpen(true)}
            />
          )}

          {activeTab === 'incomplete' && (
            <TasksView
              activeSubTab="incomplete"
              onOpenNewTaskModal={() => setIsTaskModalOpen(true)}
            />
          )}

          {activeTab === 'in-progress' && (
            <TasksView
              activeSubTab="in-progress"
              onOpenNewTaskModal={() => setIsTaskModalOpen(true)}
            />
          )}

          {activeTab === 'completed-tasks' && (
            <TasksView
              activeSubTab="completed"
              onOpenNewTaskModal={() => setIsTaskModalOpen(true)}
            />
          )}

          {activeTab === 'exams' && (
            <ExamsView
              onOpenNewExamModal={() => setIsExamModalOpen(true)}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              onOpenNewTaskModal={() => setIsTaskModalOpen(true)}
              onOpenNewExamModal={() => setIsExamModalOpen(true)}
            />
          )}

          {activeTab === 'reminders' && <RemindersView />}

          {activeTab === 'progress' && <ProgressView />}

          {activeTab === 'settings' && (
            <SettingsView
              onOpenNewProfileModal={() => setIsNewProfileModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* --------------------------------------------------------- */}
      {/* FLOATING ACTION BUTTON (+ New Task) */}
      {/* --------------------------------------------------------- */}
      <button
        onClick={() => setIsTaskModalOpen(true)}
        className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xl flex items-center justify-center shadow-xl shadow-indigo-600/40 transform hover:scale-105 active:scale-95 transition-all float-subtle"
        title="Quick + Add New Task"
      >
        <i className="fas fa-plus"></i>
      </button>

      {/* --------------------------------------------------------- */}
      {/* GLOBAL SEARCH / COMMAND PALETTE MODAL */}
      {/* --------------------------------------------------------- */}
      {searchModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-20 p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-xl w-full p-4 border border-gray-100 dark:border-gray-700 shadow-2xl space-y-4">
            <div className="relative">
              <i className="fas fa-search absolute left-4 top-3.5 text-gray-400"></i>
              <input
                type="text"
                autoFocus
                placeholder="Search anything (tasks, subjects, exams)..."
                value={globalSearchTerm}
                onChange={e => setGlobalSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-750 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {searchResults.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {searchResults.map((res, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setActiveTab(res.tab);
                      setSearchModalOpen(false);
                      setGlobalSearchTerm("");
                    }}
                    className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-750 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                        {res.type}
                      </span>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-1">{res.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{res.subtitle}</p>
                    </div>
                    <i className="fas fa-arrow-right text-gray-400 text-xs"></i>
                  </div>
                ))}
              </div>
            ) : globalSearchTerm.trim() ? (
              <p className="text-center text-xs text-gray-400 py-6">No matching records found.</p>
            ) : (
              <div className="p-3 text-xs text-gray-400 text-center">
                Type keywords like "Assignment", "DBMS", "Operating Systems", "Mid-term"
              </div>
            )}

            <div className="pt-2 border-t border-gray-100 dark:border-gray-700 text-right">
              <button
                onClick={() => setSearchModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300"
              >
                Close (ESC)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* TOAST NOTIFICATION CONTAINER */}
      {/* --------------------------------------------------------- */}
      <div className="fixed bottom-5 left-5 z-50 space-y-2 max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-center space-x-3 text-xs font-bold animate-fadeIn transition-all transform ${
              toast.type === 'success'
                ? 'bg-emerald-900/90 text-white border-emerald-700 backdrop-blur-md'
                : toast.type === 'delete'
                ? 'bg-rose-900/90 text-white border-rose-700 backdrop-blur-md'
                : 'bg-gray-900/90 text-white border-gray-700 backdrop-blur-md'
            }`}
          >
            <i className={`fas ${
              toast.type === 'success' ? 'fa-check-circle text-emerald-400 text-sm' :
              toast.type === 'delete' ? 'fa-trash-alt text-rose-400 text-sm' :
              'fa-info-circle text-indigo-400 text-sm'
            }`}></i>
            <span className="flex-1">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* MODALS */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />

      <ExamModal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
      />

      <SubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
      />

      {/* NEW PROFILE / STUDENT LOGIN MODAL */}
      <NewProfileModal
        isOpen={isNewProfileModalOpen}
        onClose={() => setIsNewProfileModalOpen(false)}
      />
    </div>
  );
}

// -------------------------------------------------------------
// ROOT ENTRY COMPONENT
// -------------------------------------------------------------
function App() {
  return (
    <AcademicProvider>
      <AppLayout />
    </AcademicProvider>
  );
}

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
