import * as React from "react";
import { Link } from "react-router-dom";

interface GlobalTopNavState {
  activeLink: string;
  isMobileMenuOpen: boolean; // Added to track mobile menu state
}

export default class GlobalTopNav extends React.Component<{}, GlobalTopNavState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      activeLink: "/", // Initial active link
      isMobileMenuOpen: false, // Initial mobile menu state
    };

    // Bind methods to ensure `this` refers to the component instance
    this.toggleMobileMenu = this.toggleMobileMenu.bind(this);
    this.closeMobileMenu = this.closeMobileMenu.bind(this);
    this.setActiveLink = this.setActiveLink.bind(this);
  }

  // Toggle mobile menu
  private toggleMobileMenu() {
    this.setState((prevState) => ({
      isMobileMenuOpen: !prevState.isMobileMenuOpen,
    }));
  }

  // Close mobile menu
  private closeMobileMenu() {
    if (this.state.isMobileMenuOpen) {
      this.setState({ isMobileMenuOpen: false });
    }
  }

  // Set active link
  private setActiveLink(link: string) {
    this.setState({ activeLink: link });
  }

  public render(): React.ReactElement {
    const { activeLink, isMobileMenuOpen } = this.state;

    return (
      <>
        {/* Top Navigation Bar */}
        <header className="h-16 bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 flex items-center justify-between shadow-sm relative z-30">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Hamburger Menu Button - Show on all screens except xl+ */}
            <button
              className="xl:hidden text-slate-600 hover:text-slate-800 transition-colors p-1"
              onClick={this.toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <svg
                id="menu-icon"
                className={`w-6 h-6 ${isMobileMenuOpen ? "hidden" : "block"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                id="close-icon"
                className={`w-6 h-6 ${isMobileMenuOpen ? "block" : "hidden"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h1 className="text-base sm:text-lg md:text-xl font-semibold text-slate-800 truncate">
              {/* Title placeholder */}
            </h1>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 pl-2 md:pl-4 border-l border-gray-200">
              <div className="flex items-center justify-center">
                <span className="text-sm font-medium text-slate-800" id="currentusername" />
              </div>
              {/* <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg> */}
            </div>
          </div>
        </header>
        {/* Mobile Menu Dropdown - Show on all screens except xl+ */}
        <div
          id="mobile-menu"
          className={`xl:hidden sidebar-gradient border-b border-slate-600 transition-all duration-300 ease-in-out overflow-hidden relative z-20 ${
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {/* Diagonal Lines Pattern Overlay for Mobile Menu */}
          <div className="absolute inset-0 diagonal-lines-pattern" />
          <div className="relative z-10">
            {/* Mobile Menu Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-slate-600">
              <div className="flex gap-3 items-center">
                <img src={require("../Assets/img/rslogo_mono.png")} style={{ marginLeft: "-10px", maxWidth: "100%" }} id="companylogo" alt="Company logo" />
                <h2 className="text-xl font-semibold text-white">Audit Management Revision: <span id="auditmanagementversionMobile"></span></h2>
              </div>
              <h2 className="text-lg font-semibold text-white">Effective Date: <span id="versioneffectivedateMobile"></span></h2>
            </div>
            {/* Mobile Navigation */}
            <nav className="py-2" id="mobile-nav">
              <div className="relative">
                {activeLink === "/" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
                <Link
                  to="/"
                  onClick={() => {
                    this.setActiveLink("/");
                    this.closeMobileMenu(); // Close menu on link click
                  }}
                  className={`w-full flex items-center px-6 py-4 text-left transition-all duration-200 hover:bg-slate-600 ${
                    activeLink === "/" ? "bg-slate-600 text-white border-r-2 border-red-500" : "text-slate-300 hover:text-white"
                  }`}
                >
                  <svg className="w-5 h-5 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  </svg>
                  <span className="font-medium">Dashboard</span>
                </Link>
              </div>
              <div className="relative">
                {activeLink === "/newrequest" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
                <Link
                  to="/newrequest"
                  onClick={() => {
                    this.setActiveLink("/newrequest");
                    this.closeMobileMenu(); // Close menu on link click
                  }}
                  className={`w-full flex items-center px-6 py-4 text-left transition-all duration-200 hover:bg-slate-600 ${
                    activeLink === "/newrequest" ? "bg-slate-600 text-white border-r-2 border-red-500" : "text-slate-300 hover:text-white"
                  }`}
                >
                  <svg className="w-5 h-5 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="font-medium">Create Audit</span>
                </Link>
              </div>
              <div className="relative">
                {activeLink === "/approverequest" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
                <Link
                  to="/approverequest"
                  onClick={() => {
                    this.setActiveLink("/approverequest");
                    this.closeMobileMenu(); // Close menu on link click
                  }}
                  className={`w-full flex items-center px-6 py-4 text-left transition-all duration-200 hover:bg-slate-600 ${
                    activeLink === "/approverequest" ? "bg-slate-600 text-white border-r-2 border-red-500" : "text-slate-300 hover:text-white"
                  }`}
                >
                  <svg className="w-5 h-5 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <span className="font-medium">Approval</span>
                </Link>
              </div>
              <div className="relative">
                {activeLink === "/viewrequest" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
                <Link
                  to="/viewrequest"
                  onClick={() => {
                    this.setActiveLink("/viewrequest");
                    this.closeMobileMenu(); // Close menu on link click
                  }}
                  className={`w-full flex items-center px-6 py-4 text-left transition-all duration-200 hover:bg-slate-600 ${
                    activeLink === "/viewrequest" ? "bg-slate-600 text-white border-r-2 border-red-500" : "text-slate-300 hover:text-white"
                  }`}
                >
                  <svg className="w-5 h-5 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <span className="font-medium">View</span>
                </Link>
              </div>
            </nav>
          </div>
        </div>
        {/* Mobile Menu Backdrop - Show on all screens except xl+ */}
        <div
          id="mobile-backdrop"
          className={`xl:hidden fixed inset-0 bg-black bg-opacity-25 z-10 transition-opacity duration-300 ${
            isMobileMenuOpen ? "block" : "hidden"
          }`}
          onClick={this.closeMobileMenu}
        />
      </>
    );
  }
}