// src/services/billingService.ts
import { createTenantQuery, ServiceResult } from './supabaseClient';
import type { TableRow } from './supabaseClient';

export type Bill = TableRow<'bills'>;

export const billingService = {
  async getBills(hospitalId: string): Promise<ServiceResult<Bill[]>> {
    try {
      const query = createTenantQuery(hospitalId);
      const { data, error } = await query.select('bills');

      if (error) {
        console.error('Error fetching bills:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data: data || [] };
    } catch (e) {
      const error = e as Error;
      console.error('Exception in getBills:', error);
      return { success: false, error: error.message };
    }
  },
};