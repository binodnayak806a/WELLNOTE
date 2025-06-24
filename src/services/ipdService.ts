// src/services/ipdService.ts
import { createTenantQuery, ServiceResult } from './supabaseClient';
import type { TableRow } from './supabaseClient';

export type IPDRecord = TableRow<'ipd_admissions'>;

export const ipdService = {
  async getIPDRecords(hospitalId: string): Promise<ServiceResult<IPDRecord[]>> {
    try {
      const query = createTenantQuery(hospitalId);
      const { data, error } = await query.select('ipd_admissions');

      if (error) {
        console.error('Error fetching IPD records:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data: data || [] };
    } catch (e) {
      const error = e as Error;
      console.error('Exception in getIPDRecords:', error);
      return { success: false, error: error.message };
    }
  },
};