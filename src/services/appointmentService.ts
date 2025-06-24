// src/services/appointmentService.ts
import { createTenantQuery, ServiceResult } from './supabaseClient';
import type { TableRow } from './supabaseClient';

export type Appointment = TableRow<'appointments'>;

export const appointmentService = {
  async getAppointmentsByDate(date: string, hospitalId: string): Promise<ServiceResult<Appointment[]>> {
    try {
      const query = createTenantQuery(hospitalId);
      const { data, error } = await query.select('appointments').eq('appointment_date', date);

      if (error) {
        console.error('Error fetching appointments by date:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data: data || [] };
    } catch (e) {
      const error = e as Error;
      console.error('Exception in getAppointmentsByDate:', error);
      return { success: false, error: error.message };
    }
  },
};