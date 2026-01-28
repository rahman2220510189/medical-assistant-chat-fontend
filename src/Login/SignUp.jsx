import React, { useState, useContext } from "react"; // Added imports
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../Provider/AuthProvider";
import useAxiosPublic from "../Hooks/useAxiosPublic";

const SignUp = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { createUser, googleSignIn } = useContext(AuthContext);
    const axiosPublic = useAxiosPublic();

    // Function to toggle password eye icon
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    //generate jwt token
    const generateToken = async (email) => {
        try{
            const res = await axiosPublic.post('/jwt', {email});
            if(res.data?.token){
                localStorage.setItem('access-token', res.data.token);
                console.log('token stored successfully');
            }
        } catch(err){
            console.error('Error generating token:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        
        const form = e.target;
        const name = form.name.value;
        const email = form.email.value;
        const password = form.password.value;

        // Password validation
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        
        



     try{

     
       const result = await createUser(email, password);
            const user = result.user;
            console.log("Created User:", user);
            await generateToken(user.email);

            //save user to mongoDB
            const userInfo = {
                email: user.email,
                name: name || email.split('@')[0],
            }
            const dbResponse = await axiosPublic.post('/api/users', userInfo);
            console.log('User saved to DB:', dbResponse.data);

                form.reset();
                navigate('/');
            } catch (err) {
                console.error('Error creating user:', err);
                setError(err.message);
            }
    };

           

    const handleGoogleSignIn = async() => {
     try{ 
        const result = await googleSignIn();
            console.log("Google User:", result.user);
            await generateToken(result.user.email);

            //save user to mongoDB
            const userInfo = {
                email: result.user.email,
                name: result.user.displayName,
            }
            const dbResponse = await axiosPublic.post('/api/users', userInfo);
            console.log('Google User saved to DB:', dbResponse.data);
            navigate('/');
        } 
        catch(err){
            console.error('Error with Google Sign-In:', err);
            setError(err.message);
        }

      
    };

    return (
        <div className="max-w-md mx-auto my-10 bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Create Account</h2>

            {/* Google Sign-In */}
            <button type="button" onClick={handleGoogleSignIn} className="w-full flex items-center justify-center gap-2 border border-gray-300 p-2.5 rounded-lg hover:bg-gray-50 transition mb-6">
                <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-5 h-5" alt="Google" />
                <span className="text-gray-700 font-medium">Continue with Google</span>
            </button>

            <div className="relative flex items-center mb-6">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">or sign up with email</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error Message Display */}
                {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

                {/* Name Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="enter your name"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>

                {/* Email Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        required
                        placeholder="enter your email"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>

                {/* Password Input with Toggle */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            required
                            placeholder="enter password"
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            )}
                        </button>
                    </div>
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium">
                    Sign Up
                </button>
            </form>
        </div>
    );
};

export default SignUp;