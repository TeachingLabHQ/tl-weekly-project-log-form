export interface VendorPaymentSubmission {
  id: number;
  cf_email: string;
  cf_name: string;
  cf_tier: string;
  total_pay: number;
  created_at: string;
  entries: {
    task_name: string;
    project_name: string;
    work_hours: number;
    rate: number;
    entry_pay: number;
  }[];
}

export interface EmailLog {
  id: number;
  submission_id: number;
  month: string;
  sent_at: string | null;
  status: string;
  error_message: string | null;
} 