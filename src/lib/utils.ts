import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency with AED symbol and millions suffix
 * @param amount - The amount in full (e.g. 2500000)
 * @returns Formatted currency string (e.g. "AED 2.50M")
 */
export const formatCurrency = (amount?: number) => {
  if (amount === null || amount === undefined) return 'AED 0.00M';
  const millions = amount / 1000000;
  return `AED ${millions.toFixed(2)}M`;
};

/**
 * Format date to readable string
 */
export const formatDate = (timestamp?: number, format: 'short' | 'long' | 'datetime' = 'short') => {
  if (!timestamp) return '-';

  const date = new Date(timestamp);

  switch (format) {
    case 'long':
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'datetime':
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    case 'short':
    default:
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
  }
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (timestamp?: number) => {
  if (!timestamp) return '-';

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return formatDate(timestamp, 'short');
};

/**
 * Generate project code (MM-XXXX)
 */
export const generateProjectCode = (lastCode?: string) => {
  if (!lastCode) return "MM-0001";
  const num = parseInt(lastCode.split("-")[1]);
  return `MM-${(num + 1).toString().padStart(4, "0")}`;
};

/**

 * Calculate duration in days between two timestamps

 */

export const calculateDuration = (from?: number, to?: number) => {

  if (!from || !to) return null;

  const diffMs = to - from;

  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));

};



/**

 * Calculate expected commission

 */

export const calculateExpectedCommission = (loanAmount: number, bankRate: number) => {

  return (loanAmount * bankRate) / 100;

};



/**

 * Calculate agent share

 */

export const calculateAgentShare = (commission: number, agentRate: number) => {

  return (commission * agentRate) / 100;

};



/**

 * Calculate referral share

 */

export const calculateReferralShare = (commission: number, referralRate: number) => {

  return (commission * referralRate) / 100;

};


