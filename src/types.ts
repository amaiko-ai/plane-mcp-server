/**
 * Type definitions for Plane API
 */

export interface PlaneIssueDetail {
  id: string;
  sequence_id: number;
  name: string;
  priority: string;
  created_at: string;
  labels: string[];
}

export interface PlaneIntakeItem {
  issue_detail: PlaneIssueDetail;
  status: number;
}

export interface PlaneIntakeResponse {
  results: PlaneIntakeItem[];
}

export const IntakeStatus = {
  PENDING: -2,
  DECLINED: -1,
  ACCEPTED: 1,
  DUPLICATE: 2,
} as const;

export function getStatusText(status: number): string {
  switch (status) {
    case IntakeStatus.PENDING:
      return 'pending';
    case IntakeStatus.DECLINED:
      return 'declined';
    case IntakeStatus.ACCEPTED:
      return 'accepted';
    case IntakeStatus.DUPLICATE:
      return 'duplicate';
    default:
      return 'unknown';
  }
}
