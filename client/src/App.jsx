import TestSharePage from "./TestSharePage.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreatePollPage from "./pages/CreatePollPage";
import VotePage from "./pages/VotePage";
import ResultsPage from "./pages/ResultsPage";
import PollsPage from "./pages/PollsPage";
import AppLayout from "./Components/AppLayout";
import HomePage from "./pages/HomePage";

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
      </Routes>
    </BrowserRouter>
  );
}
