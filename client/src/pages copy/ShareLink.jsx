import React, { useState } from "react";

export default function ShareLink() {
  const PRIMARY = "#3B82F6";
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
      console.error("copy failed", e);
    }
  };

  const Icon = {
    Check: (props) => (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
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
      <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
        <path
          d="M16 4h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="8"
          y="2"
          width="8"
          height="4"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    External: (props) => (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
        <path
          d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 3h6v6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 14L21 3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    Link: (props) => (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
        <path
          d="M10 14a5 5 0 0 0 7 0l1.5-1.5a3.5 3.5 0 0 0-5-5L12 9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 10a5 5 0 0 0-7 0L5.5 11.5a3.5 3.5 0 0 0 5 5L12 15"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  };

  return (
    <div className="min-h-screen flex bg-[#F9FAFB] text-[#111827]">
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-100 shadow-sm flex flex-col justify-between">
        <div>
          <div className="px-5 py-6 flex items-center gap-3 border-b border-gray-100">
            <div className="w-10 h-10 rounded-md bg-[#3B82F6] flex items-center justify-center text-white font-semibold">
              PC
            </div>
            <div className="text-sm font-semibold">PollCreator</div>
          </div>

          <nav className="px-3 py-6 space-y-1">
            <a
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-[#0F172A] hover:bg-gray-50"
              href="#create"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M12 5v14M5 12h14"
                  stroke="#111827"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Create Poll
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              href="#mypolls"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M3 7h18M3 12h18M3 17h18"
                  stroke="#374151"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              My Polls
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              href="#results"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M3 3v18h18"
                  stroke="#374151"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Results
            </a>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <img
              src="https://via.placeholder.com/40"
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="text-sm font-medium">Ebenezer</div>
              <div className="text-xs text-gray-500">ebenezer@gmail.com</div>
            </div>
          </div>
        </div>
      </aside>

      {/* CENTER + RIGHT */}
      <div className="flex-1 flex flex-col">
        {/* ...existing code... topbar, main content, success card, link cards, stats, buttons ... */}
        <header className="w-full border-b border-gray-100 bg-transparent p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <h2 className="text-lg font-semibold">Share voting link</h2>
            <div className="flex items-center gap-4">
              <div className="w-64">
                <input
                  aria-label="Search polls"
                  placeholder="Search polls..."
                  className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm bg-white"
                />
              </div>
              <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden">
                <img
                  src="https://via.placeholder.com/36"
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="max-w-6xl mx-auto">
            {/* Success card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 mb-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Icon.Check className="text-white" width="28" height="28" />
                </div>
                <h1 className="text-xl font-semibold">
                  Your poll has been created!
                </h1>
                <p className="text-sm text-[#6b7280] max-w-[56ch]">
                  Share your poll with participants using the links below.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Main center column */}
              <section className="lg:col-span-8 space-y-4">
                {/* Voting Link Card */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h3 className="text-sm font-semibold mb-1">Voting Link</h3>
                  <p className="text-xs text-[#6b7280] mb-3">
                    Share this link with participants to collect votes
                  </p>

                  <div className="flex items-center gap-3">
                    <input
                      readOnly
                      value={votingLink}
                      className="flex-1 h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 text-sm"
                      aria-label="Voting link"
                    />
                    <button
                      onClick={() => copyToClipboard("voting")}
                      aria-label="Copy voting link"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#3B82F6] text-white hover:bg-[#2563EB] focus:outline-none"
                    >
                      <Icon.Clipboard width="16" height="16" />{" "}
                      <span className="text-sm">Copy</span>
                    </button>
                  </div>

                  {copied.voting && (
                    <p className="text-sm text-emerald-600 mt-3">
                      Voting link copied ✔
                    </p>
                  )}
                </div>

                {/* Results Link Card */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h3 className="text-sm font-semibold mb-1">Results Link</h3>
                  <p className="text-xs text-[#6b7280] mb-3">
                    Share this link to view live poll results
                  </p>

                  <div className="flex items-center gap-3">
                    <input
                      readOnly
                      value={resultsLink}
                      className="flex-1 h-11 px-4 rounded-lg border border-gray-200 bg-gray-50 text-sm"
                      aria-label="Results link"
                    />
                    <button
                      onClick={() => copyToClipboard("results")}
                      aria-label="Copy results link"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#E9F2FF] text-[#3B82F6] hover:bg-[#D7ECFF] focus:outline-none"
                    >
                      <Icon.Clipboard width="16" height="16" />{" "}
                      <span className="text-sm">Copy</span>
                    </button>
                  </div>

                  {copied.results && (
                    <p className="text-sm text-emerald-600 mt-3">
                      Results link copied ✔
                    </p>
                  )}
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap gap-3 mt-4">
                  <button className="px-5 py-2.5 rounded-xl bg-[#3B82F6] text-white text-sm hover:bg-[#2563EB] inline-flex items-center gap-2">
                    Create Another Poll
                  </button>
                  <button className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-[#374151] hover:bg-gray-50 inline-flex items-center gap-2">
                    <Icon.External width="16" height="16" /> View Results
                  </button>
                </div>
              </section>

              {/* Right stats column */}
              <aside className="lg:col-span-4">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h4 className="text-sm font-semibold mb-4">Today's Stats</h4>

                  <div className="space-y-4 mb-4">
                    <div className="rounded-lg bg-[#EFF6FF] p-4">
                      <p className="text-2xl font-bold text-[#2563EB]">12</p>
                      <p className="text-xs text-[#6b7280]">Polls Created</p>
                    </div>

                    <div className="rounded-lg bg-[#ECFDF5] p-4">
                      <p className="text-2xl font-bold text-emerald-600">87%</p>
                      <p className="text-xs text-[#6b7280]">
                        Avg Response Rate
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-xs font-semibold mb-2">Quick Actions</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2 text-[#3B82F6]">
                        <Icon.Link width="14" height="14" /> Share Poll
                      </li>
                      <li className="flex items-center gap-2 text-gray-500">
                        <Icon.External width="14" height="14" /> View All Polls
                      </li>
                    </ul>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
