import { MessageCircle, Plus, Search, Send, Users } from "lucide-react";
import { useMemo, useState } from "react";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import {
  getConversationsForUser,
  getOrCreateConversation,
  sendDirectMessage,
} from "../firebase/messages";
import useAuth from "../hooks/useAuth";
import useMessages from "../hooks/useMessages";
import type {
  Conversation,
  MessagingContact,
} from "../models/Message";

export default function MessagesPage() {
  const { currentUser, userProfile, role } = useAuth();
  const {
    contacts,
    conversations,
    messages,
    loading,
    error,
    loadInitial,
    loadConversationMessages,
  } = useMessages();

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<MessagingContact | null>(null);
  const [contactSearch, setContactSearch] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [sending, setSending] = useState(false);
  const [showContacts, setShowContacts] = useState(false);

  const currentContact: MessagingContact | null = currentUser
    ? {
        uid: currentUser.uid,
        fullName: userProfile?.fullName || currentUser.email || "LMS User",
        email: currentUser.email || "",
        role: role || "student",
      }
    : null;

  const visibleContacts = useMemo(() => {
    const keyword = contactSearch.trim().toLowerCase();
    return contacts.filter((contact) => {
      const allowed =
        role === "student"
          ? contact.role === "tutor" || contact.role === "admin"
          : contact.role === "student" || contact.role === "tutor" || contact.role === "admin";

      return (
        allowed &&
        (!keyword ||
          contact.fullName.toLowerCase().includes(keyword) ||
          contact.email.toLowerCase().includes(keyword))
      );
    });
  }, [contactSearch, contacts, role]);

  function getOtherParticipant(conversation: Conversation): MessagingContact | null {
    if (!currentUser) return null;
    const otherUid = conversation.participantUids.find((uid) => uid !== currentUser.uid);
    if (!otherUid) return null;

    return (
      contacts.find((contact) => contact.uid === otherUid) || {
        uid: otherUid,
        fullName: conversation.participantNames?.[otherUid] || "LMS User",
        email: conversation.participantEmails?.[otherUid] || "",
        role: "student",
      }
    );
  }

  async function openConversation(conversation: Conversation) {
    setSelectedConversation(conversation);
    setSelectedRecipient(getOtherParticipant(conversation));
    await loadConversationMessages(conversation.id);
  }

  async function startConversation(recipient: MessagingContact) {
    if (!currentContact) return;
    const conversationId = await getOrCreateConversation({
      currentUser: currentContact,
      recipient,
    });

    await loadInitial();
    const conversation = (
      await getConversationsForUser(currentContact.uid)
    ).find((item) => item.id === conversationId);

    if (conversation) {
      setSelectedConversation(conversation);
      setSelectedRecipient(recipient);
      await loadConversationMessages(conversation.id);
    }
    setShowContacts(false);
  }

  async function handleSend() {
    if (!currentContact || !selectedConversation || !selectedRecipient) return;

    try {
      setSending(true);
      await sendDirectMessage({
        conversationId: selectedConversation.id,
        sender: currentContact,
        recipient: selectedRecipient,
        body: messageBody,
      });
      setMessageBody("");
      await Promise.all([
        loadConversationMessages(selectedConversation.id),
        loadInitial(),
      ]);
    } catch (caughtError) {
      alert(caughtError instanceof Error ? caughtError.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Messages</h1>
              <p className="mt-2 text-blue-100">
                Communicate securely with tutors and students inside Medical Elites LMS.
              </p>
            </div>
            <Button
              className="bg-white text-blue-700 hover:bg-blue-50"
              onClick={() => setShowContacts((current) => !current)}
            >
              <Plus size={18} /> New conversation
            </Button>
          </div>
        </section>

        {error && <Card className="mt-6 border border-red-200 text-red-700">{error}</Card>}

        {showContacts && (
          <Card className="mt-6">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                value={contactSearch}
                onChange={(event) => setContactSearch(event.target.value)}
                placeholder="Search people"
                className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4"
              />
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {visibleContacts.map((contact) => (
                <button
                  key={contact.uid}
                  type="button"
                  onClick={() => void startConversation(contact)}
                  className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
                >
                  <p className="font-bold text-slate-950">{contact.fullName}</p>
                  <p className="mt-1 text-sm text-slate-600">{contact.email}</p>
                  <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-1 text-xs capitalize text-slate-700">
                    {contact.role}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        )}

        <div className="mt-8 grid min-h-[620px] gap-6 lg:grid-cols-[340px_1fr]">
          <Card className="overflow-hidden p-0">
            <div className="border-b border-slate-200 p-5">
              <h2 className="font-bold text-slate-950">Conversations</h2>
            </div>
            {loading ? (
              <p className="p-5 text-slate-500">Loading conversations...</p>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Users className="mx-auto mb-3" size={36} />
                No conversations yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {conversations.map((conversation) => {
                  const other = getOtherParticipant(conversation);
                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => void openConversation(conversation)}
                      className={`w-full p-5 text-left transition hover:bg-slate-50 ${
                        selectedConversation?.id === conversation.id ? "bg-blue-50" : "bg-white"
                      }`}
                    >
                      <p className="font-bold text-slate-950">
                        {other?.fullName || "LMS User"}
                      </p>
                      <p className="mt-1 truncate text-sm text-slate-600">
                        {conversation.lastMessage || "Conversation started"}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="flex min-h-[620px] flex-col p-0">
            {!selectedConversation || !selectedRecipient ? (
              <div className="flex flex-1 flex-col items-center justify-center p-10 text-center text-slate-500">
                <MessageCircle size={52} className="mb-4 text-slate-400" />
                <h2 className="text-xl font-bold text-slate-900">Select a conversation</h2>
                <p className="mt-2">Choose an existing conversation or start a new one.</p>
              </div>
            ) : (
              <>
                <div className="border-b border-slate-200 p-5">
                  <h2 className="font-bold text-slate-950">{selectedRecipient.fullName}</h2>
                  <p className="text-sm text-slate-500">{selectedRecipient.email}</p>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                  {messages.length === 0 ? (
                    <p className="text-center text-slate-500">No messages yet. Start the conversation.</p>
                  ) : (
                    messages.map((message) => {
                      const mine = message.senderUid === currentUser?.uid;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${mine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[78%] rounded-2xl px-4 py-3 ${
                              mine
                                ? "bg-blue-700 text-white"
                                : "bg-slate-100 text-slate-900"
                            }`}
                          >
                            <p className="whitespace-pre-wrap text-sm leading-6">{message.body}</p>
                            <p className={`mt-2 text-xs ${mine ? "text-blue-100" : "text-slate-500"}`}>
                              {message.createdAt?.toLocaleString() || "Sending..."}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="border-t border-slate-200 p-5">
                  <div className="flex gap-3">
                    <textarea
                      value={messageBody}
                      onChange={(event) => setMessageBody(event.target.value)}
                      placeholder="Type your message..."
                      rows={2}
                      className="flex-1 resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                    />
                    <Button
                      onClick={() => void handleSend()}
                      loading={sending}
                      disabled={!messageBody.trim()}
                    >
                      <Send size={18} /> Send
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </main>
  );
}
