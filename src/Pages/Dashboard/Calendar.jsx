import React, { useState } from 'react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { FaChevronLeft, FaChevronRight, FaPlus, FaClock, FaCheckCircle } from 'react-icons/fa';

const Calendar = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Mock Data: In a real app, you would filter your 'tasks' state by date
    // Generating some dummy tasks for the current month for visual demonstration
    const getDummyTasks = (date) => {
        const day = date.getDate();
        // Just randomly showing tasks on even days or the 5th/20th
        if (day === 5 || day === 20) return [
            { id: 1, title: "Client Meeting", time: "10:00 AM", type: "meeting", color: "bg-orange-100 text-orange-600" },
            { id: 2, title: "Project Review", time: "2:00 PM", type: "work", color: "bg-blue-100 text-blue-600" }
        ];
        if (day % 4 === 0) return [
            { id: 3, title: "Design System Update", time: "11:30 AM", type: "work", color: "bg-green-100 text-[#105144]" }
        ];
        return [];
    };

    const onDateClick = (day) => {
        setSelectedDate(day);
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    // --- RENDER HELPERS ---

    const renderHeader = () => {
        const dateFormat = "MMMM yyyy";

        return (
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Calendar</h2>
                    <p className="text-gray-400 text-sm">Manage your schedule and deadlines.</p>
                </div>
                
                <div className="flex items-center gap-4 bg-white p-1.5 rounded-full shadow-sm border border-gray-100">
                    <button onClick={prevMonth} className="btn btn-circle btn-sm btn-ghost text-gray-500 hover:bg-gray-100">
                        <FaChevronLeft />
                    </button>
                    <span className="text-slate-800 font-bold min-w-[140px] text-center select-none">
                        {format(currentMonth, dateFormat)}
                    </span>
                    <button onClick={nextMonth} className="btn btn-circle btn-sm btn-ghost text-gray-500 hover:bg-gray-100">
                        <FaChevronRight />
                    </button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const dateFormat = "EEE";
        const days = [];
        let startDate = startOfWeek(currentMonth);

        for (let i = 0; i < 7; i++) {
            days.push(
                <div className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider py-4" key={i}>
                    {format(addDays(startDate, i), dateFormat)}
                </div>
            );
        }

        return <div className="grid grid-cols-7 mb-2">{days}</div>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat);
                const cloneDay = day;
                const tasksForDay = getDummyTasks(day);
                
                // Styles
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isToday = isSameDay(day, new Date());

                days.push(
                    <div
                        className={`
                            relative h-24 md:h-32 border border-gray-50 p-2 transition-all cursor-pointer flex flex-col justify-between group
                            ${!isCurrentMonth ? "bg-gray-50/30 text-gray-300" : "bg-white text-slate-700 hover:bg-green-50/30"}
                            ${isSelected ? "ring-2 ring-inset ring-[#105144] z-10 rounded-xl" : "rounded-xl"}
                            ${i === 0 ? 'rounded-l-xl' : ''} ${i === 6 ? 'rounded-r-xl' : ''} 
                        `}
                        key={day}
                        onClick={() => onDateClick(cloneDay)}
                    >
                        <div className="flex justify-between items-start">
                            <span className={`
                                text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
                                ${isToday ? "bg-[#105144] text-white shadow-md" : ""}
                            `}>
                                {formattedDate}
                            </span>
                            
                            {/* Task Dots */}
                            <div className="flex gap-1">
                                {tasksForDay.map((t, idx) => (
                                    <div key={idx} className={`w-2 h-2 rounded-full ${t.type === 'meeting' ? 'bg-orange-400' : 'bg-blue-400'}`}></div>
                                ))}
                            </div>
                        </div>

                        {/* Visual representation of tasks in the cell (Desktop only) */}
                        <div className="hidden md:flex flex-col gap-1 mt-1">
                            {tasksForDay.slice(0, 2).map((task, k) => (
                                <div key={k} className={`text-[10px] px-2 py-1 rounded-md truncate font-medium ${task.color}`}>
                                    {task.title}
                                </div>
                            ))}
                            {tasksForDay.length > 2 && (
                                <span className="text-[10px] text-gray-400 pl-1">+ {tasksForDay.length - 2} more</span>
                            )}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2" key={day}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="bg-white rounded-[30px] p-4 md:p-6 shadow-sm border border-gray-100">{rows}</div>;
    };

    // --- SIDEBAR (Selected Date Details) ---
    const renderSelectedDetails = () => {
        const tasks = getDummyTasks(selectedDate);

        return (
            <div className="bg-white rounded-[30px] p-6 shadow-sm border border-gray-100 h-full">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">
                            {format(selectedDate, "eeee")}
                        </h3>
                        <p className="text-gray-400 text-sm">
                            {format(selectedDate, "MMMM do, yyyy")}
                        </p>
                    </div>
                    <button className="btn btn-sm btn-circle bg-[#105144] text-white border-none hover:bg-[#0e463b]">
                        <FaPlus />
                    </button>
                </div>

                <div className="space-y-4">
                    {tasks.length > 0 ? (
                        tasks.map((task) => (
                            <div key={task.id} className="group flex gap-4 items-start p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                <div className="flex flex-col items-center gap-1 mt-1">
                                    <div className={`w-3 h-3 rounded-full ${task.type === 'meeting' ? 'bg-orange-400' : task.type === 'work' ? 'bg-blue-400' : 'bg-[#105144]'}`}></div>
                                    <div className="w-0.5 h-full bg-gray-100 group-last:hidden"></div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800 text-sm">{task.title}</h4>
                                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                        <FaClock className="text-[10px]" />
                                        <span>{task.time}</span>
                                    </div>
                                </div>
                                <input type="checkbox" className="checkbox checkbox-xs checkbox-success rounded-md" />
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                <FaCheckCircle className="text-gray-200 text-2xl" />
                            </div>
                            <p className="text-slate-800 font-bold text-sm">No tasks for today</p>
                            <p className="text-gray-400 text-xs mt-1">Enjoy your free time!</p>
                        </div>
                    )}
                </div>
                
                {/* Mini Stats */}
                {tasks.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-50">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Completion</span>
                            <span className="font-bold text-[#105144]">0%</span>
                        </div>
                        <progress className="progress progress-success w-full mt-2 h-2 bg-gray-100" value="0" max="100"></progress>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="font-sans space-y-6">
            {renderHeader()}
            
            <div className="flex flex-col xl:flex-row gap-8">
                {/* Main Calendar Grid */}
                <div className="flex-1">
                    <div className="bg-white rounded-[30px] p-4 md:p-6 shadow-sm border border-gray-100">
                        {renderDays()}
                        {renderCells()}
                    </div>
                </div>

                {/* Sidebar Details (Stacks on mobile, Side on XL) */}
                <div className="w-full xl:w-96 shrink-0">
                    {renderSelectedDetails()}
                </div>
            </div>
        </div>
    );
};

export default Calendar;