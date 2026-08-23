import { httpsCallable } from "firebase/functions";
import { functions } from "../config/firebase";
import type { PlatformStatus, TenantType } from "../domains/platform/domain/platformTypes";

type Branding = { logoUrl?: string; logoPath?: string; primaryColor?: string; secondaryColor?: string; accentColor?: string };
export type CreateTenantInput = { name: string; type: TenantType; ownerUserId?: string; country?: string; currency?: string; contactEmail?: string; contactPhone?: string; planId?: string; branding?: Branding };
export type UpdateTenantProfileInput = { tenantId: string; name?: string; country?: string; currency?: string; contactEmail?: string; contactPhone?: string; planId?: string; branding?: Branding };
export async function createTenant(input: CreateTenantInput) { return (await httpsCallable<CreateTenantInput, {tenantId:string}>(functions,"createTenant")(input)).data; }
export async function updateTenantProfile(input: UpdateTenantProfileInput) { return (await httpsCallable<UpdateTenantProfileInput,{tenantId:string}>(functions,"updateTenantProfile")(input)).data; }
export async function updateTenantStatus(input: {tenantId:string; status:PlatformStatus; reason?:string}) { return (await httpsCallable<typeof input,{tenantId:string;status:PlatformStatus}>(functions,"updateTenantStatus")(input)).data; }
export async function assignTenantOwner(input: {tenantId:string; ownerUserId:string}) { return (await httpsCallable<typeof input,{tenantId:string;ownerUserId:string}>(functions,"assignTenantOwner")(input)).data; }
