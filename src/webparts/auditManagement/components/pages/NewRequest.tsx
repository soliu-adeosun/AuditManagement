import * as React from 'react';
import CustomPeoplePicker from '../../../../Global/CustomPeoplePicker';
import ClientButton from '../../../../Global/ClientButton';
import { Link } from 'react-router-dom';
require("newrequest");

export default class NewRequest extends React.Component<{}, {}> {
    public render(): React.ReactElement {

        return (
            <section className="bg-white p-4 sm:p-6 border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    <div className="mt-2">
                        <label className="block text-sm font-medium text-blue-600 mb-2">Name</label>
                        <input readOnly id="employeeName" type="text" placeholder="Enter text here..." className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" />
                    </div>
                    {/* Text Input */}
                    <div className="mt-2">
                        <label className="block text-sm font-medium text-blue-600 mb-2">Employee ID</label>
                        <input readOnly speed-bind="EmployeeID" id="employeeId" type="text" placeholder="Enter text here..." className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

                    {/* Text Input */}
                    <div className="mt-2">
                        <label className="block text-sm font-medium text-blue-600 mb-2">Email</label>
                        <input readOnly id="employeeMail" type="text" placeholder="Enter text here..." className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" />
                    </div>
                    {/* Text Input */}
                    <div className="mt-2">
                        <label className="block text-sm font-medium text-blue-600 mb-2">Division/Unit</label>
                        <input readOnly speed-bind="Department" id="department" type="text" placeholder="Enter text here..." className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" />
                    </div>
                    {/* Text Input */}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Dropdown */}
                    <div className="mt-2">
                        <label className="block text-sm font-medium text-blue-600 mb-2">Type of Audit <span className="required">*</span></label>
                        <select id="typeOfAudit" speed-bind-validate="TypeOfAudit" className="w-full px-3 sm:px-4 py-2 sm:py-3  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none bg-no-repeat bg-right pr-8 sm:pr-10 text-sm sm:text-base dropdown-arrow">
                            <option disabled selected value="">Select an audit type</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    <div className="mt-2">
                        <label className="block text-sm font-medium text-blue-600 mb-2 ">Auditees <span className="required">*</span></label>
                        <CustomPeoplePicker validate-control="true" multiple custom-people="Auditees" validation-msg="Please select an auditee" />
                    </div>
                    {/* Dropdown */}
                    <div className="mt-2">
                        <label className="block text-sm font-medium text-blue-600 mb-2">Other Auditors <span className="required">*</span></label>
                        <CustomPeoplePicker validate-control="true" multiple custom-people="OtherAuditors" validation-msg="Please select an auditor" />
                    </div>
                </div>
                <div style={{ marginTop: '2.2rem' }}>
                    <div>
                        <label className="block text-sm font-medium text-blue-600 mb-2">Comments <span className="required">*</span></label>
                        <textarea speed-bind-validate="InitiatorComment" placeholder="Enter text here..." className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" defaultValue={""} />
                    </div>
                </div>
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-navy-900 my-4 sm:my-6">Auditee Details</h2>
                    <div id='auditeesContainer' />
                </div>
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-navy-900 my-4 sm:my-6">Other Auditors Details</h2>
                    <div id='auditorsContainer' />
                </div>
                <div className="mt-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-navy-900 my-4 sm:my-6">Audit Questions</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-blue-600 mb-2">Process <span className="required">*</span></label>
                            <select id="process" speed-bind-validate="Process" className="w-full px-3 sm:px-4 py-2 sm:py-3  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none bg-no-repeat bg-right pr-8 sm:pr-10 text-sm sm:text-base dropdown-arrow">
                                <option disabled selected value="" >Select a process</option>
                            </select>
                        </div>
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-blue-600 mb-2">Procedure <span className="required">*</span></label>
                            <select id="procedure" speed-bind-validate="Procedure" className="w-full px-3 sm:px-4 py-2 sm:py-3  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none bg-no-repeat bg-right pr-8 sm:pr-10 text-sm sm:text-base dropdown-arrow">
                                <option disabled selected value="" >Select a procedure</option>
                            </select>
                        </div>
                    </div>
                    <div id='questionsContainer' className="my-4" />

                    <section className="flex btn-action" style={{ marginTop: '2rem' }}>
                        <button id="addQuestionButton" className="px-4 py-2 bg-slate-700 text-white text-sm font-medium hover:bg-slate-800 transition-colors">
                            Add New
                        </button>
                    </section>
                    <div style={{ marginTop: '2.2rem' }}>
                        <div>
                            <label className="block text-sm font-medium text-blue-600 mb-2">Areas of Improvement</label>
                            <textarea speed-bind="AreasOfImprovement" placeholder="Enter text here..." className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" defaultValue={""} />
                        </div>
                    </div>

                    {/* Reviewer's comment */}
                    <div style={{ marginTop: '2.2rem' }} id='reviewerCommentDiv' className='hidden'>
                        <div>
                            <label className="block text-sm font-medium text-blue-600 mb-2">Comments</label>
                            <textarea speed-bind-validate="Comment" placeholder="Enter text here..." className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base" readOnly />
                        </div>
                    </div>
                    <div style={{ marginTop: '2rem' }}>
                        <label className="flex items-center space-x-3">
                            <input id="checkbox" type="checkbox" className="w-4 h-4 text-red-500 border-gray-300 focus:ring-red-500" />
                            <span className="text-sm text-red-500">Have the non-conformance/area of improvement been communicated to the auditee?</span>
                        </label>
                    </div>
                    <div className="action-btns flex justify-center items-center gap-3" style={{ marginTop: '2rem' }}>
                        <ClientButton text={"Submit"} func={"MainApplication.NewRequestComponent.confirmSubmit"} clax={"px-4 py-2 text-sm font-medium submit-button"} prop="NewRequest" attr="" />
                        <ClientButton text={"Save"} func={"MainApplication.NewRequestComponent.confirmSubmit"} clax={"px-4 py-2 bg-slate-500 text-white text-sm font-medium hover:bg-slate-600 transition-colors"} prop="Draft" attr="id='draftbtn'" />
                        <Link to="/" className="px-4 py-2 bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">
                            Cancel
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    public componentDidMount(): void {
        window.loadNewRequestComponent();
    }
}
