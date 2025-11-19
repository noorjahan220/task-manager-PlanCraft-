import React, { useEffect, useState, useContext } from 'react';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import useAxiosPublic from '../../Hooks/UseAxiosPublic';
import { AuthContext } from '../../Provider/AuthProvider';
import { FaArrowUp, FaPlus, FaEllipsisH, FaCheckCircle } from 'react-icons/fa';

const DashboardHome = () => {
    const axiosPublic = useAxiosPublic();
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({ 
        totalProjects: 0, 
        totalTasks: 0, 
        workload: [], 
        logs: [] 
    });
    const [loading, setLoading] = useState(true);
    const [rebalancing, setRebalancing] = useState(false);

    // --- LOGIC (UNCHANGED) ---
    const fetchStats = () => {
        if (!user?.email) return;
        axiosPublic.get(`/api/dashboard/stats?email=${user.email}`)
            .then(res => { 
                setStats(res.data); 
                setLoading(false); 
            })
            .catch(err => { console.error(err); setLoading(false); });
    };

    useEffect(() => { fetchStats(); }, [user]);

    const handleReassign = () => {
        Swal.fire({
            title: 'Auto-Reassign Tasks?',
            text: "Rebalance team workload?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            confirmButtonColor: '#105144'
        }).then((result) => {
            if (result.isConfirmed) {
                setRebalancing(true);
                axiosPublic.post('/api/dashboard/rebalance', { email: user.email })
                    .then(res => { Swal.fire('Success', res.data.message, 'success'); fetchStats(); })
                    .catch(() => Swal.fire('Error', 'Failed', 'error'))
                    .finally(() => setRebalancing(false));
            }
        });
    };
    // --- END LOGIC ---

    if (loading) return <div className="p-10 text-center"><span className="loading loading-spinner text-[#105144]"></span></div>;

    return (
        <div className="space-y-6 md:space-y-8 font-sans">
            
            {/* 1. PAGE HEADER */}
            {/* Responsive: Stacks vertically on mobile, row on desktop */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="w-full md:w-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">Dashboard</h2>
                    <p className="text-gray-400 text-sm">Plan, prioritize, and accomplish your tasks.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button onClick={handleReassign} disabled={rebalancing} className="btn bg-[#105144] hover:bg-[#0e463b] text-white border-none rounded-full px-6 shadow-lg shadow-green-900/20 w-full sm:w-auto">
                        {rebalancing ? <span className="loading loading-spinner"></span> : <><FaPlus className="mr-1" /> Reassign Tasks</>}
                    </button>
                    <button className="btn bg-white text-slate-700 border-none hover:bg-gray-50 rounded-full px-6 shadow-sm w-full sm:w-auto">
                        Import Data
                    </button>
                </div>
            </div>

            {/* 2. STATS CARDS ROW */}
            {/* Responsive: 1 col mobile, 2 col tablet, 4 col desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                {/* Card 1: Dark Green */}
                <div className="bg-[#105144] rounded-[30px] p-6 text-white relative overflow-hidden shadow-xl shadow-green-900/10 group">
                    <div className="flex justify-between items-start mb-6">
                        <span className="text-sm font-medium opacity-90">Total Projects</span>
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <FaArrowUp className="text-xs rotate-45" />
                        </div>
                    </div>
                    <h3 className="text-4xl font-bold mb-2">{stats.totalProjects}</h3>
                    <div className="flex items-center gap-2 text-xs opacity-70">
                        <span className="bg-white/20 px-1.5 py-0.5 rounded text-white">5+</span>
                        <span>Increased from last month</span>
                    </div>
                </div>

                {/* Card 2: White */}
                <div className="bg-white rounded-[30px] p-6 text-slate-800 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-6">
                        <span className="text-sm font-medium text-gray-500">Running Tasks</span>
                        <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center">
                            <FaArrowUp className="text-xs text-gray-400 rotate-45" />
                        </div>
                    </div>
                    <h3 className="text-4xl font-bold mb-2">{stats.totalTasks}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="bg-green-50 text-[#105144] px-1.5 py-0.5 rounded">12+</span>
                        <span>Increased from last month</span>
                    </div>
                </div>

                 {/* Card 3: White (Hidden on tiny screens, shown on tablet+) */}
                 <div className="bg-white rounded-[30px] p-6 text-slate-800 shadow-sm border border-gray-100 hidden sm:block">
                    <div className="flex justify-between items-start mb-6">
                        <span className="text-sm font-medium text-gray-500">Ended Projects</span>
                        <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center">
                            <FaArrowUp className="text-xs text-gray-400 rotate-45" />
                        </div>
                    </div>
                    <h3 className="text-4xl font-bold mb-2">10</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="bg-green-50 text-[#105144] px-1.5 py-0.5 rounded">2+</span>
                        <span>Increased from last month</span>
                    </div>
                </div>

                {/* Card 4: White (Hidden on tablet, shown on XL screens) */}
                <div className="bg-white rounded-[30px] p-6 text-slate-800 shadow-sm border border-gray-100 hidden xl:block">
                     <div className="flex justify-between items-start mb-6">
                        <span className="text-sm font-medium text-gray-500">Pending</span>
                        <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center">
                            <FaArrowUp className="text-xs text-gray-400 rotate-45" />
                        </div>
                    </div>
                    <h3 className="text-4xl font-bold mb-2">2</h3>
                    <div className="text-xs text-gray-400">On Discuss</div>
                </div>
            </div>

            {/* 3. MAIN CONTENT GRID */}
            {/* Responsive: Stacks on mobile/tablet, side-by-side on large desktops */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT: Team Collaboration (Workload) */}
                <div className="lg:col-span-2 bg-white rounded-[35px] p-6 md:p-8 shadow-sm border border-gray-100">
                    <div className="flex flex-row justify-between items-center mb-6 md:mb-8">
                        <h3 className="text-lg md:text-xl font-bold text-slate-800">Team Collaboration</h3>
                        
                        <Link to="/dashboard/teams" className="btn btn-sm btn-outline rounded-full text-gray-500 hover:bg-gray-50 hover:text-[#105144] border-gray-300">
                            + <span className="hidden sm:inline">Add Member</span>
                        </Link>
                    </div>

                    {/* Responsive Table Container */}
                    <div className="overflow-x-auto">
                        {stats.workload && stats.workload.length > 0 ? (
                            <table className="w-full text-left border-separate border-spacing-y-4 min-w-[500px]">
                                <tbody>
                                    {stats.workload.map((member, index) => {
                                        const count = member.count || member.taskCount || 0;
                                        const capacity = member.capacity || 5;
                                        const isOverloaded = count > capacity;
                                        const avatarSeed = member._id || index; 

                                        return (
                                            <tr key={index} className="group">
                                                <td className="py-2 w-12">
                                                    <div className="avatar">
                                                        <div className="w-10 rounded-full ring ring-offset-2 ring-white bg-gray-200">
                                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} alt="av" />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4">
                                                    <div className="font-bold text-slate-800 text-sm md:text-base">
                                                        {member.name || member._id || "Unknown User"}
                                                    </div>
                                                    <div className="text-xs text-gray-400">Load: {count} / {capacity} Tasks</div>
                                                </td>
                                                {/* Hide status badge on very small screens if needed, currently shown due to min-w */}
                                                <td className="px-4">
                                                    {isOverloaded ? (
                                                        <span className="badge bg-red-50 text-red-500 border-none px-2 md:px-3 py-2 text-[10px] md:text-xs font-bold">Overloaded</span>
                                                    ) : (
                                                        <span className="badge bg-green-50 text-[#105144] border-none px-2 md:px-3 py-2 text-[10px] md:text-xs font-bold">Available</span>
                                                    )}
                                                </td>
                                                <td className="text-right">
                                                    <div className="radial-progress text-[#105144] text-[10px]" style={{"--value": Math.min((count/capacity)*100, 100), "--size": "2rem"}}>
                                                        {Math.round((count/capacity)*100)}%
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                             <div className="text-center py-10 text-gray-400">No active team data.</div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Recent Activity */}
                <div className="bg-white rounded-[35px] p-6 md:p-8 shadow-sm border border-gray-100 h-[400px] lg:h-[500px] overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg md:text-xl font-bold text-slate-800">Recent Activity</h3>
                        <button className="btn btn-xs btn-circle btn-ghost"><FaPlus /></button>
                    </div>

                    <div className="space-y-6">
                        {stats.logs && stats.logs.length > 0 ? (
                            stats.logs.map((log, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <div className={`mt-1 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${index % 2 === 0 ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-500'}`}>
                                        {index % 2 === 0 ? <FaCheckCircle /> : <FaEllipsisH />}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1">
                                            {log.message || log.action}
                                        </h4>
                                        <p className="text-[11px] text-gray-400 font-medium">
                                            Date: {new Date(log.timestamp || log.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-400 mt-10">No recent logs.</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardHome;