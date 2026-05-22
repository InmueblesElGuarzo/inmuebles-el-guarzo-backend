/**
 * UserProfileMapper — Traduce entre el modelo Prisma y el aggregate UserProfile.
 *
 * toDomain:       UserProfilePrismaModel → UserProfile (para lecturas del repo)
 * toPersistence:  UserProfile → Prisma.UserProfileUncheckedCreateInput (para writes)
 *
 * Convierte entre las tres representaciones de opcionalidad del proyecto:
 *   T | null  (Prisma)  ↔  Maybe<T>  (dominio)  vía fromNullable / toNullable
 *
 * → CAPA: Interface Adapters (Uncle Bob)
 */

import type { Prisma, UserProfile as UserProfilePrismaModel } from '@prisma/client';

import { Maybe } from '../../../../../../shared-kernel/domain/maybe';
import { UniqueId } from '../../../../../../shared-kernel/domain/unique-id.value-object';
import { UserProfile } from '../../../../domain/aggregates/user-profile.aggregate';
import { Email } from '../../../../../../shared-kernel/domain/value-objects/email.value-object';
import { FullName } from '../../../../../../shared-kernel/domain/value-objects/full-name.value-object';
import { UserRole } from '../../../../domain/value-objects/user-role.value-object';

export class UserProfileMapper {
  static toDomain(model: UserProfilePrismaModel): UserProfile {
    return UserProfile.fromPersistence({
      id: UniqueId.fromString(model.id),
      email: Email.create(model.email),
      fullName: FullName.create(model.fullName),
      role: UserRole.create(model.role),
      phone: Maybe.fromNullable(model.phone),
      isActive: model.isActive,
      lastLoginAt: Maybe.fromNullable(model.lastLoginAt),
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  static toPersistence(aggregate: UserProfile): Prisma.UserProfileUncheckedCreateInput {
    return {
      id: aggregate.id.value,
      email: aggregate.email.value,
      fullName: aggregate.fullName.value,
      role: aggregate.role.value,
      phone: aggregate.phone.toNullable(),
      isActive: aggregate.isActive,
      lastLoginAt: aggregate.lastLoginAt.toNullable(),
      createdAt: aggregate.createdAt,
      updatedAt: aggregate.updatedAt,
    };
  }
}
