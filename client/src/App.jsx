
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import CreatePollPage from "./pages/CreatePollPage";
import EditPollPage from "./pages/EditPollPage";
import VotePage from "./pages/VotePage";
import ResultsPage from "./pages/ResultsPage";
import PollsPage from "./pages/PollsPage";
import AppLayout from "./Components/AppLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MyPollsPage from "./pages/MyPollsPage";
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminPolls from "./pages/AdminPolls";
import ProtectedRoute from "./Components/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth pages (no layout) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Main app pages with layout */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="polls" element={<PollsPage />} />
            <Route path="create-poll" element={<CreatePollPage />} />
            <Route path="edit-poll/:resultsId" element={<EditPollPage />} />
            <Route path="poll/:voteId" element={<VotePage />} />
            <Route path="results/:id" element={<ResultsPage />} />
            <Route path="my-polls" element={<MyPollsPage />} />
          </Route>

          {/* Admin pages — protected by requireAdmin role */}
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="polls" element={<AdminPolls />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
