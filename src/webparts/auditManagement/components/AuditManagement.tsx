import * as React from 'react';
// import styles from './AuditManagement.module.scss';
import type { IAuditManagementProps, IAuditManagement } from './IAuditManagementProps';
// import { escape } from '@microsoft/sp-lodash-subset';
import { Route, Routes, HashRouter } from "react-router-dom";

import Dashboard from './pages/Dashboard';
import NewRequest from './pages/NewRequest';
import ApproveRequest from './pages/ApproveRequest';
import ViewRequest from './pages/ViewRequest';
import { Layout } from '../../../Global/Layout';

require('main');

declare global {
  interface Window {
    AUDITMANAGEMENT: IAuditManagement;
  }
}

export default class AuditManagement extends React.Component<IAuditManagementProps, {}> {
  public render(): React.ReactElement<IAuditManagementProps> {

    return (
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="newrequest" element={<NewRequest />} />
            <Route path="approverequest" element={<ApproveRequest />} />
            <Route path="viewrequest" element={<ViewRequest />} />
          </Route>
        </Routes>
      </HashRouter>

    );
  }
}
