import { httpsCallable } from "firebase/functions";
import { functions } from "../config/firebase";
import type { Plan } from "../models/Plan";

export type PlatformOverviewSnapshot = {
  users: number; students: number; tutors: number; admins: number; activeUsers: number;
  tenants: number; institutionTenants: number; independentTutorTenants: number;
  plans: number; activePlans: number; subscriptions: number; activeSubscriptions: number; trialSubscriptions: number;
  programmes: number; courseUnits: number; modules: number; lessons: number; quizzes: number;
  marketplaceProducts: number; fulfilledOrders: number; grossCommerceRevenue: number; currency: string;
  supportOpen: number; aiRequests: number; notifications: number;
  recentActivity: Array<{ id: string; title: string; detail: string; createdAt?: string | null }>;
};

export async function getPlatformOverviewSnapshot(): Promise<PlatformOverviewSnapshot> {
  const callable = httpsCallable<Record<string, never>, PlatformOverviewSnapshot>(functions, "getPlatformOverviewSnapshot");
  return (await callable({})).data;
}

export async function listSubscriptionPlansTrusted(): Promise<Plan[]> {
  const callable = httpsCallable<Record<string, never>, { plans: Plan[] }>(functions, "listSubscriptionPlansTrusted");
  return (await callable({})).data.plans;
}
