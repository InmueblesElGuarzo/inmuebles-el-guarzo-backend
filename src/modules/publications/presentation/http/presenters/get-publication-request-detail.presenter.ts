import { GetPublicationRequestDetailOutput } from '../../../application/use-cases/get-publication-request-detail/dtos/get-publication-request-detail-output.dto';

export interface GetPublicationRequestDetailHttpResponse {
  id: string;
  referenceNumber: string;
  ownerFullName: string;
  ownerEmail: string;
  ownerPhonePrimary: string;
  ownerPhoneSecondary: string | null;
  ownerDocumentType: string | null;
  ownerDocumentNumber: string | null;
  proposedPropertyTypeId: string | null;
  proposedOfferType: string;
  proposedLocation: string;
  proposedAreaM2: number | null;
  proposedDescription: string;
  proposedExpectedPrice: number | null;
  status: string;
  assignedAdvisorId: string | null;
  decisionAt: string | null;
  decisionByAdminId: string | null;
  decisionMotive: string | null;
  captchaValidated: boolean;
  submittedFromIp: string | null;
  submittedFromUserAgent: string | null;
  createdAt: string;
  updatedAt: string;
}

export class GetPublicationRequestDetailPresenter {
  public static toHttp(
    output: GetPublicationRequestDetailOutput,
  ): GetPublicationRequestDetailHttpResponse {
    return {
      id: output.id,
      referenceNumber: output.referenceNumber,
      ...GetPublicationRequestDetailPresenter.mapOwner(output),
      ...GetPublicationRequestDetailPresenter.mapProposal(output),
      status: output.status,
      ...GetPublicationRequestDetailPresenter.mapDecision(output),
      captchaValidated: output.captchaValidated,
      createdAt: output.createdAt.toISOString(),
      updatedAt: output.updatedAt.toISOString(),
    };
  }

  private static mapOwner(output: GetPublicationRequestDetailOutput): {
    ownerFullName: string;
    ownerEmail: string;
    ownerPhonePrimary: string;
    ownerPhoneSecondary: string | null;
    ownerDocumentType: string | null;
    ownerDocumentNumber: string | null;
  } {
    return {
      ownerFullName: output.ownerFullName,
      ownerEmail: output.ownerEmail,
      ownerPhonePrimary: output.ownerPhonePrimary,
      ownerPhoneSecondary: output.ownerPhoneSecondary ?? null,
      ownerDocumentType: output.ownerDocumentType ?? null,
      ownerDocumentNumber: output.ownerDocumentNumber ?? null,
    };
  }

  private static mapProposal(output: GetPublicationRequestDetailOutput): {
    proposedPropertyTypeId: string | null;
    proposedOfferType: string;
    proposedLocation: string;
    proposedAreaM2: number | null;
    proposedDescription: string;
    proposedExpectedPrice: number | null;
  } {
    return {
      proposedPropertyTypeId: output.proposedPropertyTypeId ?? null,
      proposedOfferType: output.proposedOfferType,
      proposedLocation: output.proposedLocation,
      proposedAreaM2: output.proposedAreaM2 ?? null,
      proposedDescription: output.proposedDescription,
      proposedExpectedPrice: output.proposedExpectedPrice ?? null,
    };
  }

  private static mapDecision(output: GetPublicationRequestDetailOutput): {
    assignedAdvisorId: string | null;
    decisionAt: string | null;
    decisionByAdminId: string | null;
    decisionMotive: string | null;
    submittedFromIp: string | null;
    submittedFromUserAgent: string | null;
  } {
    return {
      assignedAdvisorId: output.assignedAdvisorId ?? null,
      decisionAt: output.decisionAt?.toISOString() ?? null,
      decisionByAdminId: output.decisionByAdminId ?? null,
      decisionMotive: output.decisionMotive ?? null,
      submittedFromIp: output.submittedFromIp ?? null,
      submittedFromUserAgent: output.submittedFromUserAgent ?? null,
    };
  }
}
