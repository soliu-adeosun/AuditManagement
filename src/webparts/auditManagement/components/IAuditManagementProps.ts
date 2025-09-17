export interface IAuditManagementProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
}


export interface IAuditManagement {
  loadNewRequestComponent: Function;
  loadApproveRequestComponent: Function;
  loadViewRequestComponent: Function;
  loadDashboardComponent: Function;
}