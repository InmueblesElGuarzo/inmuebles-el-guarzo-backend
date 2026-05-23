import { Inject, Injectable } from '@nestjs/common';

import { DomainEvent } from '../../../../shared-kernel/domain/domain-event.base';
import {
  EventHandler,
  TransactionContext,
} from '../../../../shared-kernel/infrastructure/event-bus/event-handler.port';
import { PublicationRequestRejected } from '../../../publications/domain/events/publication-request-rejected.event';
import { EmailTemplates } from '../../infrastructure/resend/email-templates';
import { EMAIL_SENDER, EmailSenderPort } from '../ports/output/email-sender.port';

@Injectable()
export class OnPublicationRequestRejectedHandler implements EventHandler {
  public constructor(@Inject(EMAIL_SENDER) private readonly emailSender: EmailSenderPort) {}

  public async handle(event: DomainEvent, _tx?: TransactionContext): Promise<void> {
    if (!(event instanceof PublicationRequestRejected)) {
      return;
    }

    await this.emailSender.send({
      to: event.ownerEmail,
      subject: 'Tu solicitud de publicación no fue aprobada',
      html: EmailTemplates.buildRejectionEmail(
        event.ownerFullName,
        event.referenceNumber,
        event.decisionMotive,
      ),
    });
  }
}
