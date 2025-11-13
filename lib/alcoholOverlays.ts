// lib/alcoholOverlays.ts
// Helper functions for alcohol overlays in charts

import { format, parseISO, isSameDay } from 'date-fns';

/**
 * Get alcohol overlay positions for chart data points
 * @param alcoholDates Array of dates with alcohol consumption (ISO format strings)
 * @param chartDates Array of chart data point dates (ISO format strings or Date objects)
 * @returns Array of indices where alcohol overlays should be displayed
 */
export function getAlcoholOverlayPositions(
  alcoholDates: string[],
  chartDates: (string | Date)[]
): number[] {
  if (!alcoholDates || alcoholDates.length === 0) {
    return [];
  }

  if (!chartDates || chartDates.length === 0) {
    return [];
  }

  const positions: number[] = [];

  chartDates.forEach((chartDate, index) => {
    const chartDateObj = typeof chartDate === 'string' ? parseISO(chartDate) : chartDate;

    const hasAlcohol = alcoholDates.some((alcoholDate) => {
      const alcoholDateObj = parseISO(alcoholDate);
      return isSameDay(chartDateObj, alcoholDateObj);
    });

    if (hasAlcohol) {
      positions.push(index);
    }
  });

  return positions;
}

/**
 * Check if a specific date has alcohol consumption
 * @param date Date to check (ISO string or Date object)
 * @param alcoholDates Array of dates with alcohol (ISO strings)
 * @returns boolean indicating if date has alcohol
 */
export function hasAlcoholOnDate(
  date: string | Date,
  alcoholDates: string[]
): boolean {
  if (!alcoholDates || alcoholDates.length === 0) {
    return false;
  }

  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  return alcoholDates.some((alcoholDate) => {
    const alcoholDateObj = parseISO(alcoholDate);
    return isSameDay(dateObj, alcoholDateObj);
  });
}

/**
 * Format date for alcohol overlay display
 * @param date Date to format (ISO string or Date object)
 * @returns Formatted string for tooltip/label
 */
export function formatAlcoholOverlayDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, "d 'de' MMM");
}

