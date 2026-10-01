import { useState } from "react";
import { useNavigate } from "react-router-dom";




function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }
        setLoading(true);
        try {
            const responce = await fetch ("http://localhost:8000/accounts/login/",
                {
                    method:"POST",
                    headers : {"content-type": "application/json"},
                    body : JSON.stringify({email: email, password: password})

                });
                const data = await responce.json();
                console.log(data);

                if (responce.ok){
                    sessionStorage.setItem(
                        "access_token", 
                        data.tokens.access
                    );
                    sessionStorage.setItem(
                        "refresh_token", 
                        data.tokens.refresh
                    );
                    sessionStorage.setItem(
                        "user",
                        JSON.stringify(data.user)
                    );
                    navigate("/dashboard");
                }
                else {
                    setError(data.message || "Login failed.");
                }            
            }
        catch (error) {
            console.error(error);
            setError("An error occurred. Please try again.");
        }
        finally {
        setLoading(false);
    }

        
    };

    return (    

        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
                <h1 className="text-2xl font-bold text-center mb-6">
                    Login
                </h1>
                <form className="space-y-4"
                 onSubmit={handleLogin}>

                <div className="flex flex-col">
                    <label  className="mb-2 font-bold text-lg text-gray-900">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border border-gray-300 p-2 rounded-lg"
                    />
                </div>
                <div className="flex flex-col">
                    <label  className="mb-2 font-bold text-lg text-gray-900">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border border-gray-300 p-2 rounded-lg"
                    />
                </div>
                {error && <p className="text-red-500">{error}</p>}
                <button
                    type="submit"
                    className="w-full bg-cyan-500 text-white p-2 rounded-lg"
                >
                {loading ? "Logging in..." : "Login"}
                </button>
                </form>
               
            </div>
        </div>
    )};


export default Login;