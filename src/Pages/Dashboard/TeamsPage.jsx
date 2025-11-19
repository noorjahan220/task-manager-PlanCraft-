import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import useAxiosPublic from '../../Hooks/UseAxiosPublic';
import { AuthContext } from '../../Provider/AuthProvider';
import { FaPlus, FaUsers, FaUserPlus, FaUserTie, FaTimes } from 'react-icons/fa';

const TeamsPage = () => {
    const axiosPublic = useAxiosPublic();
    const { user } = useContext(AuthContext);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTeamId, setSelectedTeamId] = useState(null);

    const { register: registerTeam, handleSubmit: handleSubmitTeam, reset: resetTeam } = useForm();
    const { register: registerMember, handleSubmit: handleSubmitMember, reset: resetMember } = useForm();

    // 1. SYNC USER TO DB
    useEffect(() => {
        if (user?.email) {
            axiosPublic.post('/api/users', {
                name: user.displayName || "User",
                email: user.email
            }).catch(err => console.log("Sync skipped"));
        }
    }, [user, axiosPublic]);

    // 2. FETCH TEAMS
    const fetchTeams = useCallback(() => {
        if (!user?.email) return;
        setLoading(true);
        
        axiosPublic.get(`/api/teams?email=${user.email}`)
            .then(res => {
                setTeams(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [axiosPublic, user?.email]);

    useEffect(() => {
        fetchTeams();
    }, [fetchTeams]);

    // 3. CREATE TEAM
    const onCreateTeam = (data) => {
        if (!user?.email) return Swal.fire('Error', 'Login required', 'error');

        const teamData = { 
            name: data.name, 
            email: user.email 
        };

        axiosPublic.post('/api/teams', teamData)
            .then(res => {
                Swal.fire({ icon: 'success', title: 'Team created', timer: 1500, showConfirmButton: false });
                resetTeam();
                fetchTeams();
            })
            .catch(err => Swal.fire('Error', 'Failed to create team', 'error'));
    };

    // 4. ADD MEMBER
    const onAddMember = (data) => {
        if (!selectedTeamId) return;
        axiosPublic.post(`/api/teams/${selectedTeamId}/members`, data)
            .then(res => {
                Swal.fire({ icon: 'success', title: 'Member added', timer: 1500, showConfirmButton: false });
                resetMember();
                fetchTeams(); 
                document.getElementById('add_member_modal').close();
            })
            .catch(err => Swal.fire('Error', 'Failed', 'error'));
    };

    const openMemberModal = (teamId) => {
        setSelectedTeamId(teamId);
        document.getElementById('add_member_modal').showModal();
    };

    if (!user) return <div className="p-10 text-center text-[#105144]">Please Log In...</div>;

    return (
        <div className="space-y-8 font-sans">
            
            {/* HEADER SECTION (Responsive: Stacks on mobile, Row on desktop) */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="w-full lg:w-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Manage Teams</h2>
                    <p className="text-gray-400 text-sm">Create teams and manage members capacity.</p>
                </div>
                
                {/* CREATE TEAM FORM (Responsive) */}
                <form onSubmit={handleSubmitTeam(onCreateTeam)} className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto bg-white p-3 rounded-[24px] shadow-sm border border-gray-100">
                    <input 
                        type="text" 
                        placeholder="New Team Name..." 
                        className="input input-ghost w-full sm:w-64 bg-gray-50 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#105144]/20 pl-4 placeholder:text-sm transition-all" 
                        {...registerTeam("name", { required: true })} 
                    />
                    <button type="submit" className="btn bg-[#105144] hover:bg-[#0e463b] text-white border-none rounded-xl px-8 shadow-md w-full sm:w-auto h-12">
                        <FaPlus className="text-xs" /> Create
                    </button>
                </form>
            </div>

            {/* GRID CONTENT (Responsive: 1 col mobile, 2 col tablet, 3 col desktop) */}
            {loading ? (
                <div className="text-center mt-20"><span className="loading loading-spinner text-[#105144] loading-lg"></span></div>
            ) : teams.length === 0 ? (
                <div className="text-center py-20 bg-white border border-gray-100 rounded-[30px] shadow-sm text-gray-400 flex flex-col items-center mx-auto max-w-2xl">
                    <div className="bg-gray-50 p-6 rounded-full mb-4">
                        <FaUsers className="text-4xl opacity-20 text-slate-900" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">No teams yet</h3>
                    <p className="text-sm">Create your first team above to get started!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {teams.map((team) => (
                        <div key={team._id} className="bg-white rounded-[30px] p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                            
                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-50 to-white border border-green-100 text-[#105144] flex items-center justify-center shadow-sm">
                                        <FaUsers className="text-lg" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-800 leading-tight">{team.name}</h3>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Team</span>
                                    </div>
                                </div>
                                <div className="badge bg-[#105144]/5 text-[#105144] border-none font-bold p-3 rounded-lg">
                                    {team.members?.length || 0}
                                </div>
                            </div>

                            {/* Members List Area */}
                            <div className="flex-1 mb-6 bg-gray-50/50 rounded-2xl p-2 border border-gray-100">
                                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                    {team.members && team.members.length > 0 ? (
                                        team.members.map((m, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar placeholder">
                                                        <div className="bg-[#105144] text-white w-8 rounded-full">
                                                            <span className="text-xs font-bold">{m.name?.charAt(0)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-700">{m.name}</span>
                                                        <span className="text-[10px] text-gray-400">{m.role}</span>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded">
                                                    Cap: {m.capacity}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-xs text-gray-400 py-8 flex flex-col items-center">
                                            <span>No members yet</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card Footer */}
                            <button 
                                onClick={() => openMemberModal(team._id)} 
                                className="btn bg-transparent hover:bg-[#105144] text-gray-500 hover:text-white border border-dashed border-gray-300 hover:border-[#105144] w-full rounded-2xl gap-2 font-medium transition-all"
                            >
                                <FaUserPlus /> Add Member
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* 
                ------------------------------------------
                MODAL DESIGN 
                ------------------------------------------
            */}
            <dialog id="add_member_modal" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box bg-white rounded-t-[30px] sm:rounded-[30px] p-0 max-w-md w-full shadow-2xl overflow-visible">
                    
                    {/* Modal Header */}
                    <div className="bg-[#F8F9FA] p-6 rounded-t-[30px] border-b border-gray-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#105144]/10 flex items-center justify-center text-[#105144]">
                                <FaUserTie className="text-lg" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl text-slate-800">Add Member</h3>
                                <p className="text-xs text-gray-500">Expand your team capacity</p>
                            </div>
                        </div>
                        <form method="dialog">
                            <button className="btn btn-sm btn-circle btn-ghost text-gray-400 hover:bg-gray-200 hover:text-gray-600">
                                <FaTimes />
                            </button>
                        </form>
                    </div>

                    {/* Modal Body (Form) */}
                    <div className="p-6 md:p-8">
                        <form onSubmit={handleSubmitMember(onAddMember)} className="space-y-5">
                            
                            <div className="form-control">
                                <label className="label text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. John Doe" 
                                    className="input input-bordered w-full rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-[#105144] focus:ring-1 focus:ring-[#105144] transition-all" 
                                    {...registerMember("name", { required: true })} 
                                />
                            </div>

                            <div className="form-control">
                                <label className="label text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Role / Title</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Senior Designer" 
                                    className="input input-bordered w-full rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-[#105144] focus:ring-1 focus:ring-[#105144] transition-all" 
                                    {...registerMember("role", { required: true })} 
                                />
                            </div>

                            <div className="form-control">
                                <label className="label text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Task Capacity</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        placeholder="5" 
                                        className="input input-bordered w-full rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-[#105144] focus:ring-1 focus:ring-[#105144] transition-all pr-12" 
                                        {...registerMember("capacity", { required: true })} 
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">TASKS</span>
                                </div>
                                <label className="label">
                                    <span className="label-text-alt text-gray-400">Max tasks this person can handle at once.</span>
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-8">
                                <button 
                                    type="button" 
                                    className="btn bg-white border border-gray-200 text-slate-600 hover:bg-gray-50 hover:border-gray-300 rounded-xl font-bold h-12" 
                                    onClick={() => document.getElementById('add_member_modal').close()}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn bg-[#105144] hover:bg-[#0e463b] text-white border-none rounded-xl shadow-lg shadow-green-900/20 font-bold h-12"
                                >
                                    Add Member
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop bg-slate-900/50 backdrop-blur-sm">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    );
};

export default TeamsPage;