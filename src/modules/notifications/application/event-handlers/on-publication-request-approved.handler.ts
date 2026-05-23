import { Inject, Injectable } from '@nestjs/common';

import { DomainEvent } from '../../../../shared-kernel/domain/domain-event.base';
import {
  EventHandler,
  TransactionContext,
} from '../../../../shared-kernel/infrastructure/event-bus/event-handler.port';
import { PublicationRequestApproved } from '../../../publications/domain/events/publication-request-approved.event';
import { EmailTemplates } from '../../infrastructure/resend/email-templates';
import { EMAIL_SENDER, EmailSenderPort } from '../ports/output/email-sender.port';

@Injectable()
export class OnPublicationRequestApprovedHandler implements EventHandler {
  public constructor(@Inject(EMAIL_SENDER) private readonly emailSender: EmailSenderPort) {}

  public async handle(event: DomainEvent, _tx?: TransactionContext): Promise<void> {
    if (!(event instanceof PublicationRequestApproved)) {
      return;
    }

    await this.emailSender.send({
      to: event.ownerEmail,
      subject: 'Tu solicitud de publicación fue aprobada',
      html: EmailTemplates.buildApprovalEmail(event.ownerFullName, event.referenceNumber),
    });
  }
}
