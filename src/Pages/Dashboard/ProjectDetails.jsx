import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import useAxiosPublic from '../../Hooks/UseAxiosPublic';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { AuthContext } from '../../Provider/AuthProvider';
import { FaPlus, FaTrash, FaBolt, FaEllipsisH, FaTimes, FaTasks, FaLayerGroup } from 'react-icons/fa';

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

    // --- Helper: Get Current Load for a member ---
    const getMemberLoad = (memberName) => {
        return tasks.filter(t => t.assignedTo === memberName && t.status !== 'Done').length;
    };

    // --- Capacity Warning Logic ---
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

    // --- Auto-Assign Logic ---
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

    // --- Delete Task ---
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
            // This Modal appears ON TOP of the form modal
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
            
            {/* HEADER - Responsive Layout */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                         <div className="w-10 h-10 rounded-xl bg-green-50 text-[#105144] flex items-center justify-center">
                             <FaLayerGroup />
                         </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{project.title}</h2>
                    </div>
                    <div className="flex items-center gap-2 ml-1">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Assigned Team:</span>
                        <span className="bg-[#105144]/10 text-[#105144] px-3 py-1 rounded-lg text-xs font-bold">
                            {project.team.name}
                        </span>
                    </div>
                </div>
                <button 
                    onClick={() => document.getElementById('add_task_modal').showModal()} 
                    className="btn bg-[#105144] hover:bg-[#0e463b] text-white border-none rounded-xl px-6 shadow-lg shadow-green-900/20 flex items-center gap-2 w-full sm:w-auto"
                >
                    <FaPlus /> Add Task
                </button>
            </div>

            {/* KANBAN BOARD - Responsive Grid */}
            {/* Mobile: 1 col, Desktop: 3 cols */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full items-start">
                    {columns.map(status => (
                        <StrictModeDroppable key={status} droppableId={status}>
                            {(provided, snapshot) => (
                                <div 
                                    ref={provided.innerRef} 
                                    {...provided.droppableProps} 
                                    className={`rounded-[24px] p-4 h-full min-h-[250px] transition-colors duration-200 
                                        ${snapshot.isDraggingOver ? 'bg-green-50/50 border-2 border-dashed border-[#105144]/30' : 'bg-gray-50 border border-transparent'}`}
                                >
                                    {/* Column Header */}
                                    <div className="flex justify-between items-center mb-4 px-2">
                                        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${status === 'Pending' ? 'bg-orange-400' : status === 'In Progress' ? 'bg-blue-400' : 'bg-green-400'}`}></span>
                                            {status}
                                        </h3>
                                        <span className="bg-white text-gray-400 text-xs font-bold px-2 py-1 rounded-lg shadow-sm border border-gray-100">
                                            {tasks.filter(t => t.status === status).length}
                                        </span>
                                    </div>

                                    {/* Tasks List */}
                                    <div className="space-y-3">
                                        {tasks
                                            .filter(t => t.status === status)
                                            .map((task, index) => (
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
                                                            
                                                            {/* DELETE BUTTON (Visible on hover or drag) */}
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
                                                                <div className="avatar placeholder">
                                                                    <div className={`text-white rounded-full w-6 flex items-center justify-center text-[10px] font-bold ${task.assignedTo === 'Unassigned' ? 'bg-gray-300' : 'bg-[#105144]'}`}>
                                                                        <span>{task.assignedTo === 'Unassigned' ? '?' : task.assignedTo?.charAt(0)}</span>
                                                                    </div>
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
                    ))}
                </div>
            </DragDropContext>
            
            {/* 
                ------------------------------------------
                MODAL DESIGN (Responsive Bottom Sheet)
                ------------------------------------------
            */}
            <dialog id="add_task_modal" className="modal modal-bottom sm:modal-middle">
                 <div className="modal-box bg-white rounded-t-[30px] sm:rounded-[30px] p-0 max-w-lg w-full shadow-2xl overflow-visible">
                    
                    {/* Modal Header */}
                    <div className="bg-[#F8F9FA] p-6 rounded-t-[30px] border-b border-gray-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#105144]/10 flex items-center justify-center text-[#105144]">
                                <FaTasks className="text-lg" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl text-slate-800">New Task</h3>
                                <p className="text-xs text-gray-500">Add work to {project.title}</p>
                            </div>
                        </div>
                        <form method="dialog">
                            <button className="btn btn-sm btn-circle btn-ghost text-gray-400 hover:bg-gray-200 hover:text-gray-600">
                                <FaTimes />
                            </button>
                        </form>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6 md:p-8">
                        <form onSubmit={handleSubmit(onCreateTask)} noValidate className="space-y-5">
                            
                            <div className="form-control">
                                <label className="label text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Task Title</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Fix navigation bug" 
                                    className="input input-bordered w-full rounded-xl bg-gray-50 border-gray-200 text-slate-900 focus:bg-white focus:border-[#105144] focus:ring-1 focus:ring-[#105144] transition-all" 
                                    {...register("title", { required: true })} 
                                />
                            </div>

                            <div className="form-control">
                                <label className="label text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Description</label>
                                <textarea 
                                    placeholder="Add details here..." 
                                    className="textarea textarea-bordered w-full rounded-xl bg-gray-50 border-gray-200 text-slate-900 focus:bg-white focus:border-[#105144] focus:ring-1 focus:ring-[#105144] transition-all h-24" 
                                    {...register("description")}
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Priority</label>
                                    <select className="select select-bordered w-full rounded-xl bg-gray-50 border-gray-200 text-slate-900 focus:bg-white focus:border-[#105144] focus:ring-1 focus:ring-[#105144]" {...register("priority")}>
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                    </select>
                                </div>
                                
                                <div className="form-control">
                                    <label className="label text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Assign To</label>
                                    <select className="select select-bordered w-full rounded-xl bg-gray-50 border-gray-200 text-slate-900 focus:bg-white focus:border-[#105144] focus:ring-1 focus:ring-[#105144]" {...register("assignedTo", { required: true })}>
                                        <option value="Unassigned">Unassigned</option>
                                        {project.team.members.map((m, idx) => (
                                            <option key={idx} value={m.name}>
                                                {m.name} ({getMemberLoad(m.name)}/{m.capacity})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Auto Pick Button */}
                            <div className="flex justify-end pt-2">
                                 <button type="button" onClick={handleAutoAssign} className="btn btn-xs btn-ghost text-[#105144] hover:bg-green-50 gap-2">
                                    <FaBolt /> Auto-pick best member
                                </button>
                            </div>

                            {/* Inline Warning (Visual only, functionality handled by Swal) */}
                            {capacityWarning && (
                                <div className="alert p-3 bg-orange-50 border border-orange-100 text-orange-700 text-xs rounded-xl flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-4 w-4 mt-0.5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    <span>{capacityWarning} <br/><span className="font-bold opacity-70">Confirming will show alert.</span></span>
                                </div>
                            )}
                            
                            <button type="submit" className="btn bg-[#105144] hover:bg-[#0e463b] text-white w-full rounded-xl shadow-lg shadow-green-900/20 mt-2 h-12 text-base">
                                Create Task
                            </button>
                        </form>
                    </div>
                </div>
                {/* Backdrop for closing */}
                <form method="dialog" className="modal-backdrop bg-slate-900/50 backdrop-blur-sm">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    );
};

export default ProjectDetails;