import * as React from 'react';
import CustomPeoplePicker from '../../../../Global/CustomPeoplePicker';
import { Link } from 'react-router-dom';
require("viewrequest");


export default class ViewRequest extends React.Component<{}, {}> {
    public render(): React.ReactElement {

        return (
            <div className="bg-white p-4 sm:p-6 border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Text Input */}
                    <div className="mt-2">
                        <label className="block text-sm font-medium text-blue-600 mb-2">Audit Reference ID</label>
                        <input readOnly type="text" speed-bind="WorkflowRequestID" placeholder="Enter text here..." className="w-full px-3 sm:px-4 py-2 sm:py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" />
                    </div>
                    {/* Text Input */}
                    <div className="mt-2">
                        <label className="block text-sm font-medium text-blue-600 mb-2">Employee ID</label>
                        <input readOnly type="text" speed-bind="EmployeeID" placeholder="Enter text here..." className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Text Input */}
                    <div className="mt-2">
                        <label className="block text-sm font-medium text-blue-600 mb-2">Department</label>
                        <input readOnly type="text" speed-bind="Department" placeholder="Enter text here..." className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" />
                    </div>
                    {/* Text Input */}
                    <div className="mt-2">
                        <label className="block text-sm font-medium text-blue-600 mb-2">Name</label>
                        <input readOnly type="text" speed-bind="InitiatorName" placeholder="Enter text here..." className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Text Input */}
                    <div className="mt-2">
                        <label className="block text-sm font-medium text-blue-600 mb-2">Email</label>
                        <input readOnly type="text" speed-bind="InitiatorEmailAddress" placeholder="Enter text here..." className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" />
                    </div>
                    {/* Dropdown */}
                    <div className="mt-2">
                        <label className="block text-sm font-medium text-blue-600 mb-2">Type of Audit</label>
                        <input readOnly type="text" speed-bind="TypeOfAudit" placeholder="Enter text here..." className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Dropdown */}
                    <div className="mt-2">
                        <label className="block text-sm font-medium text-blue-600 mb-2">Auditees </label>
                        <CustomPeoplePicker multiple custom-people="Auditees" />
                    </div>
                    <div className="mt-2">
                        <label className="block text-sm font-medium text-blue-600 mb-2">Other Auditors </label>
                        <CustomPeoplePicker multiple custom-people="OtherAuditors" />
                    </div>
                </div>
                <div style={{ marginTop: '2.2rem' }}>
                    <div>
                        <label className="block text-sm font-medium text-blue-600 mb-2">Comments</label>
                        <textarea readOnly speed-bind="InitiatorComment" placeholder="Enter text here..." className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" defaultValue={""} />
                    </div>
                </div>

                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-navy-900 my-4 sm:my-6">Auditee Details</h2>
                    <div id='auditeesContainer' />
                </div>
                <div className="mt-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-navy-900 my-4 sm:my-6">Audit Questions</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-blue-600 mb-2">Process</label>
                            <input readOnly type="text" speed-bind="Process" placeholder="Enter text here..." className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" />
                        </div>
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-blue-600 mb-2">Procedure</label>
                            <input readOnly type="text" speed-bind="Procedure" placeholder="Enter text here..." className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" />
                        </div>
                    </div>
                    <div id='questionsContainer' className="mt-2" />
                    <div style={{ marginTop: '2.2rem' }}>
                        <div>
                            <label className="block text-sm font-medium text-blue-600 mb-2">Areas of Improvement</label>
                            <textarea readOnly speed-bind="AreasOfImprovement" placeholder="Enter text here..." className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" defaultValue={""} />
                        </div>
                    </div>
                    {/* <div className="lg:flex justify-between gap-3" style={{ marginTop: '2rem' }}>
                        <div className="w-full mt-2">
                            <label className="block text-sm font-medium text-blue-600 mb-2">Status</label>
                            <select className="w-full px-3 sm:px-4 py-2 sm:py-3  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none bg-no-repeat bg-right pr-8 sm:pr-10 text-sm sm:text-base dropdown-arrow">
                                <option>Select an option</option>
                                <option>Option 1</option>
                                <option>Option 2</option>
                                <option>Option 3</option>
                            </select>
                        </div>
                        <div className="w-full mt-2">
                            <label className="block text-sm font-medium text-blue-600 mb-2">Areas of Improvement</label>
                            <textarea placeholder="Enter text here..." className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" defaultValue={""} />
                        </div>
                    </div> */}
                    <div className="action-btns flex justify-center items-center gap-3" style={{ marginTop: '2rem' }}>
                        <Link to="/" className="px-4 py-2 bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">
                            Cancel
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    public componentDidMount(): void {
        window.loadViewRequestComponent();
    }
}
