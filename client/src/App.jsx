import TestSharePage from "./TestSharePage.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreatePollPage from "./pages/CreatePollPage";
import VotePage from "./pages/VotePage";
import ResultsPage from "./pages/ResultsPage";
import PollsPage from "./pages/PollsPage";
import AppLayout from "./Components/AppLayout";
import HomePage from "./pages/HomePage";
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminPolls from "./pages/AdminPolls";
import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute from "./Components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="polls" element={<PollsPage />} />
          <Route path="create-poll" element={<CreatePollPage />} />
          <Route path="poll/:voteId" element={<VotePage />} />
          <Route path="results/:id" element={<ResultsPage />} />
          <Route path="share" element={<TestSharePage />} />
          {/* <Route path="history" element={<History />} /> */}
          {/* <Route path="settings" element={<Settings />} /> */}
        </Route>
        
        {/* Admin Login Route */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Protected Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute element={<AdminLayout />} />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="polls" element={<AdminPolls />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
