import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreatePollPage from "./pages/CreatePollPage";
import VotePage from "./pages/VotePage";
import ResultsPage from "./pages/ResultsPage";
import AppLayout from "./Components/AppLayout";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="create-poll" element={<CreatePollPage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="vote" element={<VotePage />} />
          {/* <Route path="history" element={<History />} /> */}
          {/* <Route path="settings" element={<Settings />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
