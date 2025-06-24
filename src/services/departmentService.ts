// src/services/departmentService.ts
import { createTenantQuery, ServiceResult } from './supabaseClient';
import type { TableRow } from './supabaseClient';

export type Department = TableRow<'departments'>;

export const departmentService = {
  async getDepartments(hospitalId: string): Promise<ServiceResult<Department[]>> {
    try {
      const query = createTenantQuery(hospitalId);
      const { data, error } = await query.select('departments');

      if (error) {
        console.error('Error fetching departments:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data: data || [] };
    } catch (e) {
      const error = e as Error;
      console.error('Exception in getDepartments:', error);
      return { success: false, error: error.message };
    }
  },
};