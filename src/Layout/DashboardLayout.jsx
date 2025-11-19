import React, { useContext } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { FaThLarge, FaTasks, FaCalendarAlt, FaUsers, FaCog, FaSignOutAlt, FaBars, FaSearch, FaBell } from 'react-icons/fa';
import { AuthContext } from '../Provider/AuthProvider';

const DashboardLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logOut } = useContext(AuthContext);

    const handleLogout = () => {
        logOut().then(() => navigate('/login')).catch(console.error);
    };

    // Helper for styling active menu items (Green left border + text)
    const getLinkClass = (path) => {
        const base = "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-r-full";
        if (location.pathname === path) {
            return `${base} text-[#105144] bg-green-50 border-l-4 border-[#105144]`;
        }
        return `${base} text-gray-400 hover:text-[#105144] hover:bg-gray-50`;
    };

    return (
        <div className="drawer lg:drawer-open font-sans bg-[#F8F9FA] text-slate-800">
            <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
            
            {/* MAIN CONTENT AREA */}
            <div className="drawer-content flex flex-col p-4 md:p-10 min-h-screen transition-all duration-300">
                
                {/* MOBILE HEADER (Visible on small screens) */}
                <div className="lg:hidden flex items-center justify-between mb-6 bg-white p-4 rounded-[20px] shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost btn-sm text-gray-500">
                            <FaBars className="text-lg" />
                        </label>
                        <div className="flex items-center gap-2 text-[#105144] font-bold text-xl">
                            <div className="w-8 h-8 rounded-xl border-2 border-[#105144] flex items-center justify-center">
                                <div className="w-2 h-2 bg-[#105144] rounded-full"></div>
                            </div>
                            PlanCraft
                        </div>
                    </div>
                    {/* Mobile Profile Avatar */}
                    <div className="avatar">
                        <div className="w-8 h-8 rounded-full ring-2 ring-[#105144] ring-offset-2">
                            <img src={user?.photoURL || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"} alt="avatar" />
                        </div>
                    </div>
                </div>

                {/* DESKTOP HEADER (Search + Profile) */}
                <div className="hidden lg:flex justify-between items-center mb-10">
                    {/* Search Bar */}
                    <div className="relative w-96">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search task" 
                            className="input input-bordered w-full pl-10 rounded-full bg-white border-none shadow-sm focus:ring-1 focus:ring-[#105144] transition-all" 
                        />
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 font-mono">⌘ F</span>
                    </div>

                    {/* Profile Section */}
                    <div className="flex items-center gap-6">
                        <button className="btn btn-circle btn-sm btn-ghost bg-white shadow-sm hover:bg-gray-100">
                            <FaBell className="text-gray-500" />
                        </button>
                        <div className="flex items-center gap-3 text-right">
                            <div className="hidden md:block">
                                <p className="text-sm font-bold text-gray-800 leading-tight">{user?.displayName || "User"}</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                            <div className="avatar">
                                <div className="w-10 h-10 rounded-full ring-2 ring-white shadow-md cursor-pointer hover:ring-[#105144] transition-all">
                                    <img src={user?.photoURL || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"} alt="avatar" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RENDER CHILD ROUTES */}
                <Outlet />
            </div> 
            
            {/* SIDEBAR (Drawer Side) */}
            <div className="drawer-side z-50">
                <label htmlFor="my-drawer-2" className="drawer-overlay bg-slate-900/20 backdrop-blur-sm"></label> 
                <aside className="w-72 min-h-full bg-white flex flex-col justify-between py-8 px-4 shadow-2xl lg:shadow-none border-r border-gray-100">
                    
                    <div>
                        {/* Logo */}
                        <div className="px-4 mb-10 flex items-center gap-3 text-[#105144] font-bold text-2xl">
                            <div className="w-8 h-8 rounded-xl border-2 border-[#105144] flex items-center justify-center">
                                <div className="w-2 h-2 bg-[#105144] rounded-full"></div>
                            </div>
                            PlanCraft
                        </div>

                        {/* Menu */}
                        <div className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Menu</div>
                        <nav className="space-y-1">
                            <Link to="/dashboard" className={getLinkClass('/dashboard')}>
                                <FaThLarge /> Dashboard
                            </Link>
                            <Link to="/dashboard/projects" className={getLinkClass('/dashboard/projects')}>
                                <FaTasks /> Projects
                            </Link>
                            <Link to="/dashboard/teams" className={getLinkClass('/dashboard/teams')}>
                                <FaUsers /> Teams
                            </Link>
                            {/* Calendar Link */}
                            <Link to="/dashboard/calendar" className={getLinkClass('/dashboard/calendar')}>
                                <FaCalendarAlt /> Calendar
                            </Link>
                        </nav>

                        <div className="px-4 mt-8 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">General</div>
                        <nav className="space-y-1">
                            <a href="#" className={getLinkClass('/settings')}><FaCog /> Settings</a>
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-r-full">
                                <FaSignOutAlt /> Logout
                            </button>
                        </nav>
                    </div>

                    {/* Download App Card */}
                    <div className="bg-[#052e16] rounded-[24px] p-6 text-white relative overflow-hidden mt-6 mx-2 shadow-lg shadow-green-900/20">
                        <div className="relative z-10">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-md">
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                            </div>
                            <h3 className="font-bold text-sm mb-1">Mobile App</h3>
                            <p className="text-[10px] text-gray-300 mb-3 leading-relaxed">Manage tasks on the go with PlanCraft mobile.</p>
                            <button className="btn btn-xs bg-[#105144] border-none text-white w-full rounded-full hover:bg-white hover:text-[#105144] transition-colors">Download</button>
                        </div>
                        {/* Abstract Circles Background */}
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full border-[3px] border-white/10"></div>
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full border-[3px] border-white/10"></div>
                    </div>

                </aside>
            </div>
        </div>
    );
};

export default DashboardLayout;