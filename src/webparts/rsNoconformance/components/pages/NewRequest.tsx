import ClientButton from "../../../../Global/ClientButton";
import * as React from "react";
require("newrequest");

export default class NewRequest extends React.Component<{}, {}> {
    public render(): React.ReactElement {
        return (
            <section className="bg-white p-4 sm:p-6 border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    <div className="space-y-4 sm:space-y-6">
                        {/* Text Input */}
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-blue-600 mb-2">Reference ID</label>
                            <input
                                type="text"
                                placeholder="Enter text here..."
                                className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base"
                            />
                        </div>
                        {/* Text Input */}
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-blue-600 mb-2">Employee ID</label>
                            <input
                                type="text"
                                placeholder="Enter text here..."
                                className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base"
                            />
                        </div>
                        {/* Text Input */}
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-blue-600 mb-2">Division/Unit</label>
                            <input
                                type="text"
                                placeholder="Enter text here..."
                                className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base"
                            />
                        </div>
                    </div>
                    <div className="space-y-4 sm:space-y-6">
                        {/* Text Input */}
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-blue-600 mb-2">Employee Name</label>
                            <input
                                type="text"
                                placeholder="Enter text here..."
                                className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base"
                            />
                        </div>
                        {/* Text Input */}
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-blue-600 mb-2">Email</label>
                            <input
                                type="text"
                                placeholder="Enter text here..."
                                className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base"
                            />
                        </div>
                    </div>
                </div>
                <div style={{marginTop: "2.2rem"}}>
                    <div>
                        <label className="block text-sm font-medium text-blue-600 mb-2">Comments</label>
                        <textarea
                            placeholder="Enter text here..."
                            className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base"
                            defaultValue={""}
                        />
                    </div>
                </div>
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-navy-900 mb-4 sm:mb-6">Non Conformance Issued To:</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-blue-600 mb-2">Employee Name</label>
                            <input
                                type="text"
                                placeholder="Enter text here..."
                                className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base"
                            />
                        </div>
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-blue-600 mb-2">Employee ID</label>
                            <input
                                type="text"
                                placeholder="Enter text here..."
                                className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base"
                            />
                        </div>
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-blue-600 mb-2">Email</label>
                            <input
                                type="text"
                                placeholder="Enter text here..."
                                className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base"
                            />
                        </div>
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-blue-600 mb-2">Request Date</label>
                            <input
                                type="date"
                                className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base"
                            />
                        </div>
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-blue-600 mb-2">Expected Date</label>
                            <input
                                type="date"
                                className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base"
                            />
                        </div>
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-blue-600 mb-2">Non Conformance Description</label>
                            <textarea
                                placeholder="Enter text here..."
                                className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base"
                                defaultValue={""}
                            />
                        </div>
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-blue-600 mb-2">Type of Conformance</label>
                            <select className="w-full px-3 sm:px-4 py-2 sm:py-3  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none bg-no-repeat bg-right pr-8 sm:pr-10 text-sm sm:text-base dropdown-arrow">
                                <option>Select an option</option>
                                <option>Option 1</option>
                                <option>Option 2</option>
                                <option>Option 3</option>
                            </select>
                        </div>
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-blue-600 mb-2">Type of Conformance</label>
                            <select className="w-full px-3 sm:px-4 py-2 sm:py-3  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none bg-no-repeat bg-right pr-8 sm:pr-10 text-sm sm:text-base dropdown-arrow">
                                <option>Select an option</option>
                                <option>Option 1</option>
                                <option>Option 2</option>
                                <option>Option 3</option>
                            </select>
                        </div>
                        {/* <div className="mt-2">
                            <label className="block text-sm font-medium text-blue-600 mb-2">ISO Requirement</label>
                            <input
                                type="text"
                                placeholder="Enter text here..."
                                className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base"
                            />
                        </div> */}
                    </div>
                </div>

                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-navy-900 mb-4 sm:mb-6">NonConformance Section</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-blue-600 mb-2">NC Reference No.</label>
                            <input
                                type="text"
                                placeholder="Enter text here..."
                                className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base"
                            />
                        </div>
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-blue-600 mb-2">ISO Clause</label>
                            <input
                                type="text"
                                placeholder="Enter text here..."
                                className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base"
                            />
                        </div>
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-blue-600 mb-2">Non Conformance Statement</label>
                            <input
                                type="text"
                                placeholder="Enter text here..."
                                className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base"
                            />
                        </div>
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-blue-600 mb-2">Objective Evidence</label>
                            <input
                                type="text"
                                placeholder="Enter text here..."
                                className="w-full px-3 sm:px-4 py-2 sm:py-3  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm sm:text-base"
                            />
                        </div>
                    </div>
                    <div className="action-btns flex justify-center items-center gap-3" style={{marginTop: "2rem"}}>
                        <ClientButton
                            text={"Submit"}
                            func={"MainApplication.NewRequestComponent.confirmSubmit"}
                            clax={"px-4 py-2 bg-slate-700 text-white text-sm font-medium hover:bg-slate-800 transition-colors"}
                            prop=""
                            attr=""
                        />
                        {/* <button id="saveButton" className="px-4 py-2 bg-slate-500 text-white text-sm font-medium hover:bg-slate-600 transition-colors">
                            Save
                        </button> */}
                        <a href="#/" className="px-4 py-2 bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">
                            Cancel
                        </a>
                    </div>
                </div>
            </section>
        );
    }

    public componentDidMount(): void {
        window.loadNewRequestComponent();
    }
}
