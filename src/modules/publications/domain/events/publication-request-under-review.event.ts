import { DomainEvent } from '../../../../shared-kernel/domain/domain-event.base';
import { UniqueId } from '../../../../shared-kernel/domain/unique-id.value-object';

export class PublicationRequestUnderReview extends DomainEvent {
  public readonly publicationRequestId: UniqueId;
  public readonly referenceNumber: string;
  public readonly startedByAdminId: string;

  public constructor(
    publicationRequestId: UniqueId,
    referenceNumber: string,
    startedByAdminId: string,
  ) {
    super();
    this.publicationRequestId = publicationRequestId;
    this.referenceNumber = referenceNumber;
    this.startedByAdminId = startedByAdminId;
  }

  public get eventName(): string {
    return 'PublicationRequestUnderReview';
  }
}
