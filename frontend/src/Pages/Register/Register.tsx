import {useState} from "react";
import { useNavigate } from "react-router-dom";

function Register() {
    const navigate = useNavigate();
    const[email, setEmail]=useState("");
    const[password, setPassword]=useState("");
    const[confirmPassword, setConfirmPassword]=useState("");
    const[error, setError]=useState("");
    const[success, setSuccess]=useState("");
    const[loading, setLoading]=useState(false);

    const handleSubmit = async(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setSuccess(""); 

        if (!email || !password || !confirmPassword){
            setError("All fields are required");
            return;        
        }

        if (password !== confirmPassword){
            setError("Password do not match");
            return;
        }

        setLoading(true);
       
            try {const response = await fetch(
                "http://localhost:8000/accounts/register/",
                {
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({
                    email,
                    password,
                    confirm_password:confirmPassword})
            });
            const data = await response.json();
            console.log(data);
            if (response.ok) {
               setEmail("");
               setPassword("");
               setConfirmPassword("");
               navigate("/login");
            } else {
                setError(data.message ||data.confirm_password || "Registration failed");
            }
        } catch (error) {
            console.error(error);
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
        
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
                    {success && <p className="text-green-500">{success}</p>}

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