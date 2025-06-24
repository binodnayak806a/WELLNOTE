// src/services/masterService.ts
import { supabase } from '@/lib/supabase';
import { ServiceResult } from './supabaseClient';
import type { TableRow } from './supabaseClient';

export type MasterDiagnosis = TableRow<'master_diagnosis'>;
export type MasterAdvice = TableRow<'master_advice'>;

export const masterService = {
  // Master data is typically not tenant-specific, so we use the global client
  async getMasterDiagnosis(): Promise<ServiceResult<MasterDiagnosis[]>> {
    try {
      const { data, error } = await supabase.from('master_diagnosis').select('*');
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data: data || [] };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  async getMasterAdvice(): Promise<ServiceResult<MasterAdvice[]>> {
    try {
      const { data, error } = await supabase.from('master_advice').select('*');
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data: data || [] };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },
};