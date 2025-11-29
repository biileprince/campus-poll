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
        <Route path="/" element={<AppLayout />} >
          <Route index element={<HomePage />} />
          <Route path="create-poll" element={<CreatePollPage />} />
          <Route path="results" element={<ResultsPage />} />
        </Route>
        <Route path="/poll/:pollId" element={<VotePage />} />
        <Route path="/results/:pollId" element={<ResultsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
