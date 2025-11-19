import React, { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";
import useAxiosPublic from "../Hooks/UseAxiosPublic";
import { AuthContext } from "../Provider/AuthProvider";
// Added FaEye and FaEyeSlash
import { FaUser, FaEnvelope, FaLock, FaCheckCircle, FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
  const axiosPublic = useAxiosPublic();
  const { createUser, updateUserProfile } = useContext(AuthContext);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (data) => {
    setIsLoading(true);

    // 1. Create User in Firebase
    createUser(data.email, data.password)
      .then((result) => {
        const loggedUser = result.user;
        
        // 2. Update Profile Name in Firebase
        updateUserProfile(data.name, data.photoURL) 
          .then(() => {
            
            // 3. Save User to MongoDB (Backend)
            const userInfo = {
              name: data.name,
              email: data.email
            };

            axiosPublic.post('/api/users', userInfo)
              .then(res => {
                if (res.data.insertedId || res.data.message === "User exists") {
                  reset();
                  Swal.fire({
                    title: "Account Created!",
                    text: "Welcome to PlanCraft.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false,
                    confirmButtonColor: '#105144'
                  });
                  navigate("/");
                }
              });
          })
          .catch((error) => console.log(error));
      })
      .catch((error) => {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: error.message,
          confirmButtonColor: '#105144'
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8F9FA] font-sans">
      
      {/* LEFT SIDE - FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 lg:p-12 bg-white min-h-screen lg:min-h-auto">
        <div className="w-full max-w-md space-y-6">
          
          {/* Logo */}
          <div className="flex items-center gap-3 text-[#105144] font-bold text-2xl mb-6 lg:mb-8">
            <div className="w-10 h-10 rounded-xl border-2 border-[#105144] flex items-center justify-center">
                <div className="w-3 h-3 bg-[#105144] rounded-full"></div>
            </div>
            PlanCraft
          </div>

          {/* Headers */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Create an account</h1>
            <p className="text-gray-400 mt-2 text-sm md:text-base">Start managing your projects in seconds.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Name Input */}
            <div className="form-control space-y-1">
              <label className="label text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaUser className="text-gray-300" />
                </div>
                <input 
                  type="text" 
                  {...register("name", { required: true })} 
                  // Added text-slate-900 for black text
                  className="input input-bordered w-full pl-11 rounded-xl bg-gray-50 border-gray-200 text-slate-900 focus:bg-white focus:border-[#105144] focus:ring-1 focus:ring-[#105144] transition-all h-12 placeholder:text-gray-400" 
                  placeholder="e.g. John Doe" 
                />
              </div>
              {errors.name && <span className="text-red-500 text-xs mt-1">Name is required</span>}
            </div>

            {/* Email Input */}
            <div className="form-control space-y-1">
              <label className="label text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-300" />
                </div>
                <input 
                  type="email" 
                  {...register("email", { required: true })} 
                  // Added text-slate-900 for black text
                  className="input input-bordered w-full pl-11 rounded-xl bg-gray-50 border-gray-200 text-slate-900 focus:bg-white focus:border-[#105144] focus:ring-1 focus:ring-[#105144] transition-all h-12 placeholder:text-gray-400" 
                  placeholder="john@example.com" 
                />
              </div>
              {errors.email && <span className="text-red-500 text-xs mt-1">Email is required</span>}
            </div>

            {/* Password Input with Eye Icon */}
            <div className="form-control space-y-1">
              <label className="label text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                {/* Lock Icon (Left) */}
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-gray-300" />
                </div>
                
                {/* Input */}
                <input 
                  type={showPassword ? "text" : "password"} 
                  {...register("password", { required: true, minLength: 6 })} 
                  // Added text-slate-900 and pr-12 for eye icon
                  className="input input-bordered w-full pl-11 pr-12 rounded-xl bg-gray-50 border-gray-200 text-slate-900 focus:bg-white focus:border-[#105144] focus:ring-1 focus:ring-[#105144] transition-all h-12 placeholder:text-gray-400" 
                  placeholder="Create a password" 
                />

                {/* Eye Toggle Button (Right) */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#105144] cursor-pointer focus:outline-none"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <span className="text-red-500 text-xs mt-1">Password must be 6+ chars</span>}
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isLoading} 
                className="btn bg-[#105144] hover:bg-[#0e463b] text-white border-none w-full rounded-xl h-12 text-base shadow-lg shadow-green-900/20 transition-all hover:-translate-y-1"
              >
                {isLoading ? <span className="loading loading-spinner"></span> : "Create Account"}
              </button>
            </div>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-500 mt-8">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-[#105144] hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE - VISUALS (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-[#105144] relative flex-col justify-center items-center p-20 text-white overflow-hidden">
        
        {/* Background Blur Effects */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-green-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-900/40 rounded-full blur-3xl"></div>

        <div className="relative z-10 text-center max-w-lg">
             <h2 className="text-4xl font-bold mb-6">Join 10,000+ users managing tasks efficiently.</h2>
             <div className="grid grid-cols-1 gap-4 text-left mt-10">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                    <div className="bg-green-400 p-2 rounded-full text-[#105144]">
                        <FaCheckCircle />
                    </div>
                    <div>
                        <h4 className="font-bold">Team Collaboration</h4>
                        <p className="text-xs text-green-100 opacity-80">Assign tasks and balance workload.</p>
                    </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-4 translate-x-4">
                    <div className="bg-blue-400 p-2 rounded-full text-blue-900">
                        <FaCheckCircle />
                    </div>
                    <div>
                        <h4 className="font-bold">Project Analytics</h4>
                        <p className="text-xs text-green-100 opacity-80">Track progress with real-time charts.</p>
                    </div>
                </div>
             </div>
        </div>

        <div className="absolute bottom-8 text-xs text-green-200/40">
            PlanCraft - Task Management Solution
        </div>
      </div>

    </div>
  );
};

export default Register;