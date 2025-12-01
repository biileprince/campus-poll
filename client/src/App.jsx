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
// NOTE: If you want routing, run: npm install react-router-dom
// then uncomment the imports and Routes below.
// import { BrowserRouter, Routes, Route } from "react-router-dom";

import TestSharePage from "./TestSharePage.jsx";
// import ShareLink from "./pages/ShareLink.jsx";

export default function App() {
  // Temporary simple render to avoid import resolution errors while react-router-dom is not installed
  return <TestSharePage />;
}

// <BrowserRouter>
//   <Routes>
//     <Route path="/" element={<TestSharePage />} />
//     <Route path="/share" element={<ShareLink />} />
//   </Routes>
// </BrowserRouter>
