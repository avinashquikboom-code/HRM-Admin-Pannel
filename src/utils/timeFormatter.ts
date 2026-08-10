export function formatTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return '-';
  
  try {
    if (typeof dateString === 'string' && /^\d{1,2}:\d{2}(\:\d{2})?\s?[AP]M$/i.test(dateString.trim())) {
      return dateString.trim();
    }

    const date = typeof dateString === 'string' 
      ? new Date(dateString) 
      : dateString;
    
    if (isNaN(date.getTime())) return '-';
    
    // Format as HH:MM AM/PM (e.g., "09:54 AM")
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return '-';
  }
}

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return '-';
  
  try {
    const date = typeof dateString === 'string' 
      ? new Date(dateString) 
      : dateString;
    
    if (isNaN(date.getTime())) return '-';

    return date.toLocaleDateString('en-US');
  } catch (error) {
    return '-';
  }
}

export function calculateWorkingHours(checkIn: string | Date | null | undefined, checkOut: string | Date | null | undefined): string {
  if (!checkIn || !checkOut) return '-';
  
  try {
    const inTime = typeof checkIn === 'string' ? new Date(checkIn) : checkIn;
    const outTime = typeof checkOut === 'string' ? new Date(checkOut) : checkOut;
    
    if (isNaN(inTime.getTime()) || isNaN(outTime.getTime())) return '-';

    const diffMs = outTime.getTime() - inTime.getTime();
    if (diffMs <= 0) return '-';

    const totalMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  } catch (error) {
    return '-';
  }
}
