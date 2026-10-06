import { round2 } from "./calc";

export interface HourlyInput {
  /** Sueldo neto mensual que quieres ganar (después de impuestos) */
  netMonthly: number;
  /** Gastos mensuales de la actividad (software, equipo, coworking…) */
  expensesMonthly: number;
  /** Cuota de autónomos mensual */
  quotaMonthly: number;
  /** Tipo efectivo estimado de IRPF (%) */
  taxRate: number;
  /** Semanas no facturables al año (vacaciones, festivos, bajas) */
  weeksOff: number;
  /** Horas facturables a la semana */
  billableHours: number;
}

export function hourlyRate(i: HourlyInput) {
  const tax = Math.min(Math.max(i.taxRate, 0), 60) / 100;
  const netYear = i.netMonthly * 12;
  const grossForSalary = tax < 1 ? netYear / (1 - tax) : 0;
  const expensesYear = (i.expensesMonthly + i.quotaMonthly) * 12;
  const revenueYear = grossForSalary + expensesYear;
  const hoursYear = Math.max(0, 52 - i.weeksOff) * Math.max(0, i.billableHours);
  return {
    revenueYear: round2(revenueYear),
    revenueMonth: round2(revenueYear / 12),
    taxesYear: round2(grossForSalary - netYear),
    expensesYear: round2(expensesYear),
    hoursYear,
    rate: hoursYear > 0 ? round2(revenueYear / hoursYear) : 0,
    dayRate: hoursYear > 0 ? round2((revenueYear / hoursYear) * 8) : 0,
  };
}
