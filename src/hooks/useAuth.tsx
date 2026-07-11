import { useContext } from "react";
<<<<<<< HEAD
import { AuthContext } from "../contexts/auth-context";
=======
import { AuthContext } from "../contexts/AuthContext";
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d

export default function useAuth() {
  return useContext(AuthContext);
}