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
