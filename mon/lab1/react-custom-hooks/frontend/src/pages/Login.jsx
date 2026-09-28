import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { authenticate:login, isLoading, error } = useAuth("/api/users/login");

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const user = await login({ email, password });
    if (user) {
      setIsAuthenticated(true);
      navigate("/");
    }
  };

  return (
    <div className="create">
      <h2>Login</h2>
      <form onSubmit={handleFormSubmit}>
        <label>Email address:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button disabled={isLoading}>Log in</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default Login;