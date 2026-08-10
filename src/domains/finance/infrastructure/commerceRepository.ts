import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../../../config/firebase";

export type CommercePurpose = "subscription" | "marketplace";
export interface CommerceOrder { id: string; title: string; purpose: CommercePurpose; status: string; customerUid: string; amount: { amount: number; currency: string }; transactionReference?: string; createdAt?: unknown; }
export interface CommercePayment { id: string; orderId: string; status: string; customerUid: string; provider: string; providerTransactionId?: string; amount: { amount: number; currency: string }; createdAt?: unknown; }
export interface CommerceRefund { id: string; orderId: string; status: string; providerRefundId?: string; amount: { amount: number; currency: string }; createdAt?: unknown; }

async function call<TInput extends object,TOutput>(name:string,input:TInput):Promise<TOutput>{ const fn=httpsCallable<TInput,TOutput>(functions,name); return (await fn(input)).data; }
export const createCommerceCheckout=(input:{purpose:CommercePurpose;planId?:string;productId?:string;billingCycle?:string;fullName:string;email:string;phoneNumber?:string;paymentMethod:"card"|"mobile_money";returnUrl:string;idempotencyKey:string})=>call<typeof input,{checkoutUrl:string;transactionReference:string;invoiceId:string}>("createCommerceCheckout",input);
export const reconcileCommercePayment=(input:{transactionReference:string;transactionId:string})=>call<typeof input,{status:string;transactionReference:string}>("reconcileCommercePayment",input);
export const refreshMarketplaceLearningAccess=()=>call<Record<string, never>,{courseUnitIds:string[];count:number}>("refreshMarketplaceLearningAccess",{});
export const refreshTutorSubscriptionLifecycle=()=>call<Record<string, never>,{tenantId:string;status:string;planId:string;changed:boolean;currentPeriodEnd?:unknown}>("refreshTutorSubscriptionLifecycle",{});
export const cancelTutorSubscriptionAtPeriodEnd=()=>call<Record<string, never>,{tenantId:string;status:string;cancelAtPeriodEnd:boolean;currentPeriodEnd?:unknown}>("cancelTutorSubscriptionAtPeriodEnd",{});
export const requestCommerceRefund=(input:{transactionReference:string;amount:number;comments?:string;idempotencyKey:string})=>call<typeof input,{refundId:string;status:string}>("requestCommerceRefund",input);
export async function listCommerceOrders(status?:string){ const constraints=status?[where("status","==",status),orderBy("createdAt","desc"),limit(200)]:[orderBy("createdAt","desc"),limit(200)]; const snap=await getDocs(query(collection(db,"commerceOrders"),...constraints)); return snap.docs.map(doc=>({id:doc.id,...doc.data()} as CommerceOrder)); }
export async function listCommercePayments(status?:string){ const constraints=status?[where("status","==",status),orderBy("createdAt","desc"),limit(200)]:[orderBy("createdAt","desc"),limit(200)]; const snap=await getDocs(query(collection(db,"payments"),...constraints)); return snap.docs.map(doc=>({id:doc.id,...doc.data()} as CommercePayment)); }
export async function listCommerceRefunds(status?:string){ const constraints=status?[where("status","==",status),orderBy("createdAt","desc"),limit(200)]:[orderBy("createdAt","desc"),limit(200)]; const snap=await getDocs(query(collection(db,"refunds"),...constraints)); return snap.docs.map(doc=>({id:doc.id,...doc.data()} as CommerceRefund)); }
