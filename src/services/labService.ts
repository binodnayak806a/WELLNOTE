// src/services/labService.ts
import { createTenantQuery, ServiceResult } from './supabaseClient';
import type { TableRow } from './supabaseClient';

export type LabTest = TableRow<'lab_tests'>;
export type LabResult = TableRow<'lab_results'>;

export const labService = {
  async getLabTests(hospitalId: string): Promise<ServiceResult<LabTest[]>> {
    try {
      const query = createTenantQuery(hospitalId);
      const { data, error } = await query.select('lab_tests');

      if (error) {
        console.error('Error fetching lab tests:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data: data || [] };
    } catch (e) {
      const error = e as Error;
      console.error('Exception in getLabTests:', error);
      return { success: false, error: error.message };
    }
  },
};