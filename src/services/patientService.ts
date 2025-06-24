// src/services/patientService.ts
import { createTenantQuery, ServiceResult } from './supabaseClient';
import type { TableRow } from './supabaseClient';

export type Patient = TableRow<'patients'>;

export const patientService = {
  async getPatients(hospitalId: string): Promise<ServiceResult<Patient[]>> {
    try {
      const query = createTenantQuery(hospitalId);
      const { data, error } = await query.select('patients');

      if (error) {
        console.error('Error fetching patients:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data: data || [] };
    } catch (e) {
      const error = e as Error;
      console.error('Exception in getPatients:', error);
      return { success: false, error: error.message };
    }
  },
};