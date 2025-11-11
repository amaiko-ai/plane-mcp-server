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
  state?: string;
  description_html?: string;
  assignees?: string[];
}

export interface PlaneIntakeItem {
  issue_detail: PlaneIssueDetail;
  status: number;
}

export interface PlaneIntakeResponse {
  results: PlaneIntakeItem[];
}

export interface PlaneProject {
  id: string;
  name: string;
  identifier: string;
  description: string;
  created_at: string;
}

export interface PlaneLabel {
  id: string;
  name: string;
  color: string;
  description: string;
}

export interface PlaneState {
  id: string;
  name: string;
  color: string;
  group: string;
  description: string;
}

export interface PlaneWorkspaceMember {
  id: string;
  member: {
    id: string;
    display_name: string;
    email: string;
  };
  role: number;
}

export interface PlaneComment {
  id: string;
  comment_html: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface PlaneIssue {
  id: string;
  sequence_id: number;
  name: string;
  priority: string;
  state: string;
  created_at: string;
  description_html: string;
  labels: string[];
  assignees: string[];
}

export interface PaginatedResponse<T> {
  next_cursor: string | null;
  prev_cursor: string | null;
  next_page_results: boolean;
  prev_page_results: boolean;
  count: number;
  total_pages: number;
  total_results: number;
  results: T[];
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
