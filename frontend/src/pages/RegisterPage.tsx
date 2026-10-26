import {useState} from "react";
import { useNavigate } from "react-router-dom";
import { useRegister } from "../features/auth/hooks/useRegister";

function Register() {
    const navigate = useNavigate();
    const[email, setEmail]=useState("");
    const[password, setPassword]=useState("");
    const[confirmPassword, setConfirmPassword]=useState("");
    const { error, loading, submit } = useRegister();

    const handleSubmit = async(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (await submit(email, password, confirmPassword)) navigate("/login");
        
    };
    return(
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
                <form className="space-y-4" onSubmit={handleSubmit} >
                    <div className="flex flex-col">
                    <label className="mb-2 font-semibold">Email</label>
                    <input className="border border-gray-300 p-2 rounded" 
                           type="email" 
                           placeholder="Enter your email"
                           value={email}
                           onChange={(event) => setEmail(event.target.value)} />
                    </div>
                    <div className="flex flex-col">
                    <label className="mb-2 font-semibold">Password</label>
                    <input className="border border-gray-300 p-2 rounded" 
                           type="password" 
                           placeholder="Enter your password"
                           value={password}
                           onChange={(event) => setPassword(event.target.value)} />
                    </div> 
                    <div className="flex flex-col">
                    <label className="mb-2 font-semibold">Confirm Password</label>
                    <input className="border border-gray-300 p-2 rounded" 
                           type="password" 
                           placeholder="Confirm your password"
                           value={confirmPassword}
                           onChange={(event) => setConfirmPassword(event.target.value)} />
                    </div>
                    {error && <p className="text-red-500">{error}</p>}

                    <div className="flex flex-col mt-8 ">
                    <button className="bg-cyan-500 text-white py-2 px-4 rounded hover:bg-cyan-600" 
                                      type="submit"
                                      disabled={loading}>
                                {loading ? "Creating account..." : "Sign Up"}</button>
                    </div>
                    
                    <div className="text-center flex flex-col mt-10  ">
                        Already have an account? 
                        <button className="bg-cyan-500 text-white mt-2 py-2 px-4 rounded hover:bg-cyan-600" 
                            type="button"
                            onClick={() => navigate("/login")}>
                            Log In
                        </button>
                    </div>
                </form>
            </div>
            
        </div>
        
    )
}

export default Register;
