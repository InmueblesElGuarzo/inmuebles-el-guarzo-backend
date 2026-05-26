import { Inject, Injectable } from '@nestjs/common';

import { DomainEvent } from '../../../../shared-kernel/domain/domain-event.base';
import {
  EventHandler,
  TransactionContext,
} from '../../../../shared-kernel/infrastructure/event-bus/event-handler.port';
import { PublicationRequestRejected } from '../../../publications/domain/events/publication-request-rejected.event';
import {
  NOTIFICATION_CATALOG,
  NOTIFICATION_WORKFLOWS,
  NotificationCatalogPort,
} from '../ports/output/notification-catalog.port';

@Injectable()
export class OnPublicationRequestRejectedHandler implements EventHandler {
  public constructor(
    @Inject(NOTIFICATION_CATALOG)
    private readonly notificationCatalog: NotificationCatalogPort,
  ) {}

  public async handle(event: DomainEvent, _tx?: TransactionContext): Promise<void> {
    if (!(event instanceof PublicationRequestRejected)) {
      return;
    }

    await this.notificationCatalog.trigger({
      workflowId: NOTIFICATION_WORKFLOWS.PUBLICATION_REJECTED,
      subscriberId: event.ownerEmail,
      payload: {
        ownerFullName: event.ownerFullName,
        referenceNumber: event.referenceNumber,
        decisionMotive: event.decisionMotive,
      },
    });
  }
}
