export const SUPPORTED_LANGUAGES = ["ko", "en", "ja", "zh", "vi"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

interface PageEntry {
  title: string;
  description: string;
}

interface TranslationDict {
  nav: {
    dashboard: string;
    projects: string;
    attendance: string;
    timeOff: string;
    reports: string;
    members: string;
    auditLogs: string;
    usage: string;
    settings: string;
  };
  pages: {
    dashboard: PageEntry;
    projects: PageEntry;
    attendance: PageEntry;
    timeOff: PageEntry;
    reports: PageEntry;
    members: PageEntry;
    settings: PageEntry;
    auditLogs: PageEntry;
    usage: PageEntry;
  };
  header: {
    logout: string;
    language: string;
  };
  common: {
    save: string;
    cancel: string;
    delete: string;
    confirm: string;
    edit: string;
    create: string;
    close: string;
    back: string;
    search: string;
    loading: string;
    error: string;
    success: string;
    noData: string;
    yes: string;
    no: string;
  };
  login: {
    title: string;
    description: string;
    email: string;
    password: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    invalidCredentials: string;
    unexpectedError: string;
    signingIn: string;
    signIn: string;
    noAccount: string;
    register: string;
    invalidEmail: string;
    passwordRequired: string;
  };
  dashboard: {
    totalProjects: string;
    inProgress: string;
    blocked: string;
    completed: string;
    workforceToday: string;
    totalMembers: string;
    present: string;
    absent: string;
    onLeave: string;
    noWorkforceData: string;
    recentUpdates: string;
    on: string;
    noRecentUpdates: string;
    updatesWillAppear: string;
    blockedProjects: string;
    projectsBlockedSingular: string;
    reviewProjects: string;
    averageProgress: string;
  };
  projects: {
    newProject: string;
    searchPlaceholder: string;
    filterByStatus: string;
    allStatuses: string;
    planned: string;
    inProgress: string;
    blocked: string;
    completed: string;
    nameHeader: string;
    statusHeader: string;
    progressHeader: string;
    createdHeader: string;
    noProjectsFound: string;
    adjustSearchFilter: string;
    createFirstProject: string;
    createProject: string;
    addNewProject: string;
    projectName: string;
    description: string;
    startDate: string;
    endDate: string;
    enterProjectName: string;
    optionalDescription: string;
    creating: string;
  };
  reports: {
    generateReport: string;
    view: string;
    periodHeader: string;
    statusHeader: string;
    detailHeader: string;
    createdByHeader: string;
    createdHeader: string;
    actionsHeader: string;
    published: string;
    draft: string;
    templateBased: string;
    filterByStatus: string;
    allStatuses: string;
    noReportsFound: string;
    adjustFilter: string;
    getStarted: string;
    periodStart: string;
    periodEnd: string;
    selectProjects: string;
    selectAll: string;
    deselectAll: string;
    noActiveProjects: string;
    detailLevel: string;
    brief: string;
    standard: string;
    detailed: string;
    generating: string;
    generate: string;
    startRequired: string;
    endRequired: string;
    selectOneProject: string;
    startBeforeEnd: string;
  };
  attendance: {
    todayStatus: string;
    todaySummary: string;
    notCheckedIn: string;
    checkedInAt: string;
    checkedOutAt: string;
    checkIn: string;
    checkOut: string;
    checkingIn: string;
    checkingOut: string;
    date: string;
    checkInLabel: string;
    checkOutLabel: string;
    total: string;
    noAttendanceRecord: string;
    clickCheckIn: string;
    teamAttendance: string;
  };
  attendanceAdmin: {
    memberHeader: string;
    totalHoursHeader: string;
    actionsHeader: string;
    filterByStatus: string;
    allStatuses: string;
    checkedIn: string;
    checkedOut: string;
    absent: string;
    teamDescription: string;
    exportCsv: string;
    noRecords: string;
    recordsWillAppear: string;
    editAttendance: string;
    manualCorrectionFor: string;
    checkInTime: string;
    checkOutTime: string;
    saving: string;
    startDate: string;
    endDate: string;
  };
  timeOff: {
    requestTimeOff: string;
    filterByStatus: string;
    allStatuses: string;
    pending: string;
    approved: string;
    rejected: string;
    requesterHeader: string;
    typeHeader: string;
    startDateHeader: string;
    endDateHeader: string;
    statusHeader: string;
    reasonHeader: string;
    actionsHeader: string;
    noRequests: string;
    noRequestsFilter: string;
    noRequestsDesc: string;
    requestFormTitle: string;
    requestFormDesc: string;
    type: string;
    selectType: string;
    vacation: string;
    halfDay: string;
    quarterDay: string;
    sickLeave: string;
    specialLeave: string;
    condolenceLeave: string;
    healthLeave: string;
    unpaidLeave: string;
    paidLeave: string;
    startDate: string;
    endDate: string;
    reason: string;
    reasonOptional: string;
    provideReason: string;
    submitRequest: string;
    submitting: string;
  };
  settings: {
    general: string;
    updateOrgDesc: string;
    orgName: string;
    slug: string;
    slugHint: string;
    saving: string;
    saveChanges: string;
    workspaceSettings: string;
    workspaceDesc: string;
    lastUpdated: string;
    workStartHour: string;
    workEndHour: string;
    selectHour: string;
    weeklyReportDay: string;
    selectDay: string;
    reportDayHint: string;
    ownerOnly: string;
    saveWorkspaceSettings: string;
    dangerZone: string;
    dangerDesc: string;
    deleteOrg: string;
    deleteConfirmPre: string;
    deleteConfirmPost: string;
    deleting: string;
    confirmDelete: string;
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  auditLogs: {
    filterByAction: string;
    allActions: string;
    filterByEntity: string;
    allEntities: string;
    activityLog: string;
    records: string;
    on: string;
    noLogs: string;
    logsWillAppear: string;
    page: string;
    of: string;
    previous: string;
    next: string;
    actionProjectCreated: string;
    actionProjectUpdated: string;
    actionProjectDeleted: string;
    actionProjectStatusChanged: string;
    actionReportGenerated: string;
    actionReportPublished: string;
    actionMemberInvited: string;
    actionMemberApproved: string;
    actionMemberRejected: string;
    actionMemberRemoved: string;
    actionTimeOffApproved: string;
    actionTimeOffRejected: string;
    actionOrgSettingsUpdated: string;
  };
  usage: {
    selectMonth: string;
    totalTokens: string;
    tokensDesc: string;
    estimatedCost: string;
    costDesc: string;
    reportsGenerated: string;
    reportsDesc: string;
  };
  languages: Record<Language, string>;
}

export const translations: Record<Language, TranslationDict> = {
  ko: {
    nav: {
      dashboard: "대시보드",
      projects: "프로젝트",
      attendance: "근태 관리",
      timeOff: "휴가 관리",
      reports: "리포트",
      members: "멤버 관리",
      auditLogs: "감사 로그",
      usage: "AI 사용량",
      settings: "설정",
    },
    pages: {
      dashboard: { title: "대시보드", description: "조직의 프로젝트 및 인력 현황을 확인합니다" },
      projects: { title: "프로젝트", description: "조직의 프로젝트를 관리합니다" },
      attendance: { title: "근태 관리", description: "일일 출퇴근을 기록합니다" },
      timeOff: { title: "휴가 관리", description: "휴가 신청을 관리합니다" },
      reports: { title: "리포트", description: "AI가 생성한 PMO 보고서를 확인합니다" },
      members: { title: "멤버 관리", description: "조직 팀원을 관리합니다" },
      settings: { title: "조직 설정", description: "조직 정보를 관리합니다" },
      auditLogs: { title: "감사 로그", description: "조직에서 발생한 모든 주요 활동을 추적합니다" },
      usage: { title: "AI 사용량", description: "월별 AI 토큰 소비량 및 예상 비용을 모니터링합니다" },
    },
    header: { logout: "로그아웃", language: "언어" },
    common: {
      save: "저장",
      cancel: "취소",
      delete: "삭제",
      confirm: "확인",
      edit: "수정",
      create: "생성",
      close: "닫기",
      back: "뒤로",
      search: "검색",
      loading: "로딩 중...",
      error: "오류",
      success: "성공",
      noData: "데이터가 없습니다",
      yes: "예",
      no: "아니오",
    },
    login: {
      title: "로그인",
      description: "PMO 시스템에 접속하려면 자격증명을 입력하세요",
      email: "이메일",
      password: "비밀번호",
      emailPlaceholder: "name@example.com",
      passwordPlaceholder: "비밀번호를 입력하세요",
      invalidCredentials: "이메일 또는 비밀번호가 올바르지 않습니다.",
      unexpectedError: "예기치 않은 오류가 발생했습니다. 다시 시도해주세요.",
      signingIn: "로그인 중...",
      signIn: "로그인",
      noAccount: "계정이 없으신가요?",
      register: "회원가입",
      invalidEmail: "유효하지 않은 이메일 주소입니다",
      passwordRequired: "비밀번호를 입력해주세요",
    },
    dashboard: {
      totalProjects: "전체 프로젝트",
      inProgress: "진행 중",
      blocked: "지연됨",
      completed: "완료",
      workforceToday: "오늘의 인력 현황",
      totalMembers: "전체 멤버",
      present: "출근",
      absent: "결근",
      onLeave: "휴가",
      noWorkforceData: "인력 데이터가 없습니다.",
      recentUpdates: "최근 업데이트",
      on: "에",
      noRecentUpdates: "최근 업데이트 없음",
      updatesWillAppear: "팀원들이 업데이트를 추가하면 여기에 표시됩니다.",
      blockedProjects: "지연된 프로젝트",
      projectsBlockedSingular: "개의 프로젝트가 현재 지연되었습니다.",
      reviewProjects: "자세한 내용은 프로젝트 페이지를 확인하세요.",
      averageProgress: "평균 진행률",
    },
    projects: {
      newProject: "새 프로젝트",
      searchPlaceholder: "프로젝트 검색...",
      filterByStatus: "상태로 필터",
      allStatuses: "전체 상태",
      planned: "계획됨",
      inProgress: "진행 중",
      blocked: "지연됨",
      completed: "완료",
      nameHeader: "이름",
      statusHeader: "상태",
      progressHeader: "진행률",
      createdHeader: "생성일",
      noProjectsFound: "프로젝트를 찾을 수 없습니다",
      adjustSearchFilter: "검색 또는 필터 조건을 조정해보세요.",
      createFirstProject: "첫 번째 프로젝트를 만들어 시작하세요.",
      createProject: "프로젝트 생성",
      addNewProject: "조직에 새 프로젝트를 추가합니다.",
      projectName: "프로젝트명",
      description: "설명",
      startDate: "시작일",
      endDate: "종료일",
      enterProjectName: "프로젝트명을 입력하세요",
      optionalDescription: "선택사항",
      creating: "생성 중...",
    },
    reports: {
      generateReport: "리포트 생성",
      view: "보기",
      periodHeader: "기간",
      statusHeader: "상태",
      detailHeader: "상세도",
      createdByHeader: "작성자",
      createdHeader: "생성일",
      actionsHeader: "작업",
      published: "게시됨",
      draft: "임시저장",
      templateBased: "템플릿 기반",
      filterByStatus: "상태로 필터",
      allStatuses: "전체 상태",
      noReportsFound: "리포트를 찾을 수 없습니다",
      adjustFilter: "필터 조건을 조정해보세요.",
      getStarted: "리포트를 생성하여 시작하세요.",
      periodStart: "기간 시작",
      periodEnd: "기간 종료",
      selectProjects: "프로젝트 선택",
      selectAll: "전체 선택",
      deselectAll: "전체 해제",
      noActiveProjects: "활성 프로젝트가 없습니다",
      detailLevel: "상세도",
      brief: "간략",
      standard: "표준",
      detailed: "상세",
      generating: "생성 중...",
      generate: "생성",
      startRequired: "시작일을 입력해주세요",
      endRequired: "종료일을 입력해주세요",
      selectOneProject: "프로젝트를 하나 이상 선택해주세요",
      startBeforeEnd: "시작일은 종료일보다 앞이어야 합니다",
    },
    attendance: {
      todayStatus: "오늘 현황",
      todaySummary: "오늘 요약",
      notCheckedIn: "아직 출근하지 않았습니다",
      checkedInAt: "출근 시각:",
      checkedOutAt: "퇴근 시각:",
      checkIn: "출근",
      checkOut: "퇴근",
      checkingIn: "출근 처리 중...",
      checkingOut: "퇴근 처리 중...",
      date: "날짜",
      checkInLabel: "출근",
      checkOutLabel: "퇴근",
      total: "합계:",
      noAttendanceRecord: "출근 기록 없음",
      clickCheckIn: "출근 버튼을 눌러 기록을 시작하세요.",
      teamAttendance: "팀 근태 현황",
    },
    attendanceAdmin: {
      memberHeader: "팀원",
      totalHoursHeader: "총 시간",
      actionsHeader: "작업",
      filterByStatus: "상태로 필터",
      allStatuses: "전체 상태",
      checkedIn: "출근",
      checkedOut: "퇴근",
      absent: "결근",
      teamDescription: "팀원 근태 기록을 모니터링 및 관리합니다",
      exportCsv: "CSV 내보내기",
      noRecords: "근태 기록 없음",
      recordsWillAppear: "팀원이 출퇴근하면 기록이 표시됩니다",
      editAttendance: "근태 수정",
      manualCorrectionFor: "수동 수정 -",
      checkInTime: "출근 시간",
      checkOutTime: "퇴근 시간",
      saving: "저장 중...",
      startDate: "시작일",
      endDate: "종료일",
    },
    timeOff: {
      requestTimeOff: "휴가 신청",
      filterByStatus: "상태로 필터",
      allStatuses: "전체 상태",
      pending: "대기 중",
      approved: "승인됨",
      rejected: "반려됨",
      requesterHeader: "신청자",
      typeHeader: "유형",
      startDateHeader: "시작일",
      endDateHeader: "종료일",
      statusHeader: "상태",
      reasonHeader: "사유",
      actionsHeader: "작업",
      noRequests: "휴가 신청 없음",
      noRequestsFilter: "선택한 필터에 해당하는 신청이 없습니다.",
      noRequestsDesc: "휴가가 필요할 때 신청서를 제출하세요.",
      requestFormTitle: "휴가 신청",
      requestFormDesc: "새 휴가 신청을 제출합니다.",
      type: "유형",
      selectType: "유형 선택",
      vacation: "연차",
      halfDay: "반차",
      quarterDay: "반반차",
      sickLeave: "병가",
      specialLeave: "특별휴가",
      condolenceLeave: "경조휴가",
      healthLeave: "보건휴가",
      unpaidLeave: "무급휴가",
      paidLeave: "유급휴가",
      startDate: "시작일",
      endDate: "종료일",
      reason: "사유",
      reasonOptional: "사유 (선택사항)",
      provideReason: "신청 사유를 입력하세요",
      submitRequest: "신청 제출",
      submitting: "제출 중...",
    },
    settings: {
      general: "일반",
      updateOrgDesc: "조직 이름과 슬러그를 수정합니다.",
      orgName: "조직명",
      slug: "슬러그",
      slugHint: "소문자, 숫자, 하이픈만 사용 가능합니다.",
      saving: "저장 중...",
      saveChanges: "변경사항 저장",
      workspaceSettings: "워크스페이스 설정",
      workspaceDesc: "근무 시간 및 주간 보고서 일정을 설정합니다.",
      lastUpdated: "마지막 업데이트:",
      workStartHour: "근무 시작 시간",
      workEndHour: "근무 종료 시간",
      selectHour: "시간 선택",
      weeklyReportDay: "주간 보고서 요일",
      selectDay: "요일 선택",
      reportDayHint: "PMO 보고서가 자동으로 생성되는 요일입니다.",
      ownerOnly: "워크스페이스 설정은 조직 오너만 변경할 수 있습니다.",
      saveWorkspaceSettings: "워크스페이스 설정 저장",
      dangerZone: "위험 구역",
      dangerDesc: "조직 전체에 영향을 미치는 되돌릴 수 없는 작업입니다.",
      deleteOrg: "조직 삭제",
      deleteConfirmPre: "정말로 \"",
      deleteConfirmPost: "\"을(를) 삭제하시겠습니까? 모든 프로젝트, 멤버 및 데이터가 영구적으로 삭제됩니다. 이 작업은 취소할 수 없습니다.",
      deleting: "삭제 중...",
      confirmDelete: "예, 조직 삭제",
      monday: "월요일",
      tuesday: "화요일",
      wednesday: "수요일",
      thursday: "목요일",
      friday: "금요일",
      saturday: "토요일",
      sunday: "일요일",
    },
    auditLogs: {
      filterByAction: "작업으로 필터",
      allActions: "전체 작업",
      filterByEntity: "엔티티로 필터",
      allEntities: "전체 엔티티",
      activityLog: "활동 로그",
      records: "건",
      on: "에서",
      noLogs: "감사 로그 없음",
      logsWillAppear: "팀에서 수행한 작업이 여기에 표시됩니다.",
      page: "페이지",
      of: "/",
      previous: "이전",
      next: "다음",
      actionProjectCreated: "프로젝트 생성됨",
      actionProjectUpdated: "프로젝트 수정됨",
      actionProjectDeleted: "프로젝트 삭제됨",
      actionProjectStatusChanged: "상태 변경됨",
      actionReportGenerated: "보고서 생성됨",
      actionReportPublished: "보고서 게시됨",
      actionMemberInvited: "멤버 초대됨",
      actionMemberApproved: "멤버 승인됨",
      actionMemberRejected: "멤버 반려됨",
      actionMemberRemoved: "멤버 삭제됨",
      actionTimeOffApproved: "휴가 승인됨",
      actionTimeOffRejected: "휴가 반려됨",
      actionOrgSettingsUpdated: "설정 변경됨",
    },
    usage: {
      selectMonth: "월 선택",
      totalTokens: "총 토큰",
      tokensDesc: "이번 달 소비된 입력 + 출력 토큰",
      estimatedCost: "예상 비용",
      costDesc: "현재 모델 가격 기준",
      reportsGenerated: "생성된 보고서",
      reportsDesc: "이번 달 생성된 PMO 보고서",
    },
    languages: {
      ko: "한국어",
      en: "English",
      ja: "日本語",
      zh: "中文",
      vi: "Tiếng Việt",
    },
  },
  en: {
    nav: {
      dashboard: "Dashboard",
      projects: "Projects",
      attendance: "Attendance",
      timeOff: "Time Off",
      reports: "Reports",
      members: "Members",
      auditLogs: "Audit Logs",
      usage: "AI Usage",
      settings: "Settings",
    },
    pages: {
      dashboard: { title: "Dashboard", description: "Overview of your organization's projects and workforce" },
      projects: { title: "Projects", description: "Manage your organization's projects" },
      attendance: { title: "Attendance", description: "Track your daily attendance" },
      timeOff: { title: "Time Off", description: "Manage time-off requests" },
      reports: { title: "Reports", description: "View and manage AI-generated PMO reports" },
      members: { title: "Members", description: "Manage your organization's team members" },
      settings: { title: "Organization Settings", description: "Manage your organization details" },
      auditLogs: { title: "Audit Logs", description: "Track all significant actions taken within your organization." },
      usage: { title: "LLM Usage", description: "Monitor AI token consumption and estimated costs per month." },
    },
    header: { logout: "Log out", language: "Language" },
    common: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      confirm: "Confirm",
      edit: "Edit",
      create: "Create",
      close: "Close",
      back: "Back",
      search: "Search",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      noData: "No data available",
      yes: "Yes",
      no: "No",
    },
    login: {
      title: "Sign in",
      description: "Enter your credentials to access the PMO system",
      email: "Email",
      password: "Password",
      emailPlaceholder: "name@example.com",
      passwordPlaceholder: "Enter your password",
      invalidCredentials: "Invalid email or password.",
      unexpectedError: "An unexpected error occurred. Please try again.",
      signingIn: "Signing in...",
      signIn: "Sign in",
      noAccount: "Don't have an account?",
      register: "Register",
      invalidEmail: "Invalid email address",
      passwordRequired: "Password is required",
    },
    dashboard: {
      totalProjects: "Total Projects",
      inProgress: "In Progress",
      blocked: "Blocked",
      completed: "Completed",
      workforceToday: "Workforce Today",
      totalMembers: "Total Members",
      present: "Present",
      absent: "Absent",
      onLeave: "On Leave",
      noWorkforceData: "No workforce data available.",
      recentUpdates: "Recent Updates",
      on: "on",
      noRecentUpdates: "No recent updates",
      updatesWillAppear: "Project updates will appear here as team members add them.",
      blockedProjects: "Blocked Projects",
      projectsBlockedSingular: "project(s) are currently blocked.",
      reviewProjects: "Review the projects page for details.",
      averageProgress: "Average Progress",
    },
    projects: {
      newProject: "New Project",
      searchPlaceholder: "Search projects...",
      filterByStatus: "Filter by status",
      allStatuses: "All Statuses",
      planned: "Planned",
      inProgress: "In Progress",
      blocked: "Blocked",
      completed: "Completed",
      nameHeader: "Name",
      statusHeader: "Status",
      progressHeader: "Progress",
      createdHeader: "Created",
      noProjectsFound: "No projects found",
      adjustSearchFilter: "Try adjusting your search or filter criteria.",
      createFirstProject: "Get started by creating your first project.",
      createProject: "Create Project",
      addNewProject: "Add a new project to your organization.",
      projectName: "Project Name",
      description: "Description",
      startDate: "Start Date",
      endDate: "End Date",
      enterProjectName: "Enter project name",
      optionalDescription: "Optional description",
      creating: "Creating...",
    },
    reports: {
      generateReport: "Generate Report",
      view: "View",
      periodHeader: "Period",
      statusHeader: "Status",
      detailHeader: "Detail",
      createdByHeader: "Created By",
      createdHeader: "Created",
      actionsHeader: "Actions",
      published: "Published",
      draft: "Draft",
      templateBased: "Template-based",
      filterByStatus: "Filter by status",
      allStatuses: "All Statuses",
      noReportsFound: "No reports found",
      adjustFilter: "Try adjusting your filter criteria.",
      getStarted: "Get started by generating your first report.",
      periodStart: "Period Start",
      periodEnd: "Period End",
      selectProjects: "Select Projects",
      selectAll: "Select All",
      deselectAll: "Deselect All",
      noActiveProjects: "No active projects found",
      detailLevel: "Detail Level",
      brief: "Brief",
      standard: "Standard",
      detailed: "Detailed",
      generating: "Generating...",
      generate: "Generate Report",
      startRequired: "Start date is required",
      endRequired: "End date is required",
      selectOneProject: "Select at least one project",
      startBeforeEnd: "Start date must be before end date",
    },
    attendance: {
      todayStatus: "Today's Status",
      todaySummary: "Today's Summary",
      notCheckedIn: "Not checked in today",
      checkedInAt: "Checked in at",
      checkedOutAt: "Checked out at",
      checkIn: "Check In",
      checkOut: "Check Out",
      checkingIn: "Checking in...",
      checkingOut: "Checking out...",
      date: "Date",
      checkInLabel: "Check In",
      checkOutLabel: "Check Out",
      total: "Total:",
      noAttendanceRecord: "No attendance record",
      clickCheckIn: "Click the Check In button to start recording.",
      teamAttendance: "Team Attendance",
    },
    attendanceAdmin: {
      memberHeader: "Member",
      totalHoursHeader: "Total Hours",
      actionsHeader: "Actions",
      filterByStatus: "Filter by status",
      allStatuses: "All Statuses",
      checkedIn: "Checked In",
      checkedOut: "Checked Out",
      absent: "Absent",
      teamDescription: "Monitor and manage team attendance records",
      exportCsv: "Export CSV",
      noRecords: "No attendance records",
      recordsWillAppear: "Attendance records will appear here as team members check in.",
      editAttendance: "Edit Attendance",
      manualCorrectionFor: "Manual correction for",
      checkInTime: "Check In Time",
      checkOutTime: "Check Out Time",
      saving: "Saving...",
      startDate: "Start Date",
      endDate: "End Date",
    },
    timeOff: {
      requestTimeOff: "Request Time Off",
      filterByStatus: "Filter by status",
      allStatuses: "All Statuses",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      requesterHeader: "Requester",
      typeHeader: "Type",
      startDateHeader: "Start Date",
      endDateHeader: "End Date",
      statusHeader: "Status",
      reasonHeader: "Reason",
      actionsHeader: "Actions",
      noRequests: "No time-off requests",
      noRequestsFilter: "No requests match the selected filter.",
      noRequestsDesc: "Submit a time-off request when you need leave.",
      requestFormTitle: "Request Time Off",
      requestFormDesc: "Submit a new time-off request for review.",
      type: "Type",
      selectType: "Select type",
      vacation: "Annual Leave",
      halfDay: "Half Day",
      quarterDay: "Quarter Day",
      sickLeave: "Sick Leave",
      specialLeave: "Special Leave",
      condolenceLeave: "Condolence Leave",
      healthLeave: "Health Leave",
      unpaidLeave: "Unpaid Leave",
      paidLeave: "Paid Leave",
      startDate: "Start Date",
      endDate: "End Date",
      reason: "Reason",
      reasonOptional: "Reason (optional)",
      provideReason: "Provide a reason for the request",
      submitRequest: "Submit Request",
      submitting: "Submitting...",
    },
    settings: {
      general: "General",
      updateOrgDesc: "Update your organization name and slug.",
      orgName: "Organization Name",
      slug: "Slug",
      slugHint: "Lowercase letters, numbers, and hyphens only.",
      saving: "Saving...",
      saveChanges: "Save Changes",
      workspaceSettings: "Workspace Settings",
      workspaceDesc: "Configure working hours and weekly report schedule.",
      lastUpdated: "Last updated:",
      workStartHour: "Work Start Hour",
      workEndHour: "Work End Hour",
      selectHour: "Select hour",
      weeklyReportDay: "Weekly Report Day",
      selectDay: "Select day",
      reportDayHint: "The day when weekly PMO reports are automatically generated.",
      ownerOnly: "Only the organization owner can change workspace settings.",
      saveWorkspaceSettings: "Save Workspace Settings",
      dangerZone: "Danger Zone",
      dangerDesc: "Irreversible actions that affect your entire organization.",
      deleteOrg: "Delete Organization",
      deleteConfirmPre: "Are you sure you want to delete \"",
      deleteConfirmPost: "\"? This will permanently remove all projects, members, and data. This action cannot be undone.",
      deleting: "Deleting...",
      confirmDelete: "Yes, Delete Organization",
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday",
    },
    auditLogs: {
      filterByAction: "Filter by action",
      allActions: "All Actions",
      filterByEntity: "Filter by entity",
      allEntities: "All Entities",
      activityLog: "Activity Log",
      records: "records",
      on: "on",
      noLogs: "No audit logs",
      logsWillAppear: "Actions taken by your team will appear here.",
      page: "Page",
      of: "of",
      previous: "Previous",
      next: "Next",
      actionProjectCreated: "Project Created",
      actionProjectUpdated: "Project Updated",
      actionProjectDeleted: "Project Deleted",
      actionProjectStatusChanged: "Status Changed",
      actionReportGenerated: "Report Generated",
      actionReportPublished: "Report Published",
      actionMemberInvited: "Member Invited",
      actionMemberApproved: "Member Approved",
      actionMemberRejected: "Member Rejected",
      actionMemberRemoved: "Member Removed",
      actionTimeOffApproved: "Time Off Approved",
      actionTimeOffRejected: "Time Off Rejected",
      actionOrgSettingsUpdated: "Settings Updated",
    },
    usage: {
      selectMonth: "Select month",
      totalTokens: "Total Tokens",
      tokensDesc: "Input + output tokens consumed this month",
      estimatedCost: "Estimated Cost",
      costDesc: "Based on current model pricing",
      reportsGenerated: "Reports Generated",
      reportsDesc: "PMO reports created this month",
    },
    languages: {
      ko: "한국어",
      en: "English",
      ja: "日本語",
      zh: "中文",
      vi: "Tiếng Việt",
    },
  },
  ja: {
    nav: {
      dashboard: "ダッシュボード",
      projects: "プロジェクト",
      attendance: "勤怠管理",
      timeOff: "休暇管理",
      reports: "レポート",
      members: "メンバー管理",
      auditLogs: "監査ログ",
      usage: "AI使用量",
      settings: "設定",
    },
    pages: {
      dashboard: { title: "ダッシュボード", description: "組織のプロジェクトと人員状況を確認します" },
      projects: { title: "プロジェクト", description: "組織のプロジェクトを管理します" },
      attendance: { title: "勤怠管理", description: "日々の出退勤を記録します" },
      timeOff: { title: "休暇管理", description: "休暇申請を管理します" },
      reports: { title: "レポート", description: "AIが生成したPMOレポートを確認します" },
      members: { title: "メンバー管理", description: "組織のチームメンバーを管理します" },
      settings: { title: "組織設定", description: "組織の情報を管理します" },
      auditLogs: { title: "監査ログ", description: "組織内で発生したすべての重要な活動を追跡します" },
      usage: { title: "AI使用量", description: "月別AIトークン消費量と推定コストを監視します" },
    },
    header: { logout: "ログアウト", language: "言語" },
    common: {
      save: "保存",
      cancel: "キャンセル",
      delete: "削除",
      confirm: "確認",
      edit: "編集",
      create: "作成",
      close: "閉じる",
      back: "戻る",
      search: "検索",
      loading: "読み込み中...",
      error: "エラー",
      success: "成功",
      noData: "データがありません",
      yes: "はい",
      no: "いいえ",
    },
    login: {
      title: "ログイン",
      description: "PMOシステムにアクセスするには認証情報を入力してください",
      email: "メールアドレス",
      password: "パスワード",
      emailPlaceholder: "name@example.com",
      passwordPlaceholder: "パスワードを入力してください",
      invalidCredentials: "メールアドレスまたはパスワードが正しくありません。",
      unexpectedError: "予期しないエラーが発生しました。もう一度お試しください。",
      signingIn: "ログイン中...",
      signIn: "ログイン",
      noAccount: "アカウントをお持ちでないですか？",
      register: "登録",
      invalidEmail: "有効なメールアドレスを入力してください",
      passwordRequired: "パスワードを入力してください",
    },
    dashboard: {
      totalProjects: "全プロジェクト",
      inProgress: "進行中",
      blocked: "遅延",
      completed: "完了",
      workforceToday: "本日の人員状況",
      totalMembers: "全メンバー",
      present: "出勤",
      absent: "欠勤",
      onLeave: "休暇",
      noWorkforceData: "人員データがありません。",
      recentUpdates: "最近の更新",
      on: "に",
      noRecentUpdates: "最近の更新はありません",
      updatesWillAppear: "チームメンバーが更新を追加するとここに表示されます。",
      blockedProjects: "遅延中のプロジェクト",
      projectsBlockedSingular: "件のプロジェクトが現在遅延しています。",
      reviewProjects: "詳細はプロジェクトページをご確認ください。",
      averageProgress: "平均進捗率",
    },
    projects: {
      newProject: "新規プロジェクト",
      searchPlaceholder: "プロジェクトを検索...",
      filterByStatus: "ステータスでフィルター",
      allStatuses: "全ステータス",
      planned: "計画中",
      inProgress: "進行中",
      blocked: "遅延",
      completed: "完了",
      nameHeader: "名前",
      statusHeader: "ステータス",
      progressHeader: "進捗率",
      createdHeader: "作成日",
      noProjectsFound: "プロジェクトが見つかりません",
      adjustSearchFilter: "検索またはフィルター条件を調整してください。",
      createFirstProject: "最初のプロジェクトを作成して始めましょう。",
      createProject: "プロジェクト作成",
      addNewProject: "組織に新しいプロジェクトを追加します。",
      projectName: "プロジェクト名",
      description: "説明",
      startDate: "開始日",
      endDate: "終了日",
      enterProjectName: "プロジェクト名を入力してください",
      optionalDescription: "任意",
      creating: "作成中...",
    },
    reports: {
      generateReport: "レポート生成",
      view: "表示",
      periodHeader: "期間",
      statusHeader: "ステータス",
      detailHeader: "詳細度",
      createdByHeader: "作成者",
      createdHeader: "作成日",
      actionsHeader: "操作",
      published: "公開済み",
      draft: "下書き",
      templateBased: "テンプレートベース",
      filterByStatus: "ステータスでフィルター",
      allStatuses: "全ステータス",
      noReportsFound: "レポートが見つかりません",
      adjustFilter: "フィルター条件を調整してください。",
      getStarted: "最初のレポートを生成して始めましょう。",
      periodStart: "期間開始",
      periodEnd: "期間終了",
      selectProjects: "プロジェクトを選択",
      selectAll: "全て選択",
      deselectAll: "全て解除",
      noActiveProjects: "アクティブなプロジェクトがありません",
      detailLevel: "詳細度",
      brief: "簡略",
      standard: "標準",
      detailed: "詳細",
      generating: "生成中...",
      generate: "生成",
      startRequired: "開始日を入力してください",
      endRequired: "終了日を入力してください",
      selectOneProject: "プロジェクトを一つ以上選択してください",
      startBeforeEnd: "開始日は終了日より前である必要があります",
    },
    attendance: {
      todayStatus: "本日の状況",
      todaySummary: "本日のまとめ",
      notCheckedIn: "まだ出勤していません",
      checkedInAt: "出勤時刻:",
      checkedOutAt: "退勤時刻:",
      checkIn: "出勤",
      checkOut: "退勤",
      checkingIn: "出勤処理中...",
      checkingOut: "退勤処理中...",
      date: "日付",
      checkInLabel: "出勤",
      checkOutLabel: "退勤",
      total: "合計:",
      noAttendanceRecord: "出勤記録なし",
      clickCheckIn: "出勤ボタンを押して記録を開始してください。",
      teamAttendance: "チーム勤怠状況",
    },
    attendanceAdmin: {
      memberHeader: "メンバー",
      totalHoursHeader: "合計時間",
      actionsHeader: "操作",
      filterByStatus: "ステータスでフィルター",
      allStatuses: "全ステータス",
      checkedIn: "出勤",
      checkedOut: "退勤",
      absent: "欠勤",
      teamDescription: "チームの勤怠記録を監視・管理します",
      exportCsv: "CSVエクスポート",
      noRecords: "勤怠記録なし",
      recordsWillAppear: "チームメンバーが出退勤すると記録が表示されます",
      editAttendance: "勤怠編集",
      manualCorrectionFor: "手動修正 -",
      checkInTime: "出勤時間",
      checkOutTime: "退勤時間",
      saving: "保存中...",
      startDate: "開始日",
      endDate: "終了日",
    },
    timeOff: {
      requestTimeOff: "休暇申請",
      filterByStatus: "ステータスでフィルター",
      allStatuses: "全ステータス",
      pending: "保留中",
      approved: "承認済み",
      rejected: "却下済み",
      requesterHeader: "申請者",
      typeHeader: "種類",
      startDateHeader: "開始日",
      endDateHeader: "終了日",
      statusHeader: "ステータス",
      reasonHeader: "理由",
      actionsHeader: "操作",
      noRequests: "休暇申請なし",
      noRequestsFilter: "選択したフィルターに該当する申請がありません。",
      noRequestsDesc: "休暇が必要な場合は申請書を提出してください。",
      requestFormTitle: "休暇申請",
      requestFormDesc: "新しい休暇申請を提出します。",
      type: "種類",
      selectType: "種類を選択",
      vacation: "年次休暇",
      halfDay: "半休",
      quarterDay: "時間休",
      sickLeave: "病気休暇",
      specialLeave: "特別休暇",
      condolenceLeave: "慶弔休暇",
      healthLeave: "保健休暇",
      unpaidLeave: "無給休暇",
      paidLeave: "有給休暇",
      startDate: "開始日",
      endDate: "終了日",
      reason: "理由",
      reasonOptional: "理由（任意）",
      provideReason: "申請理由を入力してください",
      submitRequest: "申請提出",
      submitting: "提出中...",
    },
    settings: {
      general: "一般",
      updateOrgDesc: "組織名とスラッグを更新します。",
      orgName: "組織名",
      slug: "スラッグ",
      slugHint: "小文字、数字、ハイフンのみ使用できます。",
      saving: "保存中...",
      saveChanges: "変更を保存",
      workspaceSettings: "ワークスペース設定",
      workspaceDesc: "就業時間と週次レポートスケジュールを設定します。",
      lastUpdated: "最終更新:",
      workStartHour: "就業開始時間",
      workEndHour: "就業終了時間",
      selectHour: "時間を選択",
      weeklyReportDay: "週次レポート日",
      selectDay: "曜日を選択",
      reportDayHint: "PMOレポートが自動生成される曜日です。",
      ownerOnly: "ワークスペース設定は組織のオーナーのみ変更できます。",
      saveWorkspaceSettings: "ワークスペース設定を保存",
      dangerZone: "危険ゾーン",
      dangerDesc: "組織全体に影響する取り消しできない操作です。",
      deleteOrg: "組織を削除",
      deleteConfirmPre: "本当に「",
      deleteConfirmPost: "」を削除しますか？すべてのプロジェクト、メンバー、データが完全に削除されます。この操作は取り消せません。",
      deleting: "削除中...",
      confirmDelete: "はい、削除します",
      monday: "月曜日",
      tuesday: "火曜日",
      wednesday: "水曜日",
      thursday: "木曜日",
      friday: "金曜日",
      saturday: "土曜日",
      sunday: "日曜日",
    },
    auditLogs: {
      filterByAction: "アクションでフィルター",
      allActions: "全アクション",
      filterByEntity: "エンティティでフィルター",
      allEntities: "全エンティティ",
      activityLog: "活動ログ",
      records: "件",
      on: "の",
      noLogs: "監査ログなし",
      logsWillAppear: "チームのアクションがここに表示されます。",
      page: "ページ",
      of: "/",
      previous: "前へ",
      next: "次へ",
      actionProjectCreated: "プロジェクト作成",
      actionProjectUpdated: "プロジェクト更新",
      actionProjectDeleted: "プロジェクト削除",
      actionProjectStatusChanged: "ステータス変更",
      actionReportGenerated: "レポート生成",
      actionReportPublished: "レポート公開",
      actionMemberInvited: "メンバー招待",
      actionMemberApproved: "メンバー承認",
      actionMemberRejected: "メンバー却下",
      actionMemberRemoved: "メンバー削除",
      actionTimeOffApproved: "休暇承認",
      actionTimeOffRejected: "休暇却下",
      actionOrgSettingsUpdated: "設定更新",
    },
    usage: {
      selectMonth: "月を選択",
      totalTokens: "総トークン数",
      tokensDesc: "今月消費された入力 + 出力トークン",
      estimatedCost: "推定コスト",
      costDesc: "現在のモデル価格基準",
      reportsGenerated: "生成されたレポート",
      reportsDesc: "今月生成されたPMOレポート",
    },
    languages: {
      ko: "한국어",
      en: "English",
      ja: "日本語",
      zh: "中文",
      vi: "Tiếng Việt",
    },
  },
  zh: {
    nav: {
      dashboard: "仪表板",
      projects: "项目",
      attendance: "考勤管理",
      timeOff: "假期管理",
      reports: "报告",
      members: "成员管理",
      auditLogs: "审计日志",
      usage: "AI使用量",
      settings: "设置",
    },
    pages: {
      dashboard: { title: "仪表板", description: "查看组织的项目和人员状况" },
      projects: { title: "项目", description: "管理组织的项目" },
      attendance: { title: "考勤管理", description: "记录每日出勤情况" },
      timeOff: { title: "假期管理", description: "管理休假申请" },
      reports: { title: "报告", description: "查看AI生成的PMO报告" },
      members: { title: "成员管理", description: "管理组织的团队成员" },
      settings: { title: "组织设置", description: "管理组织信息" },
      auditLogs: { title: "审计日志", description: "追踪组织内发生的所有重要活动" },
      usage: { title: "AI使用量", description: "监控每月AI令牌消耗量和预估费用" },
    },
    header: { logout: "退出登录", language: "语言" },
    common: {
      save: "保存",
      cancel: "取消",
      delete: "删除",
      confirm: "确认",
      edit: "编辑",
      create: "创建",
      close: "关闭",
      back: "返回",
      search: "搜索",
      loading: "加载中...",
      error: "错误",
      success: "成功",
      noData: "暂无数据",
      yes: "是",
      no: "否",
    },
    login: {
      title: "登录",
      description: "请输入您的凭据以访问PMO系统",
      email: "电子邮件",
      password: "密码",
      emailPlaceholder: "name@example.com",
      passwordPlaceholder: "请输入密码",
      invalidCredentials: "电子邮件或密码不正确。",
      unexpectedError: "发生了意外错误，请重试。",
      signingIn: "登录中...",
      signIn: "登录",
      noAccount: "还没有账户？",
      register: "注册",
      invalidEmail: "请输入有效的电子邮件地址",
      passwordRequired: "请输入密码",
    },
    dashboard: {
      totalProjects: "全部项目",
      inProgress: "进行中",
      blocked: "已延误",
      completed: "已完成",
      workforceToday: "今日人员状况",
      totalMembers: "全部成员",
      present: "出勤",
      absent: "缺勤",
      onLeave: "休假",
      noWorkforceData: "暂无人员数据。",
      recentUpdates: "最近更新",
      on: "于",
      noRecentUpdates: "暂无最近更新",
      updatesWillAppear: "团队成员添加更新后将在此处显示。",
      blockedProjects: "延误的项目",
      projectsBlockedSingular: "个项目目前处于延误状态。",
      reviewProjects: "请查看项目页面了解详情。",
      averageProgress: "平均进度",
    },
    projects: {
      newProject: "新建项目",
      searchPlaceholder: "搜索项目...",
      filterByStatus: "按状态筛选",
      allStatuses: "全部状态",
      planned: "已计划",
      inProgress: "进行中",
      blocked: "已延误",
      completed: "已完成",
      nameHeader: "名称",
      statusHeader: "状态",
      progressHeader: "进度",
      createdHeader: "创建日期",
      noProjectsFound: "未找到项目",
      adjustSearchFilter: "请尝试调整搜索或筛选条件。",
      createFirstProject: "创建您的第一个项目以开始使用。",
      createProject: "创建项目",
      addNewProject: "向组织添加新项目。",
      projectName: "项目名称",
      description: "描述",
      startDate: "开始日期",
      endDate: "结束日期",
      enterProjectName: "请输入项目名称",
      optionalDescription: "可选",
      creating: "创建中...",
    },
    reports: {
      generateReport: "生成报告",
      view: "查看",
      periodHeader: "期间",
      statusHeader: "状态",
      detailHeader: "详细程度",
      createdByHeader: "创建者",
      createdHeader: "创建日期",
      actionsHeader: "操作",
      published: "已发布",
      draft: "草稿",
      templateBased: "基于模板",
      filterByStatus: "按状态筛选",
      allStatuses: "全部状态",
      noReportsFound: "未找到报告",
      adjustFilter: "请尝试调整筛选条件。",
      getStarted: "生成您的第一份报告以开始使用。",
      periodStart: "期间开始",
      periodEnd: "期间结束",
      selectProjects: "选择项目",
      selectAll: "全选",
      deselectAll: "取消全选",
      noActiveProjects: "暂无活跃项目",
      detailLevel: "详细程度",
      brief: "简略",
      standard: "标准",
      detailed: "详细",
      generating: "生成中...",
      generate: "生成",
      startRequired: "请输入开始日期",
      endRequired: "请输入结束日期",
      selectOneProject: "请至少选择一个项目",
      startBeforeEnd: "开始日期必须早于结束日期",
    },
    attendance: {
      todayStatus: "今日状况",
      todaySummary: "今日摘要",
      notCheckedIn: "今日尚未签到",
      checkedInAt: "签到时间:",
      checkedOutAt: "签退时间:",
      checkIn: "签到",
      checkOut: "签退",
      checkingIn: "签到处理中...",
      checkingOut: "签退处理中...",
      date: "日期",
      checkInLabel: "签到",
      checkOutLabel: "签退",
      total: "合计:",
      noAttendanceRecord: "无考勤记录",
      clickCheckIn: "请点击签到按钮开始记录。",
      teamAttendance: "团队考勤状况",
    },
    attendanceAdmin: {
      memberHeader: "成员",
      totalHoursHeader: "总时长",
      actionsHeader: "操作",
      filterByStatus: "按状态筛选",
      allStatuses: "全部状态",
      checkedIn: "已签到",
      checkedOut: "已签退",
      absent: "缺勤",
      teamDescription: "监控和管理团队考勤记录",
      exportCsv: "导出CSV",
      noRecords: "无考勤记录",
      recordsWillAppear: "团队成员签到后将在此显示记录",
      editAttendance: "编辑考勤",
      manualCorrectionFor: "手动修正 -",
      checkInTime: "签到时间",
      checkOutTime: "签退时间",
      saving: "保存中...",
      startDate: "开始日期",
      endDate: "结束日期",
    },
    timeOff: {
      requestTimeOff: "申请假期",
      filterByStatus: "按状态筛选",
      allStatuses: "全部状态",
      pending: "待审批",
      approved: "已批准",
      rejected: "已拒绝",
      requesterHeader: "申请人",
      typeHeader: "类型",
      startDateHeader: "开始日期",
      endDateHeader: "结束日期",
      statusHeader: "状态",
      reasonHeader: "原因",
      actionsHeader: "操作",
      noRequests: "暂无假期申请",
      noRequestsFilter: "没有符合所选筛选条件的申请。",
      noRequestsDesc: "需要请假时提交申请。",
      requestFormTitle: "申请假期",
      requestFormDesc: "提交新的假期申请以供审批。",
      type: "类型",
      selectType: "选择类型",
      vacation: "年假",
      halfDay: "半天假",
      quarterDay: "小时假",
      sickLeave: "病假",
      specialLeave: "特别假",
      condolenceLeave: "婚丧假",
      healthLeave: "保健假",
      unpaidLeave: "无薪假",
      paidLeave: "有薪假",
      startDate: "开始日期",
      endDate: "结束日期",
      reason: "原因",
      reasonOptional: "原因（可选）",
      provideReason: "请输入申请原因",
      submitRequest: "提交申请",
      submitting: "提交中...",
    },
    settings: {
      general: "常规",
      updateOrgDesc: "更新您的组织名称和标识。",
      orgName: "组织名称",
      slug: "标识",
      slugHint: "仅限小写字母、数字和连字符。",
      saving: "保存中...",
      saveChanges: "保存更改",
      workspaceSettings: "工作区设置",
      workspaceDesc: "配置工作时间和周报计划。",
      lastUpdated: "最后更新:",
      workStartHour: "工作开始时间",
      workEndHour: "工作结束时间",
      selectHour: "选择时间",
      weeklyReportDay: "周报日",
      selectDay: "选择日期",
      reportDayHint: "自动生成PMO周报的日期。",
      ownerOnly: "只有组织所有者可以更改工作区设置。",
      saveWorkspaceSettings: "保存工作区设置",
      dangerZone: "危险区域",
      dangerDesc: "影响整个组织的不可逆操作。",
      deleteOrg: "删除组织",
      deleteConfirmPre: "确定要删除「",
      deleteConfirmPost: "」吗？这将永久删除所有项目、成员和数据。此操作无法撤销。",
      deleting: "删除中...",
      confirmDelete: "是，删除组织",
      monday: "周一",
      tuesday: "周二",
      wednesday: "周三",
      thursday: "周四",
      friday: "周五",
      saturday: "周六",
      sunday: "周日",
    },
    auditLogs: {
      filterByAction: "按操作筛选",
      allActions: "全部操作",
      filterByEntity: "按实体筛选",
      allEntities: "全部实体",
      activityLog: "活动日志",
      records: "条记录",
      on: "在",
      noLogs: "暂无审计日志",
      logsWillAppear: "团队执行的操作将在此处显示。",
      page: "第",
      of: "/",
      previous: "上一页",
      next: "下一页",
      actionProjectCreated: "项目已创建",
      actionProjectUpdated: "项目已更新",
      actionProjectDeleted: "项目已删除",
      actionProjectStatusChanged: "状态已变更",
      actionReportGenerated: "报告已生成",
      actionReportPublished: "报告已发布",
      actionMemberInvited: "成员已邀请",
      actionMemberApproved: "成员已批准",
      actionMemberRejected: "成员已拒绝",
      actionMemberRemoved: "成员已删除",
      actionTimeOffApproved: "假期已批准",
      actionTimeOffRejected: "假期已拒绝",
      actionOrgSettingsUpdated: "设置已更新",
    },
    usage: {
      selectMonth: "选择月份",
      totalTokens: "总令牌数",
      tokensDesc: "本月消耗的输入 + 输出令牌",
      estimatedCost: "预估费用",
      costDesc: "基于当前模型定价",
      reportsGenerated: "生成的报告",
      reportsDesc: "本月生成的PMO报告",
    },
    languages: {
      ko: "한국어",
      en: "English",
      ja: "日本語",
      zh: "中文",
      vi: "Tiếng Việt",
    },
  },
  vi: {
    nav: {
      dashboard: "Bảng điều khiển",
      projects: "Dự án",
      attendance: "Quản lý chấm công",
      timeOff: "Quản lý nghỉ phép",
      reports: "Báo cáo",
      members: "Quản lý thành viên",
      auditLogs: "Nhật ký kiểm tra",
      usage: "Sử dụng AI",
      settings: "Cài đặt",
    },
    pages: {
      dashboard: { title: "Bảng điều khiển", description: "Tổng quan về dự án và nhân lực của tổ chức" },
      projects: { title: "Dự án", description: "Quản lý các dự án của tổ chức" },
      attendance: { title: "Quản lý chấm công", description: "Ghi lại chấm công hàng ngày" },
      timeOff: { title: "Quản lý nghỉ phép", description: "Quản lý các yêu cầu nghỉ phép" },
      reports: { title: "Báo cáo", description: "Xem báo cáo PMO do AI tạo" },
      members: { title: "Quản lý thành viên", description: "Quản lý thành viên trong tổ chức" },
      settings: { title: "Cài đặt tổ chức", description: "Quản lý thông tin tổ chức" },
      auditLogs: { title: "Nhật ký kiểm tra", description: "Theo dõi tất cả các hoạt động quan trọng trong tổ chức" },
      usage: { title: "Sử dụng AI", description: "Giám sát mức tiêu thụ token AI và chi phí ước tính theo tháng" },
    },
    header: { logout: "Đăng xuất", language: "Ngôn ngữ" },
    common: {
      save: "Lưu",
      cancel: "Hủy",
      delete: "Xóa",
      confirm: "Xác nhận",
      edit: "Chỉnh sửa",
      create: "Tạo mới",
      close: "Đóng",
      back: "Quay lại",
      search: "Tìm kiếm",
      loading: "Đang tải...",
      error: "Lỗi",
      success: "Thành công",
      noData: "Không có dữ liệu",
      yes: "Có",
      no: "Không",
    },
    login: {
      title: "Đăng nhập",
      description: "Nhập thông tin đăng nhập để truy cập hệ thống PMO",
      email: "Email",
      password: "Mật khẩu",
      emailPlaceholder: "name@example.com",
      passwordPlaceholder: "Nhập mật khẩu của bạn",
      invalidCredentials: "Email hoặc mật khẩu không chính xác.",
      unexpectedError: "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.",
      signingIn: "Đang đăng nhập...",
      signIn: "Đăng nhập",
      noAccount: "Chưa có tài khoản?",
      register: "Đăng ký",
      invalidEmail: "Địa chỉ email không hợp lệ",
      passwordRequired: "Vui lòng nhập mật khẩu",
    },
    dashboard: {
      totalProjects: "Tổng dự án",
      inProgress: "Đang thực hiện",
      blocked: "Bị trì hoãn",
      completed: "Hoàn thành",
      workforceToday: "Nhân lực hôm nay",
      totalMembers: "Tổng thành viên",
      present: "Có mặt",
      absent: "Vắng mặt",
      onLeave: "Nghỉ phép",
      noWorkforceData: "Không có dữ liệu nhân lực.",
      recentUpdates: "Cập nhật gần đây",
      on: "vào",
      noRecentUpdates: "Không có cập nhật gần đây",
      updatesWillAppear: "Các cập nhật của thành viên sẽ xuất hiện tại đây.",
      blockedProjects: "Dự án bị trì hoãn",
      projectsBlockedSingular: "dự án hiện đang bị trì hoãn.",
      reviewProjects: "Xem trang dự án để biết chi tiết.",
      averageProgress: "Tiến độ trung bình",
    },
    projects: {
      newProject: "Dự án mới",
      searchPlaceholder: "Tìm kiếm dự án...",
      filterByStatus: "Lọc theo trạng thái",
      allStatuses: "Tất cả trạng thái",
      planned: "Đã lên kế hoạch",
      inProgress: "Đang thực hiện",
      blocked: "Bị trì hoãn",
      completed: "Hoàn thành",
      nameHeader: "Tên",
      statusHeader: "Trạng thái",
      progressHeader: "Tiến độ",
      createdHeader: "Ngày tạo",
      noProjectsFound: "Không tìm thấy dự án",
      adjustSearchFilter: "Hãy thử điều chỉnh tiêu chí tìm kiếm hoặc lọc.",
      createFirstProject: "Bắt đầu bằng cách tạo dự án đầu tiên của bạn.",
      createProject: "Tạo dự án",
      addNewProject: "Thêm dự án mới vào tổ chức của bạn.",
      projectName: "Tên dự án",
      description: "Mô tả",
      startDate: "Ngày bắt đầu",
      endDate: "Ngày kết thúc",
      enterProjectName: "Nhập tên dự án",
      optionalDescription: "Tùy chọn",
      creating: "Đang tạo...",
    },
    reports: {
      generateReport: "Tạo báo cáo",
      view: "Xem",
      periodHeader: "Kỳ",
      statusHeader: "Trạng thái",
      detailHeader: "Mức độ chi tiết",
      createdByHeader: "Người tạo",
      createdHeader: "Ngày tạo",
      actionsHeader: "Hành động",
      published: "Đã xuất bản",
      draft: "Bản nháp",
      templateBased: "Dựa trên mẫu",
      filterByStatus: "Lọc theo trạng thái",
      allStatuses: "Tất cả trạng thái",
      noReportsFound: "Không tìm thấy báo cáo",
      adjustFilter: "Hãy thử điều chỉnh tiêu chí lọc.",
      getStarted: "Bắt đầu bằng cách tạo báo cáo đầu tiên.",
      periodStart: "Bắt đầu kỳ",
      periodEnd: "Kết thúc kỳ",
      selectProjects: "Chọn dự án",
      selectAll: "Chọn tất cả",
      deselectAll: "Bỏ chọn tất cả",
      noActiveProjects: "Không có dự án đang hoạt động",
      detailLevel: "Mức độ chi tiết",
      brief: "Tóm tắt",
      standard: "Tiêu chuẩn",
      detailed: "Chi tiết",
      generating: "Đang tạo...",
      generate: "Tạo",
      startRequired: "Vui lòng nhập ngày bắt đầu",
      endRequired: "Vui lòng nhập ngày kết thúc",
      selectOneProject: "Vui lòng chọn ít nhất một dự án",
      startBeforeEnd: "Ngày bắt đầu phải trước ngày kết thúc",
    },
    attendance: {
      todayStatus: "Tình trạng hôm nay",
      todaySummary: "Tóm tắt hôm nay",
      notCheckedIn: "Chưa chấm công hôm nay",
      checkedInAt: "Giờ vào:",
      checkedOutAt: "Giờ ra:",
      checkIn: "Chấm công vào",
      checkOut: "Chấm công ra",
      checkingIn: "Đang chấm công vào...",
      checkingOut: "Đang chấm công ra...",
      date: "Ngày",
      checkInLabel: "Vào",
      checkOutLabel: "Ra",
      total: "Tổng:",
      noAttendanceRecord: "Không có dữ liệu chấm công",
      clickCheckIn: "Nhấn nút Chấm công vào để bắt đầu ghi lại.",
      teamAttendance: "Chấm công nhóm",
    },
    attendanceAdmin: {
      memberHeader: "Thành viên",
      totalHoursHeader: "Tổng giờ",
      actionsHeader: "Hành động",
      filterByStatus: "Lọc theo trạng thái",
      allStatuses: "Tất cả trạng thái",
      checkedIn: "Đã vào",
      checkedOut: "Đã ra",
      absent: "Vắng mặt",
      teamDescription: "Giám sát và quản lý hồ sơ chấm công của nhóm",
      exportCsv: "Xuất CSV",
      noRecords: "Không có hồ sơ chấm công",
      recordsWillAppear: "Hồ sơ chấm công sẽ xuất hiện khi thành viên chấm công.",
      editAttendance: "Chỉnh sửa chấm công",
      manualCorrectionFor: "Chỉnh sửa thủ công -",
      checkInTime: "Giờ vào",
      checkOutTime: "Giờ ra",
      saving: "Đang lưu...",
      startDate: "Ngày bắt đầu",
      endDate: "Ngày kết thúc",
    },
    timeOff: {
      requestTimeOff: "Yêu cầu nghỉ phép",
      filterByStatus: "Lọc theo trạng thái",
      allStatuses: "Tất cả trạng thái",
      pending: "Đang chờ",
      approved: "Đã chấp thuận",
      rejected: "Đã từ chối",
      requesterHeader: "Người yêu cầu",
      typeHeader: "Loại",
      startDateHeader: "Ngày bắt đầu",
      endDateHeader: "Ngày kết thúc",
      statusHeader: "Trạng thái",
      reasonHeader: "Lý do",
      actionsHeader: "Hành động",
      noRequests: "Không có yêu cầu nghỉ phép",
      noRequestsFilter: "Không có yêu cầu nào khớp với bộ lọc đã chọn.",
      noRequestsDesc: "Gửi yêu cầu nghỉ phép khi bạn cần.",
      requestFormTitle: "Yêu cầu nghỉ phép",
      requestFormDesc: "Gửi yêu cầu nghỉ phép mới để xem xét.",
      type: "Loại",
      selectType: "Chọn loại",
      vacation: "Nghỉ phép năm",
      halfDay: "Nửa ngày",
      quarterDay: "Phần tư ngày",
      sickLeave: "Nghỉ ốm",
      specialLeave: "Nghỉ đặc biệt",
      condolenceLeave: "Nghỉ tang lễ",
      healthLeave: "Nghỉ sức khỏe",
      unpaidLeave: "Nghỉ không lương",
      paidLeave: "Nghỉ có lương",
      startDate: "Ngày bắt đầu",
      endDate: "Ngày kết thúc",
      reason: "Lý do",
      reasonOptional: "Lý do (tùy chọn)",
      provideReason: "Cung cấp lý do cho yêu cầu",
      submitRequest: "Gửi yêu cầu",
      submitting: "Đang gửi...",
    },
    settings: {
      general: "Chung",
      updateOrgDesc: "Cập nhật tên và đường dẫn tổ chức.",
      orgName: "Tên tổ chức",
      slug: "Đường dẫn",
      slugHint: "Chỉ chữ thường, số và dấu gạch ngang.",
      saving: "Đang lưu...",
      saveChanges: "Lưu thay đổi",
      workspaceSettings: "Cài đặt không gian làm việc",
      workspaceDesc: "Cấu hình giờ làm việc và lịch báo cáo hàng tuần.",
      lastUpdated: "Cập nhật lần cuối:",
      workStartHour: "Giờ bắt đầu làm việc",
      workEndHour: "Giờ kết thúc làm việc",
      selectHour: "Chọn giờ",
      weeklyReportDay: "Ngày báo cáo tuần",
      selectDay: "Chọn ngày",
      reportDayHint: "Ngày báo cáo PMO được tạo tự động hàng tuần.",
      ownerOnly: "Chỉ chủ sở hữu tổ chức mới có thể thay đổi cài đặt không gian làm việc.",
      saveWorkspaceSettings: "Lưu cài đặt không gian làm việc",
      dangerZone: "Vùng nguy hiểm",
      dangerDesc: "Các hành động không thể đảo ngược ảnh hưởng đến toàn bộ tổ chức.",
      deleteOrg: "Xóa tổ chức",
      deleteConfirmPre: "Bạn có chắc muốn xóa \"",
      deleteConfirmPost: "\"? Thao tác này sẽ xóa vĩnh viễn tất cả dự án, thành viên và dữ liệu. Không thể hoàn tác.",
      deleting: "Đang xóa...",
      confirmDelete: "Có, xóa tổ chức",
      monday: "Thứ Hai",
      tuesday: "Thứ Ba",
      wednesday: "Thứ Tư",
      thursday: "Thứ Năm",
      friday: "Thứ Sáu",
      saturday: "Thứ Bảy",
      sunday: "Chủ Nhật",
    },
    auditLogs: {
      filterByAction: "Lọc theo hành động",
      allActions: "Tất cả hành động",
      filterByEntity: "Lọc theo thực thể",
      allEntities: "Tất cả thực thể",
      activityLog: "Nhật ký hoạt động",
      records: "bản ghi",
      on: "trên",
      noLogs: "Không có nhật ký kiểm tra",
      logsWillAppear: "Các hành động của nhóm sẽ xuất hiện tại đây.",
      page: "Trang",
      of: "/",
      previous: "Trước",
      next: "Tiếp",
      actionProjectCreated: "Dự án được tạo",
      actionProjectUpdated: "Dự án được cập nhật",
      actionProjectDeleted: "Dự án bị xóa",
      actionProjectStatusChanged: "Trạng thái thay đổi",
      actionReportGenerated: "Báo cáo được tạo",
      actionReportPublished: "Báo cáo được xuất bản",
      actionMemberInvited: "Thành viên được mời",
      actionMemberApproved: "Thành viên được chấp thuận",
      actionMemberRejected: "Thành viên bị từ chối",
      actionMemberRemoved: "Thành viên bị xóa",
      actionTimeOffApproved: "Nghỉ phép được chấp thuận",
      actionTimeOffRejected: "Nghỉ phép bị từ chối",
      actionOrgSettingsUpdated: "Cài đặt được cập nhật",
    },
    usage: {
      selectMonth: "Chọn tháng",
      totalTokens: "Tổng token",
      tokensDesc: "Token đầu vào + đầu ra tiêu thụ trong tháng này",
      estimatedCost: "Chi phí ước tính",
      costDesc: "Dựa trên giá mô hình hiện tại",
      reportsGenerated: "Báo cáo đã tạo",
      reportsDesc: "Báo cáo PMO được tạo trong tháng này",
    },
    languages: {
      ko: "한국어",
      en: "English",
      ja: "日本語",
      zh: "中文",
      vi: "Tiếng Việt",
    },
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getNestedValue(obj: any, key: string): string | undefined {
  return key.split(".").reduce((acc, part) => acc?.[part], obj) as
    | string
    | undefined;
}
