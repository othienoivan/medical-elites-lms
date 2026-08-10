import {
  Bot,
  BookOpen,
  ChevronRight,
  Eraser,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import useAuth from "../../../hooks/useAuth";
import {
  resolveDocumentationPageContext,
  type DocumentationRole,
} from "../../knowledge";
import { CopilotService } from "../application/copilot-service";
import type { CopilotMessage, CopilotMode } from "../domain/copilot-models";
import { CopilotSessionStorage } from "../infrastructure/copilot-session-storage";

const hiddenRoutePatterns = [
  /^\/login/,
  /^\/register/,
  /^\/marketplace\/checkout/,
  /^\/student\/assessments\/[^/]+\/take/,
  /\/print(?:\/|$)/,
];

function createMessage(
  sender: CopilotMessage["sender"],
  text: string,
  extras: Pick<CopilotMessage, "actions" | "articles"> = {},
): CopilotMessage {
  return {
    id: `${sender}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sender,
    text,
    createdAt: Date.now(),
    ...extras,
  };
}

export default function MediFloatingButton() {
  const { role } = useAuth();
  const location = useLocation();
  const pageContext = useMemo(
    () => resolveDocumentationPageContext(location.pathname),
    [location.pathname],
  );

  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<CopilotMode>("ask");
  const [messages, setMessages] = useState<CopilotMessage[]>(() =>
    CopilotSessionStorage.load(),
  );
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    CopilotSessionStorage.save(messages);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "m") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  if (
    !role ||
    hiddenRoutePatterns.some((pattern) => pattern.test(location.pathname))
  ) {
    return null;
  }

  const documentationRole = role as DocumentationRole;

  async function submit(forcedPrompt?: string): Promise<void> {
    const value = (forcedPrompt ?? prompt).trim();
    if (!value || loading) return;

    setPrompt("");
    setLoading(true);
    setMessages((current) => [...current, createMessage("user", value)]);

    try {
      const result = await CopilotService.ask(
        value,
        location.pathname,
        documentationRole,
        pageContext.pageTitle,
      );

      setMessages((current) => [
        ...current,
        createMessage("medi", result.answer, {
          actions: result.actions,
          articles: result.articles,
        }),
      ]);
    } catch (error) {
      console.error("Medi Copilot request failed", error);
      setMessages((current) => [
        ...current,
        createMessage(
          "medi",
          "I could not complete that request. Open the Knowledge Center or try again in a moment.",
        ),
      ]);
    } finally {
      setLoading(false);
    }
  }

  function clearConversation(): void {
    setMessages([]);
    CopilotSessionStorage.clear();
  }

  const quickActions: Array<{
    mode: CopilotMode;
    label: string;
    icon: typeof Sparkles;
    prompt?: string;
  }> = [
    {
      mode: "ask",
      label: "Ask Medi",
      icon: Bot,
    },
    {
      mode: "explain",
      label: "Explain Page",
      icon: Sparkles,
      prompt: "Explain this page, its purpose, main workflow and important controls.",
    },
    {
      mode: "guide",
      label: "Guide Me",
      icon: ChevronRight,
      prompt: "Guide me through the main task on this page step by step.",
    },
    {
      mode: "search",
      label: "Search Help",
      icon: Search,
    },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-[80] flex items-center gap-2 rounded-full bg-blue-700 px-4 py-3 font-black text-white shadow-2xl transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 md:bottom-6 md:right-6"
        aria-label="Open Medi Platform Copilot"
        title="Open Medi Platform Copilot (Ctrl or Cmd + M)"
      >
        <Sparkles size={20} />
        <span className="hidden sm:inline">Medi AI</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-end bg-slate-950/40 md:items-stretch"
          role="dialog"
          aria-modal="true"
          aria-label="Medi Platform Copilot"
        >
          <section className="flex h-[88vh] w-full flex-col rounded-t-3xl bg-white shadow-2xl md:h-full md:max-w-xl md:rounded-none">
            <header className="border-b bg-gradient-to-r from-blue-800 to-indigo-700 px-5 py-4 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles size={22} />
                    <h2 className="font-black">Medi Platform Copilot</h2>
                  </div>
                  <p className="mt-1 text-sm text-blue-100">
                    {pageContext.pageTitle}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={clearConversation}
                    className="rounded-xl bg-white/10 p-2 hover:bg-white/20"
                    aria-label="Clear conversation"
                    title="Clear conversation"
                  >
                    <Eraser size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-xl bg-white/10 p-2 hover:bg-white/20"
                    aria-label="Close Medi Platform Copilot"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-4 gap-2 border-b bg-slate-50 p-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.mode}
                    type="button"
                    onClick={() => {
                      setMode(action.mode);
                      if (action.prompt) void submit(action.prompt);
                    }}
                    className={`rounded-xl px-2 py-2 text-xs font-bold transition ${
                      mode === action.mode
                        ? "bg-blue-700 text-white"
                        : "border bg-white text-slate-700 hover:border-blue-300"
                    }`}
                  >
                    <Icon className="mx-auto mb-1" size={17} />
                    {action.label}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.length === 0 && (
                <div className="rounded-3xl border border-dashed bg-slate-50 p-6 text-center">
                  <Bot className="mx-auto text-blue-700" size={34} />
                  <h3 className="mt-3 font-black text-slate-950">
                    How can Medi help?
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Ask about this page, find a feature, search the Knowledge
                    Center or request step-by-step guidance.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      void submit(
                        "Explain this page, its purpose, main workflow and important controls.",
                      )
                    }
                    className="mt-4 rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white"
                  >
                    Explain This Page
                  </button>
                </div>
              )}

              {messages.map((message) => (
                <article
                  key={message.id}
                  className={`max-w-[92%] rounded-2xl p-4 text-sm leading-6 ${
                    message.sender === "user"
                      ? "ml-auto bg-blue-700 text-white"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.text}</div>

                  {message.actions && message.actions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.actions.map((action) => (
                        <Link
                          key={action.routeKey}
                          to={action.path}
                          onClick={() => setOpen(false)}
                          className="rounded-xl bg-white px-3 py-2 text-xs font-black text-blue-700 shadow-sm"
                        >
                          {action.label}
                        </Link>
                      ))}
                    </div>
                  )}

                  {message.articles && message.articles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.articles.slice(0, 3).map((article) => (
                        <Link
                          key={article.id}
                          to={`/help/articles/${article.slug}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                        >
                          <BookOpen size={14} />
                          {article.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </article>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-700" />
                  Medi is checking the platform and Knowledge Center…
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <footer className="border-t bg-white p-4">
              <div className="flex items-end gap-2">
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void submit();
                    }
                  }}
                  rows={2}
                  placeholder={
                    mode === "search"
                      ? "Search the Knowledge Center…"
                      : "Ask Medi about Medical Elites LMS…"
                  }
                  className="min-h-12 flex-1 resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  disabled={loading || !prompt.trim()}
                  onClick={() => void submit()}
                  className="rounded-2xl bg-blue-700 p-4 text-white disabled:opacity-50"
                  aria-label="Send message to Medi"
                >
                  <Send size={19} />
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Read-only guidance · Role-aware actions</span>
                <span>Ctrl/Cmd + M</span>
              </div>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
