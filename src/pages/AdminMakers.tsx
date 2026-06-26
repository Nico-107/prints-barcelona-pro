import { Navigate } from "react-router-dom";

// Redirects old bookmark to unified admin dashboard
const AdminMakers = () => <Navigate to="/admin" replace />;

export default AdminMakers;
