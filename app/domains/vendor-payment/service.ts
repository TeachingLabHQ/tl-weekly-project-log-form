import { VendorPaymentRepository, vendorPaymentRepository } from "./repository";
import { Errorable } from "~/utils/errorable";
import {
  VendorPaymentSubmission,
  VendorPaymentSubmissionWithEntries,
  CreateVendorPaymentSubmission,
} from "./model";

export interface VendorPaymentService {
  createSubmission(
    submission: CreateVendorPaymentSubmission
  ): Promise<Errorable<VendorPaymentSubmissionWithEntries>>;
  getSubmissionById(id: number): Promise<Errorable<VendorPaymentSubmissionWithEntries>>;
  getSubmissionsByEmail(email: string): Promise<Errorable<VendorPaymentSubmissionWithEntries[]>>;
  deleteSubmission(id: number): Promise<Errorable<void>>;
}

export function vendorPaymentService(
  repository: VendorPaymentRepository
): VendorPaymentService {
  return {
    createSubmission: async (submission) => {
      return repository.createSubmission(submission);
    },

    getSubmissionById: async (id) => {
      return repository.getSubmissionById(id);
    },

    getSubmissionsByEmail: async (email) => {
      return repository.getSubmissionsByEmail(email);
    },

    deleteSubmission: async (id) => {
      return repository.deleteSubmission(id);
    },
  };
} 