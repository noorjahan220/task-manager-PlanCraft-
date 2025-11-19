import { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { AuthContext } from "../Provider/AuthProvider";
// Added FaEye and FaEyeSlash for password visibility
import { FaEnvelope, FaLock, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const { signIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [isLoading, setIsLoading] = useState(false);
  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    setIsLoading(true);

    signIn(data.email, data.password)
      .then((result) => {
        Swal.fire({
          title: "Welcome Back!",
          text: `Login successful!`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          confirmButtonColor: '#105144'
        });
        navigate(from, { replace: true });
      })
      .catch((error) => {
        console.error("Login failed:", error);
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "Invalid email or password.",
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
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 lg:p-20 bg-white min-h-screen lg:min-h-auto">
        <div className="w-full max-w-md space-y-8">
          
          {/* Logo */}
          <div className="flex items-center gap-3 text-[#105144] font-bold text-2xl mb-6 lg:mb-10">
            <div className="w-10 h-10 rounded-xl border-2 border-[#105144] flex items-center justify-center">
                <div className="w-3 h-3 bg-[#105144] rounded-full"></div>
            </div>
            PlanCraft
          </div>

          {/* Headers */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Welcome back!</h1>
            <p className="text-gray-400 mt-2 text-sm md:text-base">Please enter your details to access your dashboard.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            <div className="form-control space-y-1">
              <label className="label text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-300" />
                </div>
                <input 
                  type="email" 
                  {...register("email", { required: true })} 
                  // Added text-slate-900 (Black color)
                  className="input input-bordered w-full pl-11 rounded-xl bg-gray-50 border-gray-200 text-slate-900 focus:bg-white focus:border-[#105144] focus:ring-1 focus:ring-[#105144] transition-all h-12 placeholder:text-gray-400" 
                  placeholder="Enter your email" 
                />
              </div>
              {errors.email && <span className="text-red-500 text-xs mt-1">Email is required</span>}
            </div>

            <div className="form-control space-y-1">
              <label className="label flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-gray-300" />
                </div>
                
                <input 
                  type={showPassword ? "text" : "password"} 
                  {...register("password", { required: true })} 
                  // Added text-slate-900 (Black color) and pr-12 for the eye icon
                  className="input input-bordered w-full pl-11 pr-12 rounded-xl bg-gray-50 border-gray-200 text-slate-900 focus:bg-white focus:border-[#105144] focus:ring-1 focus:ring-[#105144] transition-all h-12 placeholder:text-gray-400" 
                  placeholder="••••••••" 
                />

                {/* Toggle Password Visibility Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#105144] cursor-pointer focus:outline-none"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <span className="text-red-500 text-xs mt-1">Password is required</span>}
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isLoading} 
                className="btn bg-[#105144] hover:bg-[#0e463b] text-white border-none w-full rounded-xl h-12 text-base shadow-lg shadow-green-900/20 transition-all hover:-translate-y-1"
              >
                {isLoading ? <span className="loading loading-spinner"></span> : "Sign In"}
              </button>
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-500 mt-8">
              Don't have an account?{" "}
              <Link to="/register" className="font-bold text-[#105144] hover:underline">
                Sign up for free
              </Link>
            </p>
          </form>
        </div>
      </div>

      
      <div className="hidden lg:flex w-1/2 bg-[#105144] relative flex-col justify-between p-20 text-white overflow-hidden">
        
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

        <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium border border-white/10 mb-6">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                Waitlist v2.0 is now open
            </div>
            <h2 className="text-5xl font-bold leading-tight mb-6">Manage your tasks <br/> like a pro.</h2>
            <p className="text-green-100 text-lg max-w-md">
                Organize projects, manage team capacity, and automate workload balancing with PlanCraft's intelligent dashboard.
            </p>
        </div>

        {/* Abstract Card UI Representation */}
        <div className="relative z-10 mt-12 transform rotate-2 hover:rotate-0 transition-transform duration-500">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-green-400/20 flex items-center justify-center text-green-400">
                        <FaArrowRight className="-rotate-45" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Productivity Spike</h3>
                        <p className="text-sm text-green-100">Team performance is up by 45%</p>
                    </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                    <div className="bg-green-400 h-2 rounded-full w-[75%]"></div>
                </div>
                <div className="flex justify-between text-xs text-green-200">
                    <span>Progress</span>
                    <span>75%</span>
                </div>
            </div>
        </div>

        <div className="relative z-10 text-sm text-green-200/60">
            © 2024 PlanCraft Inc. All rights reserved.
        </div>
      </div>

    </div>
  );
};

export default Login;