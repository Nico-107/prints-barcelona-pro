import { Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

// Redirects old bookmark to unified admin dashboard
const AdminOrders = () => (
  <>
    <Helmet><meta name="robots" content="noindex" /><title>Not indexed</title></Helmet>
    <Navigate to="/admin" replace />
  </>
);

export default AdminOrders;
