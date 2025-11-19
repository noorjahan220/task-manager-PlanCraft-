import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import useAxiosPublic from '../../Hooks/UseAxiosPublic';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../Provider/AuthProvider';
import { FaPlus, FaFolder, FaUsers, FaArrowRight, FaTimes } from 'react-icons/fa';

const ProjectsPage = () => {
    const axiosPublic = useAxiosPublic();
    const { user } = useContext(AuthContext);
    const [projects, setProjects] = useState([]);
    const [teams, setTeams] = useState([]); 
    const [loading, setLoading] = useState(true);

    const { register, handleSubmit, reset } = useForm();

    const fetchData = useCallback(async () => {
        if (!user?.email) return; 

        setLoading(true);
        try {
            const [teamsRes, projectsRes] = await Promise.all([
                axiosPublic.get(`/api/teams?email=${user.email}`),
                axiosPublic.get(`/api/projects?email=${user.email}`)
            ]);
            setTeams(teamsRes.data);
            setProjects(projectsRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, [axiosPublic, user?.email]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onCreateProject = (data) => {
        const projectData = { ...data, email: user.email };

        axiosPublic.post('/api/projects', projectData)
            .then(res => {
                if (res.status === 201) {
                    Swal.fire({ icon: 'success', title: 'Project Created', timer: 1500, showConfirmButton: false });
                    reset();
                    fetchData();
                    document.getElementById('create_project_modal').close();
                }
            })
            .catch(err => {
                console.error(err);
                Swal.fire({ icon: 'error', title: 'Creation Failed', text: 'Please try again.' });
            }); 
    };

    if (!user) return <div className="p-10 text-center text-[#105144]">Loading...</div>;

    return (
        <div className="space-y-8 font-sans">
            
            {/* PAGE HEADER - Responsive */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="w-full md:w-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">Projects</h2>
                    <p className="text-gray-400 text-sm">Manage your projects and assign them to teams.</p>
                </div>
                <button 
                    onClick={() => document.getElementById('create_project_modal').showModal()} 
                    className="btn bg-[#105144] hover:bg-[#0e463b] text-white border-none rounded-full px-6 shadow-lg shadow-green-900/20 flex items-center gap-2 w-full md:w-auto"
                >
                    <FaPlus /> New Project
                </button>
            </div>

            {/* GRID CONTENT */}
            {loading ? (
                <div className="text-center mt-20"><span className="loading loading-spinner text-[#105144] loading-lg"></span></div>
            ) : projects.length === 0 ? (
                <div className="text-center py-20 bg-white border border-gray-100 rounded-[30px] shadow-sm text-gray-400 flex flex-col items-center max-w-2xl mx-auto">
                    <div className="bg-gray-50 p-6 rounded-full mb-4">
                        <FaFolder className="text-4xl opacity-20 text-slate-900" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">No projects yet</h3>
                    <p className="text-sm">Create your first project above to get started!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div key={project._id} className="group bg-white rounded-[30px] p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                            
                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-green-50 text-[#105144] flex items-center justify-center">
                                    <FaFolder className="text-xl" />
                                </div>
                                <div className="dropdown dropdown-end">
                                    <div tabIndex={0} role="button" className="btn btn-circle btn-ghost btn-xs text-gray-400 hover:bg-gray-100">●●●</div>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1">{project.title}</h3>
                                <p className="text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">{project.description}</p>
                                
                                <div className="flex items-center gap-2 text-xs font-medium">
                                    <FaUsers className="text-gray-400" />
                                    <span className="text-gray-500">Team:</span>
                                    {project.team ? (
                                        <span className="bg-gray-100 text-slate-600 px-2 py-1 rounded-lg border border-gray-200">
                                            {project.team.name}
                                        </span>
                                    ) : (
                                        <span className="bg-orange-50 text-orange-500 px-2 py-1 rounded-lg">No Team</span>
                                    )}
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
                                <span className="text-xs text-gray-300 font-bold uppercase tracking-wider">Active</span>
                                <Link 
                                    to={`/dashboard/projects/${project._id}`} 
                                    className="btn btn-sm bg-white hover:bg-[#105144] hover:text-white text-[#105144] border border-gray-200 rounded-full px-4 transition-colors flex items-center gap-2 group-hover:border-[#105144]"
                                >
                                    View Board <FaArrowRight className="text-xs" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 
                ------------------------------------------
                MODAL DESIGN (Responsive Bottom Sheet)
                ------------------------------------------
            */}
            <dialog id="create_project_modal" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box bg-white rounded-t-[30px] sm:rounded-[30px] p-0 max-w-lg w-full shadow-2xl overflow-visible">
                    
                    {/* Modal Header */}
                    <div className="bg-[#F8F9FA] p-6 rounded-t-[30px] border-b border-gray-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#105144]/10 flex items-center justify-center text-[#105144]">
                                <FaFolder className="text-lg" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl text-slate-800">New Project</h3>
                                <p className="text-xs text-gray-500">Create a new workspace</p>
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
                        <form onSubmit={handleSubmit(onCreateProject)} className="space-y-5">
                            
                            {/* Title Input */}
                            <div className="form-control">
                                <label className="label text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Project Title</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Website Redesign"
                                    // text-slate-900 makes input text black
                                    className="input input-bordered w-full rounded-xl bg-gray-50 border-gray-200 text-slate-900 focus:bg-white focus:border-[#105144] focus:ring-1 focus:ring-[#105144] transition-all" 
                                    {...register("title", { required: true })} 
                                />
                            </div>
                            
                            {/* Description Input */}
                            <div className="form-control">
                                <label className="label text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Description</label>
                                <textarea 
                                    placeholder="Project details..."
                                    // text-slate-900 makes input text black
                                    className="textarea textarea-bordered w-full rounded-xl bg-gray-50 border-gray-200 text-slate-900 focus:bg-white focus:border-[#105144] focus:ring-1 focus:ring-[#105144] transition-all h-24" 
                                    {...register("description")} 
                                />
                            </div>
                            
                            {/* Team Select */}
                            <div className="form-control">
                                <label className="label text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Assign Team</label>
                                <select 
                                    // text-slate-900 makes input text black
                                    className="select select-bordered w-full rounded-xl bg-gray-50 border-gray-200 text-slate-900 focus:bg-white focus:border-[#105144] focus:ring-1 focus:ring-[#105144] transition-all" 
                                    {...register("teamId", { required: true })}
                                >
                                    <option value="">Select a Team</option>
                                    {teams.length > 0 ? (
                                        teams.map(team => (
                                            <option key={team._id} value={team._id}>{team.name}</option>
                                        ))
                                    ) : (
                                        <option disabled>No teams available</option>
                                    )}
                                </select>
                            </div>
                            
                            {/* Submit Button */}
                            <button className="btn bg-[#105144] hover:bg-[#0e463b] text-white w-full rounded-xl shadow-lg shadow-green-900/20 mt-4 h-12 text-base">
                                Create Project
                            </button>
                        </form>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop bg-slate-900/50 backdrop-blur-sm"><button>close</button></form>
            </dialog>
        </div>
    );
};

export default ProjectsPage;