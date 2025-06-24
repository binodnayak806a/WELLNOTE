
// src/services/consultationService.ts
import { createTenantQuery, ServiceResult } from './supabaseClient';
import type { TableRow } from './supabaseClient';

export type Consultation = TableRow<'consultations'>;

export const consultationService = {
  async getConsultations(hospitalId: string): Promise<ServiceResult<Consultation[]>> {
    try {
      const query = createTenantQuery(hospitalId);
      const { data, error } = await query.select('consultations');

      if (error) {
        console.error('Error fetching consultations:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data: data || [] };
    } catch (e) {
      const error = e as Error;
      console.error('Exception in getConsultations:', error);
      return { success: false, error: error.message };
    }
  },
};