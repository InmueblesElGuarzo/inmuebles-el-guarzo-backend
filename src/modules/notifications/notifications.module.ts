/**
 * NotificationsModule — Wiring de DI para el módulo de notificaciones.
 *
 * En onModuleInit registra los handlers de eventos en el InMemoryEventBus
 * para que reaccionen a decisiones del módulo publications.
 *
 * → CAPA: Frameworks & Drivers (Uncle Bob).
 */

import { Inject, Module, OnModuleInit } from '@nestjs/common';

import { EVENT_BUS, EventBus } from '../../shared-kernel/infrastructure/event-bus/event-bus.port';
import { OnPublicationRequestApprovedHandler } from './application/event-handlers/on-publication-request-approved.handler';
import { OnPublicationRequestRejectedHandler } from './application/event-handlers/on-publication-request-rejected.handler';
import { EMAIL_SENDER } from './application/ports/output/email-sender.port';
import { ResendEmailSenderAdapter } from './infrastructure/resend/resend-email-sender.adapter';

@Module({
  providers: [
    { provide: EMAIL_SENDER, useClass: ResendEmailSenderAdapter },
    OnPublicationRequestApprovedHandler,
    OnPublicationRequestRejectedHandler,
  ],
})
export class NotificationsModule implements OnModuleInit {
  public constructor(
    @Inject(EVENT_BUS) private readonly eventBus: EventBus,
    private readonly approvedHandler: OnPublicationRequestApprovedHandler,
    private readonly rejectedHandler: OnPublicationRequestRejectedHandler,
  ) {}

  public onModuleInit(): void {
    this.eventBus.register('PublicationRequestApproved', this.approvedHandler);
    this.eventBus.register('PublicationRequestRejected', this.rejectedHandler);
  }
}
