import TestSharePage from "./TestSharePage.jsx";
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
            <Route path="share" element={<TestSharePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
