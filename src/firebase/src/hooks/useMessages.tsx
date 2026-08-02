import { useCallback, useEffect, useState } from "react";

import {
  getConversationsForUser,
  getMessagesForConversation,
  getMessagingContacts,
} from "../firebase/messages";
import useAuth from "./useAuth";
import type {
  Conversation,
  DirectMessage,
  MessagingContact,
} from "../models/Message";

export default function useMessages() {
  const { currentUser } = useAuth();
  const [contacts, setContacts] = useState<MessagingContact[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInitial = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [contactData, conversationData] = await Promise.all([
        getMessagingContacts(),
        getConversationsForUser(currentUser.uid),
      ]);
      setContacts(contactData.filter((contact) => contact.uid !== currentUser.uid));
      setConversations(conversationData);
    } catch (caughtError) {
      console.error("Failed to load messages:", caughtError);
      setError(
        caughtError instanceof Error ? caughtError.message : "Failed to load messages."
      );
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadInitial();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadInitial]);

  async function loadConversationMessages(conversationId: string) {
    setMessages(await getMessagesForConversation(conversationId));
  }

  return {
    contacts,
    conversations,
    messages,
    loading,
    error,
    loadInitial,
    loadConversationMessages,
  };
}
