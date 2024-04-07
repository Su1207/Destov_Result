import { useState } from "react";
import { useAuth } from "../../components/Auth-context";
import "./login.scss";
import PersonIcon from "@mui/icons-material/Person";
import KeyIcon from "@mui/icons-material/Key";
// import { get, ref } from "firebase/database";
// import { database } from "../../firebase";

const Login = () => {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const { login } = useAuth();
  // const { subLogin } = useSubAuth();

  const handleLogin = () => {
    login(username, password);
  };

  return (
    <div className="auth">
      <div className="auth_container">
        <div className="login_container">
          <div className="login_title">Login</div>
          <form>
            <label className="login-label">Username</label>
            <div className="input_space">
              <PersonIcon className="user_icon" />
              <input
                type="text"
                id="username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <label className="login-label">Password</label>

            <div className="input_space">
              <KeyIcon className="password_icon" />
              <input
                type="password"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="button" onClick={handleLogin}>
              Login
            </button>
          </form>

          <div className=" mt-[4rem] flex items-center justify-center text-[10px] text-[#98a6ad]">
            Copyright © 2023-2024 Made By
            <span className=" text-[#F05387] ml-1">DestovTech</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
