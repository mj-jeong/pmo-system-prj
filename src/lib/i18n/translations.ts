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
