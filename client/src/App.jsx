
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreatePollPage from "./pages/CreatePollPage";
import VotePage from "./pages/VotePage";
import ResultsPage from "./pages/ResultsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/create" element={<CreatePollPage />} />
        <Route path="/poll/:pollId" element={<VotePage />} />
        <Route path="/results/:pollId" element={<ResultsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
