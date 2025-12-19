import TestSharePage from "./TestSharePage.jsx";
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
          <Route path="share" element={<TestSharePage />} />
          {/* <Route path="history" element={<History />} /> */}
          {/* <Route path="settings" element={<Settings />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
// NOTE: If you want routing, run: npm install react-router-dom
// then uncomment the imports and Routes below.
// import { BrowserRouter, Routes, Route } from "react-router-dom";

