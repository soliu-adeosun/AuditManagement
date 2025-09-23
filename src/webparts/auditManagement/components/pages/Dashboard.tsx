import * as React from 'react';
require("dashboard");


export default class Dashboard extends React.Component<{}, {}> {
    public render(): React.ReactElement {

        return (
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
                {/* Cards Section */}
                <section className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                        <div className="border card audit border-gray-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-center">
                                <h3 className="text-base sm:text-lg font-semibold text-navy-900 flex-1 mr-2">2</h3>
                                <h3 className="text-base sm:text-lg font-semibold text-navy-900 flex-1 mr-2">
                                    Total Audit
                                </h3>
                            </div>
                        </div>
                        <div className="border card pending border-gray-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-center">
                                <h3 className="text-base sm:text-lg font-semibold text-navy-900 flex-1 mr-2">8</h3>
                                <h3 className="text-base sm:text-lg font-semibold text-navy-900 flex-1 mr-2">
                                    Pending
                                </h3>
                            </div>
                        </div>
                        <div className="border card completed border-gray-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-center">
                                <h3 className="text-base sm:text-lg font-semibold text-navy-900 flex-1 mr-2">3</h3>
                                <h3 className="text-base sm:text-lg font-semibold text-navy-900 flex-1 mr-2">
                                    Completed
                                </h3>
                            </div>
                        </div>
                    </div>
                </section>
                {/* <section className="flex btn-action">
                    <button className="px-4 py-2 bg-slate-700 text-white text-sm font-medium hover:bg-slate-800 transition-colors">
                        Create
                    </button>
                </section> */}
                {/* Data Table Section */}
                <section className="bg-white border border-gray-200 shadow-sm">
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-navy-900">Request Management</h2>
                                <p className="text-sm text-blue-500 mt-1">Manage and track all system requests</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <a href='#/newrequest' className="flex items-center justify-center px-3 sm:px-4 py-2 bg-slate-700 text-white text-sm font-medium hover:bg-slate-800 transition-colors">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add New
                                </a>
                                <button className="flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 text-blue-500 text-sm font-medium hover:bg-gray-50 transition-colors">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                    Filter
                                </button>
                                <button className="flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 text-blue-500 text-sm font-medium hover:bg-gray-50 transition-colors">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Export
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full table-mobile">
                            <thead className="bg-slate-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider">AUDIT REF ID</th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider">TYPE</th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider">STATUS</th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider">DATE</th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider">INITIATOR</th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr className="hover:bg-gray-50 transition-colors bg-white">
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm font-medium text-navy-900">REQ-001</td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-blue-500">Office Supply Request</td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-blue-400">2024-01-15</td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-blue-500">John Smith</td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                        <div className="flex space-x-1 sm:space-x-2">
                                            <button className="p-1 sm:p-2 text-slate-400 hover:text-slate-600 hover:bg-gray-100 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button className="p-1 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50 transition-colors bg-gray-25">
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm font-medium text-navy-900">REQ-002</td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-blue-500">IT Equipment Request</td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800">Approved</span>
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-blue-400">2024-01-14</td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-blue-500">Sarah Johnson</td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                        <div className="flex space-x-1 sm:space-x-2">
                                            <button className="p-1 sm:p-2 text-slate-400 hover:text-slate-600 hover:bg-gray-100 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button className="p-1 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50 transition-colors bg-white">
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm font-medium text-navy-900">REQ-003</td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-blue-500">Travel Authorization</td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800">In Review</span>
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-blue-400">2024-01-13</td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-blue-500">Mike Davis</td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                        <div className="flex space-x-1 sm:space-x-2">
                                            <button className="p-1 sm:p-2 text-slate-400 hover:text-slate-600 hover:bg-gray-100 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button className="p-1 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50 transition-colors bg-gray-25">
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm font-medium text-navy-900">REQ-004</td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-blue-500">Budget Approval</td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800">Rejected</span>
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-blue-400">2024-01-12</td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-blue-500">Lisa Wilson</td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                        <div className="flex space-x-1 sm:space-x-2">
                                            <button className="p-1 sm:p-2 text-slate-400 hover:text-slate-600 hover:bg-gray-100 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button className="p-1 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50 transition-colors bg-white">
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm font-medium text-navy-900">REQ-005</td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-blue-500">Training Request</td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800">Approved</span>
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-blue-400">2024-01-11</td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-blue-500">Tom Brown</td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                        <div className="flex space-x-1 sm:space-x-2">
                                            <button className="p-1 sm:p-2 text-slate-400 hover:text-slate-600 hover:bg-gray-100 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button className="p-1 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        );
    }

    public componentDidMount(): void {
        window.loadDashboardComponent();
    }
}
