import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import useAxiosPublic from '../../Hooks/UseAxiosPublic';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { AuthContext } from '../../Provider/AuthProvider';
import { FaPlus, FaTrash, FaBolt, FaTimes, FaLayerGroup, FaFilter } from 'react-icons/fa';

// StrictMode Droppable Helper
export const StrictModeDroppable = ({ children, ...props }) => {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);
  if (!enabled) return null;
  return <Droppable {...props}>{children}</Droppable>;
};

const ProjectDetails = () => {
    const { id } = useParams(); 
    const axiosPublic = useAxiosPublic();
    const { user } = useContext(AuthContext);
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // --- NEW: Filter State ---
    const [filterMember, setFilterMember] = useState('All');
    const [filterProject, setFilterProject] = useState('All');

    const [capacityWarning, setCapacityWarning] = useState(null);
    const { register, handleSubmit, reset, watch, setValue } = useForm(); 
    const assignedToValue = watch("assignedTo");

    const fetchData = useCallback(async () => {
        try {
            const [projRes, tasksRes] = await Promise.all([
                axiosPublic.get(`/api/projects/${id}`),
                axiosPublic.get(`/api/tasks/project/${id}`)
            ]);
            setProject(projRes.data);
            setTasks(tasksRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Fetch Error:", error);
            setLoading(false);
        }
    }, [axiosPublic, id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getMemberLoad = (memberName) => {
        return tasks.filter(t => t.assignedTo === memberName && t.status !== 'Done').length;
    };

    useEffect(() => {
        if (assignedToValue && project?.team?.members) {
            if (assignedToValue === "Unassigned") {
                setCapacityWarning(null);
                return;
            }
            const currentTaskCount = getMemberLoad(assignedToValue);
            const member = project.team.members.find(m => m.name === assignedToValue);
            
            if (member && currentTaskCount >= member.capacity) {
                setCapacityWarning(`${member.name} is at capacity (${currentTaskCount}/${member.capacity}).`);
            } else {
                setCapacityWarning(null);
            }
        }
    }, [assignedToValue, tasks, project]);

    const handleAutoAssign = () => {
        if (!project?.team?.members) return;
        
        const sortedMembers = [...project.team.members].sort((a, b) => {
            const loadA = getMemberLoad(a.name);
            const loadB = getMemberLoad(b.name);
            return loadA - loadB; 
        });

        if (sortedMembers.length > 0) {
            setValue("assignedTo", sortedMembers[0].name);
            Swal.fire({
                icon: 'info',
                title: 'Auto-Selected',
                text: `Selected ${sortedMembers[0].name} (Load: ${getMemberLoad(sortedMembers[0].name)})`,
                timer: 1500,
                confirmButtonColor: '#105144'
            });
        }
    };

    const handleDeleteTask = (taskId) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#105144',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                axiosPublic.delete(`/api/tasks/${taskId}`)
                    .then(() => {
                        setTasks(prev => prev.filter(t => t._id !== taskId));
                        Swal.fire({
                            title: 'Deleted!', 
                            text: 'Your task has been deleted.', 
                            icon: 'success',
                            confirmButtonColor: '#105144'
                        });
                    })
                    .catch(() => Swal.fire('Error', 'Failed to delete', 'error'));
            }
        });
    };

    const onCreateTask = (data) => {
        if (capacityWarning) {
            Swal.fire({
                title: '⚠️ Over Capacity', 
                text: `${capacityWarning} Assign anyway?`,
                icon: 'warning', 
                showCancelButton: true, 
                confirmButtonColor: '#d33',
                cancelButtonColor: '#105144',
                confirmButtonText: 'Yes, force assign'
            }).then((result) => {
                if (result.isConfirmed) submitTask(data);
            });
        } else {
            submitTask(data);
        }
    };

    const submitTask = (data) => {
        const newTask = { ...data, projectId: id, email: user.email };
        axiosPublic.post('/api/tasks', newTask)
            .then(async (res) => {
                if (res.status === 201) {
                    Swal.fire({ icon: 'success', title: 'Task Added', timer: 1000, showConfirmButton: false });
                    reset();
                    setCapacityWarning(null);
                    document.getElementById('add_task_modal').close();
                    try { await fetchData(); } catch (e) {}
                }
            })
            .catch(() => Swal.fire('Error', 'Failed to add task', 'error'));
    };

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const newStatus = destination.droppableId;
        const updatedTasks = tasks.map(t => String(t._id) === String(draggableId) ? { ...t, status: newStatus } : t);
        setTasks(updatedTasks);

        axiosPublic.put(`/api/tasks/${draggableId}`, { status: newStatus })
            .catch(() => fetchData());
    };

    if (loading) return <div className="text-center mt-20"><span className="loading loading-spinner text-[#105144] loading-lg"></span></div>;
    if (!project) return <div className="text-center mt-20 text-gray-500">Project not found</div>;

    const columns = ['Pending', 'In Progress', 'Done'];

    return (
        <div className="h-full flex flex-col font-sans">
            
            {/* HEADER */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                         <div className="w-10 h-10 rounded-xl bg-green-50 text-[#105144] flex items-center justify-center">
                             <FaLayerGroup />
                         </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{project.title}</h2>
                    </div>
                    <div className="flex items-center gap-2 ml-1">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Team:</span>
                        <span className="bg-[#105144]/10 text-[#105144] px-3 py-1 rounded-lg text-xs font-bold">
                            {project.team.name}
                        </span>
                    </div>
                </div>

                {/* ACTION AREA: FILTER + ADD BUTTON */}
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    
                    {/* --- FILTER BY PROJECT --- */}
                    <div className="relative">
                        <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                        <select
                            className="select select-bordered rounded-xl pl-8 text-xs font-bold text-slate-600 bg-white border-gray-200 focus:ring-1 focus:ring-[#105144] w-full sm:w-48 h-12"
                            value={filterProject}
                            onChange={(e) => setFilterProject(e.target.value)}
                        >
                            <option value="All">All Projects</option>
                            <option value={project.title}>{project.title}</option>
                        </select>
                    </div>

                    {/* --- FILTER BY MEMBER --- */}
                    <div className="relative">
                        <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                        <select 
                            className="select select-bordered rounded-xl pl-8 text-xs font-bold text-slate-600 bg-white border-gray-200 focus:ring-1 focus:ring-[#105144] w-full sm:w-48 h-12"
                            value={filterMember}
                            onChange={(e) => setFilterMember(e.target.value)}
                        >
                            <option value="All">All Members</option>
                            <option value="Unassigned">Unassigned</option>
                            {project.team.members.map((m, idx) => (
                                <option key={idx} value={m.name}>{m.name}</option>
                            ))}
                        </select>
                    </div>

                    <button 
                        onClick={() => document.getElementById('add_task_modal').showModal()} 
                        className="btn bg-[#105144] hover:bg-[#0e463b] text-white border-none rounded-xl px-6 shadow-lg shadow-green-900/20 flex items-center gap-2 w-full sm:w-auto h-12"
                    >
                        <FaPlus /> Add Task
                    </button>
                </div>
            </div>

            {/* KANBAN BOARD */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full items-start">
                    {columns.map(status => {
                        
                        // --- FILTER LOGIC (Project + Member) ---
                        const filteredTasks = tasks
                            .filter(t => t.status === status)
                            .filter(t => filterMember === 'All' || t.assignedTo === filterMember)
                            .filter(t => filterProject === 'All' || t.projectId === id);

                        return (
                            <StrictModeDroppable key={status} droppableId={status}>
                                {(provided, snapshot) => (
                                    <div 
                                        ref={provided.innerRef} 
                                        {...provided.droppableProps} 
                                        className={`rounded-[24px] p-4 h-full min-h-[250px] transition-colors duration-200 
                                            ${snapshot.isDraggingOver ? 'bg-green-50/50 border-2 border-dashed border-[#105144]/30' : 'bg-gray-50 border border-transparent'}`}
                                    >
                                        <div className="flex justify-between items-center mb-4 px-2">
                                            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${status === 'Pending' ? 'bg-orange-400' : status === 'In Progress' ? 'bg-blue-400' : 'bg-green-400'}`}></span>
                                                {status}
                                            </h3>
                                            <span className="bg-white text-gray-400 text-xs font-bold px-2 py-1 rounded-lg shadow-sm border border-gray-100">
                                                {filteredTasks.length}
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            {filteredTasks.map((task, index) => (
                                                <Draggable key={String(task._id)} draggableId={String(task._id)} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div 
                                                            ref={provided.innerRef} 
                                                            {...provided.draggableProps} 
                                                            {...provided.dragHandleProps} 
                                                            style={{ ...provided.draggableProps.style, opacity: snapshot.isDragging ? 0.9 : 1 }} 
                                                            className={`bg-white rounded-2xl p-4 border shadow-sm group relative transition-all duration-200 hover:shadow-md hover:-translate-y-1
                                                                ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-[#105144] rotate-2 z-50' : 'border-gray-100'}`}
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <span className={`badge badge-xs border-none px-2 py-1 font-bold text-[10px] rounded-md uppercase
                                                                    ${task.priority === 'High' ? 'bg-red-50 text-red-500' : 
                                                                      task.priority === 'Medium' ? 'bg-orange-50 text-orange-500' : 
                                                                      'bg-blue-50 text-blue-500'}`}>
                                                                    {task.priority}
                                                                </span>
                                                                
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteTask(task._id);
                                                                    }}
                                                                    className="text-gray-300 hover:text-red-500 transition-colors p-1 lg:opacity-0 lg:group-hover:opacity-100"
                                                                >
                                                                    <FaTrash size={12} />
                                                                </button>
                                                            </div>

                                                            <h4 className="font-bold text-slate-800 mb-2 line-clamp-2 text-sm">{task.title}</h4>
                                                            
                                                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`text-white rounded-full w-6 flex items-center justify-center text-[10px] font-bold ${task.assignedTo === 'Unassigned' ? 'bg-gray-300' : 'bg-[#105144]'}`}>
                                                                        <span>{task.assignedTo === 'Unassigned' ? '?' : task.assignedTo?.charAt(0)}</span>
                                                                    </div>
                                                                    <span className="text-xs text-gray-500 font-medium truncate max-w-[100px]">
                                                                        {task.assignedTo === 'Unassigned' ? 'Unassigned' : task.assignedTo}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    </div>
                                )}
                            </StrictModeDroppable>
                        )
                    })}
                </div>
            </DragDropContext>
            
            {/* MODAL (Unchanged Style) */}
            <dialog id="add_task_modal" className="modal modal-bottom sm:modal-middle">
                 <div className="modal-box bg-white rounded-t-[30px] sm:rounded-[30px] p-0 max-w-lg w-full shadow-2xl overflow-visible">
                    <div className="bg-[#F8F9FA] p-6 rounded-t-[30px] border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-xl text-slate-800">New Task</h3>
                        <form method="dialog">
                            <button className="btn btn-sm btn-circle btn-ghost text-gray-400 hover:bg-gray-200 hover:text-gray-600"><FaTimes /></button>
                        </form>
                    </div>
                    <div className="p-6 md:p-8">
                        <form onSubmit={handleSubmit(onCreateTask)} noValidate className="space-y-5">
                            <div className="form-control">
                                <label className="label text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Task Title</label>
                                <input type="text" className="input input-bordered w-full rounded-xl bg-gray-50 border-gray-200 text-slate-900 focus:bg-white focus:border-[#105144] focus:ring-1 focus:ring-[#105144]" {...register("title", { required: true })} />
                            </div>
                            <div className="form-control">
                                <label className="label text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Description</label>
                                <textarea className="textarea textarea-bordered w-full rounded-xl bg-gray-50 border-gray-200 text-slate-900 focus:bg-white focus:border-[#105144] focus:ring-1 focus:ring-[#105144] h-24" {...register("description")}></textarea>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Priority</label>
                                    <select className="select select-bordered w-full rounded-xl bg-gray-50 border-gray-200 text-slate-900 focus:bg-white focus:border-[#105144] focus:ring-1 focus:ring-[#105144]" {...register("priority")}>
                                        <option>Low</option><option>Medium</option><option>High</option>
                                    </select>
                                </div>
                                <div className="form-control">
                                    <label className="label text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Assign To</label>
                                    <select className="select select-bordered w-full rounded-xl bg-gray-50 border-gray-200 text-slate-900 focus:bg-white focus:border-[#105144] focus:ring-1 focus:ring-[#105144]" {...register("assignedTo", { required: true })}>
                                        <option value="Unassigned">Unassigned</option>
                                        {project.team.members.map((m, idx) => <option key={idx} value={m.name}>{m.name} ({getMemberLoad(m.name)}/{m.capacity})</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                 <button type="button" onClick={handleAutoAssign} className="btn btn-xs btn-ghost text-[#105144] hover:bg-green-50 gap-2"><FaBolt /> Auto-pick best member</button>
                            </div>
                            {capacityWarning && <div className="alert p-3 bg-orange-50 border border-orange-100 text-orange-700 text-xs rounded-xl"><span>{capacityWarning}</span></div>}
                            <button type="submit" className="btn bg-[#105144] hover:bg-[#0e463b] text-white w-full rounded-xl shadow-lg shadow-green-900/20 mt-2 h-12 text-base">Create Task</button>
                        </form>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop bg-slate-900/50 backdrop-blur-sm"><button>close</button></form>
            </dialog>
        </div>
    );
};

export default ProjectDetails;
