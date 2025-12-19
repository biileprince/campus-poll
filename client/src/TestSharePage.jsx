import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function TestSharePage() {
  const navigate = useNavigate();

  const votingLink = "https://pollcreator.app/vote/abc123456";
  const resultsLink = "https://pollcreator.app/results/abc123456";

  const [copied, setCopied] = useState({ voting: false, results: false });

  const copyToClipboard = async (which) => {
    try {
      const text = which === "voting" ? votingLink : resultsLink;
      await navigator.clipboard.writeText(text);
      setCopied((s) => ({ ...s, [which]: true }));
      setTimeout(() => setCopied((s) => ({ ...s, [which]: false })), 1500);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };

  const Icon = {
    Check: (props) => (
      <svg viewBox="0 0 24 24" fill="none" {...props}>
        <path
          d="M20 6L9 17l-5-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    Clipboard: (props) => (
      <svg viewBox="0 0 24 24" fill="none" {...props}>
        <path
          d="M16 4h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="8"
          y="2"
          width="8"
          height="4"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
    External: (props) => (
      <svg viewBox="0 0 24 24" fill="none" {...props}>
        <path
          d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M15 3h6v6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 14L21 3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    Link: (props) => (
      <svg viewBox="0 0 24 24" fill="none" {...props}>
        <path
          d="M10 14a5 5 0 0 0 7 0l1.5-1.5a3.5 3.5 0 0 0-5-5L12 9"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M14 10a5 5 0 0 0-7 0L5.5 11.5a3.5 3.5 0 0 0 5 5L12 15"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  };

  return (
    <div className="p-6 bg-[#F9FAFB] min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* SUCCESS MESSAGE */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl shadow-sm border p-8 text-center mb-8"
        >
          <motion.div
            initial={{ rotate: -20, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
            className="w-14 h-14 bg-emerald-500 rounded-full mx-auto flex items-center justify-center"
          >
            <Icon.Check width={28} height={28} className="text-white" />
          </motion.div>

          <h1 className="text-xl font-semibold mt-3">
            Your poll has been created!
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Share your poll with participants using the links below.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT - MAIN */}
          <section className="lg:col-span-8 space-y-5">
            {/* Voting Link */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="bg-white rounded-xl shadow-sm border p-5"
            >
              <h3 className="text-sm font-semibold mb-1">Voting Link</h3>
              <p className="text-xs text-gray-500 mb-3">
                Share this link to collect votes.
              </p>

              <div className="flex items-center gap-3">
                <input
                  readOnly
                  value={votingLink}
                  className="flex-1 h-11 px-4 rounded-lg border bg-gray-50 text-sm"
                />
                <button
                  onClick={() => copyToClipboard("voting")}
                  className="px-4 py-2 rounded-md bg-blue-100 hover:bg-blue-600 hover:text-white transition"
                >
                  <Icon.Clipboard width={16} height={16} />
                </button>
              </div>

              <AnimatePresence>
                {copied.voting && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-emerald-600 mt-3"
                  >
                    Voting link copied ✔
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Results Link */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="bg-white rounded-xl shadow-sm border p-5"
            >
              <h3 className="text-sm font-semibold mb-1">Results Link</h3>
              <p className="text-xs text-gray-500 mb-3">
                Share this link to view results.
              </p>

              <div className="flex items-center gap-3">
                <input
                  readOnly
                  value={resultsLink}
                  className="flex-1 h-11 px-4 rounded-lg border bg-gray-50 text-sm"
                />
                <button
                  onClick={() => copyToClipboard("results")}
                  className="px-4 py-2 rounded-md bg-blue-100 hover:bg-blue-600 hover:text-white transition"
                >
                  <Icon.Clipboard width={16} height={16} />
                </button>
              </div>

              <AnimatePresence>
                {copied.results && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-emerald-600 mt-3"
                  >
                    Results link copied ✔
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* CTA Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => navigate("/create-poll")}
                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-blue-600 hover:text-white transition"
              >
                Create Another Poll
              </button>

              <button
                onClick={() => navigate("/results")}
                className="px-5 py-2.5 rounded-xl border bg-gray-100 hover:bg-blue-600 hover:text-white transition flex items-center gap-2"
              >
                <Icon.External width={16} height={16} /> View Results
              </button>
            </div>
          </section>

          {/* RIGHT - STATS */}
          <aside className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55 }}
              className="bg-white rounded-xl border shadow-sm p-5"
            >
              <h4 className="text-sm font-semibold mb-4">Today's Stats</h4>

              <div className="space-y-4 mb-4">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-lg bg-blue-50 p-4"
                >
                  <p className="text-2xl font-bold text-blue-600">12</p>
                  <p className="text-xs text-gray-500">Polls Created</p>
                </motion.div>

                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="rounded-lg bg-emerald-50 p-4"
                >
                  <p className="text-2xl font-bold text-emerald-600">87%</p>
                  <p className="text-xs text-gray-500">Avg Response Rate</p>
                </motion.div>
              </div>

              <div className="border-t pt-3">
                <p className="text-xs font-semibold mb-2">Quick Actions</p>

                <ul className="space-y-2 text-sm">
                  <li
                    className="flex items-center gap-2 text-blue-600 cursor-pointer"
                    onClick={() => navigate("/share")}
                  >
                    <Icon.Link width={14} height={14} /> Share Poll
                  </li>

                  <li
                    className="flex items-center gap-2 text-gray-500 cursor-pointer"
                    onClick={() => navigate("/polls")}
                  >
                    <Icon.External width={14} height={14} /> View All Polls
                  </li>
                </ul>
              </div>
            </motion.div>
          </aside>
        </div>
      </div>
    </div>
  );
}
