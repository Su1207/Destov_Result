// auth-context.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
// import { useNavigate } from "react-router-dom";
import { get, ref } from "firebase/database";
import { database } from "../firebase";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import { clearUser, setUserData } from "../store/userSlice";

interface User {
  ID: string;
  PASSWORD: string;
}

interface AuthContextProps {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Monitor user activity to reset last activity time
  useEffect(() => {
    const activityListener = () => {
      setLastActivity(Date.now());
    };

    document.addEventListener("mousemove", activityListener);
    document.addEventListener("keydown", activityListener);

    return () => {
      document.removeEventListener("mousemove", activityListener);
      document.removeEventListener("keydown", activityListener);
    };
  }, []);

  // Logout user if inactive for more than 30 minutes
  useEffect(() => {
    const idleTimer = setInterval(() => {
      const currentTime = Date.now();
      const idleTime = currentTime - lastActivity;
      const idleDuration = 60 * 60 * 1000; // 120 minutes

      if (idleTime >= idleDuration) {
        logout();
      }
    }, 1000); // Check every second

    return () => clearInterval(idleTimer);
  }, [lastActivity]);

  const dispatch = useDispatch<AppDispatch>();

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    const userRef = ref(database, `ADMIN/AUTH`);

    try {
      const userSnapshot = await get(userRef);

      const userData = userSnapshot.val() as User;

      // Check if the password matches
      if (userData.PASSWORD === password && userData.ID === username) {
        // Update state
        setUser(userData);

        dispatch(setUserData({ username, isAuthenticated: true }));

        return true;
      } else {
        toast.error("Invalid Username or Password");
        return false;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return false;
    }
  };

  const logout = () => {
    dispatch(clearUser());
    // Update state
    setUser(null);

    // navigate("/login"); // Redirect to login after logout
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
