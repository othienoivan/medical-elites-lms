import type { EntitlementSnapshot, FeatureKey } from "../domain/feature";
import { canUseFeature } from "../domain/feature";

export interface EntitlementRepository {
  getSnapshot(tenantId: string): Promise<EntitlementSnapshot>;
}

export class EntitlementService {
  private readonly repository: EntitlementRepository;

  constructor(repository: EntitlementRepository) {
    this.repository = repository;
  }

  async canUse(tenantId: string, feature: FeatureKey): Promise<boolean> {
    const snapshot = await this.repository.getSnapshot(tenantId);
    return canUseFeature(snapshot, feature);
  }

  async getLimit(tenantId: string, limitKey: string): Promise<number | undefined> {
    const snapshot = await this.repository.getSnapshot(tenantId);
    return snapshot.limits[limitKey];
  }
}
