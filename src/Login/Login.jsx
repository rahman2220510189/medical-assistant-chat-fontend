import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom"; 
import { AuthContext } from "../Provider/AuthProvider";

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { signIn, googleSignIn } = useContext(AuthContext); 

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        
        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;

        signIn(email, password)
            .then(result => {
                console.log("Logged In:", result.user);
                form.reset();
                navigate('/'); // Navigate to home or dashboard
            })
            .catch(err => {
                console.error(err);
                setError("Invalid email or password. Please try again.");
            });
    };

    const handleGoogleSignIn = () => {
        googleSignIn()
            .then(result => {
                console.log("Google Login:", result.user);
                navigate('/');
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
            });
    };

    return (
        <div className="max-w-md mx-auto my-10 bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
                <p className="text-gray-500 text-sm mt-1">Please enter your details to sign in</p>
            </div>

            {/* Google Sign-In */}
            <button 
                type="button" 
                onClick={handleGoogleSignIn} 
                className="w-full flex items-center justify-center gap-2 border border-gray-300 p-2.5 rounded-lg hover:bg-gray-50 transition mb-6 shadow-sm"
            >
                <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-5 h-5" alt="Google" />
                <span className="text-gray-700 font-medium text-sm">Sign in with Google</span>
            </button>

            <div className="relative flex items-center mb-6">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase tracking-wider">or email login</span>
                <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Email Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        required
                        placeholder="enter your email"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    />
                </div>

                {/* Password Input */}
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <a href="#" className="text-xs text-blue-600 hover:underline">Forgot password?</a>
                    </div>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            required
                            placeholder="enter your password"
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <button 
                    type="submit" 
                    className="w-full bg-blue-600 text-white p-2.5 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-100 mt-2"
                >
                    Sign In
                </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-8">
                Don't have an account? {" "}
                <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
                    Create one for free
                </Link>
            </p>
        </div>
    );
};

export default Login;