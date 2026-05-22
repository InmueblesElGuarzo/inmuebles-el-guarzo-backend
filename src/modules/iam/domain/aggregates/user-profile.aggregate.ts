/**
 * UserProfile — Aggregate Root del modulo IAM.
 *
 * Representa un usuario interno del sistema (administrador o asesor)
 * con sus datos de negocio. ES DISTINTO del usuario de Supabase Auth:
 *
 *   - Supabase Auth maneja credenciales, sesiones, recuperacion de
 *     password, MFA. Es el Identity Provider Federado (IdP).
 *   - UserProfile maneja datos del negocio: nombre, rol, estado activo,
 *     telefono, ultimo login.
 *
 * El vinculo entre ambos es el UUID: el id del UserProfile coincide
 * 1:1 con auth.users.id de Supabase. Cuando un usuario autentica por
 * primera vez, el interactor EnsureUserProfileExists crea el UserProfile
 * correspondiente con el mismo UUID.
 *
 * Lifecycle modelado en este hito:
 *   - create(): instancia un UserProfile nuevo. Emite UserProfileCreated.
 *   - recordLogin(): actualiza lastLoginAt. Emite UserLoggedIn. Lanza
 *     InactiveUserCannotLoginException si el usuario esta inactivo.
 *   - fromPersistence(): reconstruccion desde BD sin emitir eventos.
 *
 * Lifecycle NO modelado (deuda tecnica explicita, se anade con sus HU):
 *   - deactivate() / reactivate() — HU-06, HU-07.
 *   - changeEmail(), changeFullName(), changeRole() — sin HU asignada.
 *
 * → CAPA: Entities (Uncle Bob)
 */

import { AggregateRoot } from '../../../../shared-kernel/domain/aggregate-root.base';
import { Maybe } from '../../../../shared-kernel/domain/maybe';
import { UniqueId } from '../../../../shared-kernel/domain/unique-id.value-object';

import { UserLoggedIn } from '../events/user-logged-in.event';
import { UserProfileCreated } from '../events/user-profile-created.event';
import { InactiveUserCannotLoginException } from '../exceptions/inactive-user-cannot-login.exception';
import { Email } from '../../../../shared-kernel/domain/value-objects/email.value-object';
import { FullName } from '../../../../shared-kernel/domain/value-objects/full-name.value-object';
import { UserRole } from '../value-objects/user-role.value-object';

interface UserProfileProps {
  id: UniqueId;
  email: Email;
  fullName: FullName;
  phone: Maybe<string>;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: Maybe<Date>;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateUserProfileInput {
  id: UniqueId;
  email: Email;
  fullName: FullName;
  phone: Maybe<string>;
  role: UserRole;
}

export class UserProfile extends AggregateRoot<UniqueId> {
  private readonly _email: Email;
  private readonly _fullName: FullName;
  private readonly _phone: Maybe<string>;
  private readonly _role: UserRole;
  private readonly _isActive: boolean;
  private _lastLoginAt: Maybe<Date>;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: UserProfileProps) {
    super(props.id);
    this._email = props.email;
    this._fullName = props.fullName;
    this._phone = props.phone;
    this._role = props.role;
    this._isActive = props.isActive;
    this._lastLoginAt = props.lastLoginAt;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  /**
   * Crea un UserProfile nuevo. Emite UserProfileCreated.
   *
   * Usar cuando un usuario aparece por primera vez (provisioning desde
   * Supabase Auth, o creacion manual de asesor por administrador).
   */
  public static create(input: CreateUserProfileInput): UserProfile {
    const now = new Date();

    const profile = new UserProfile({
      id: input.id,
      email: input.email,
      fullName: input.fullName,
      phone: input.phone,
      role: input.role,
      isActive: true,
      lastLoginAt: Maybe.none<Date>(),
      createdAt: now,
      updatedAt: now,
    });

    profile.addDomainEvent(
      new UserProfileCreated(profile.id, profile._email.value, profile._role.value),
    );

    return profile;
  }

  /**
   * Reconstruye un UserProfile desde la persistencia. NO emite eventos.
   *
   * Usar EXCLUSIVAMENTE desde el repositorio (mapper Prisma → dominio).
   * Los estados que vienen de la BD ya ocurrieron y se auditaron en su
   * momento; reemitir eventos aqui generaria duplicados en el audit_log.
   */
  public static fromPersistence(props: UserProfileProps): UserProfile {
    return new UserProfile(props);
  }

  /**
   * Registra un login exitoso. Actualiza lastLoginAt y emite UserLoggedIn.
   *
   * Lanza InactiveUserCannotLoginException si el usuario esta inactivo.
   *
   * Decision de diseno: este metodo lanza excepcion en lugar de retornar
   * Result<void, ...> porque (a) tiene un solo modo de falla bien
   * documentado, (b) la excepcion ya tiene type=FORBIDDEN que mapea a
   * HTTP 403 via el filter, y (c) el interactor no tiene logica que
   * hacer ante esta falla mas alla de propagarla. Cuando un metodo de
   * aggregate tenga multiples modos de falla o el interactor necesite
   * elegir entre paths, usaremos Result en su lugar.
   */
  public recordLogin(): void {
    if (!this._isActive) {
      throw new InactiveUserCannotLoginException(this.id.value);
    }

    const now = new Date();
    this._lastLoginAt = Maybe.some(now);
    this._updatedAt = now;

    this.addDomainEvent(new UserLoggedIn(this.id, this._role.value, now));
  }

  // Getters: exponen estado de solo lectura. Las mutaciones siempre
  // pasan por metodos con nombre de operacion del negocio (recordLogin,
  // y mas adelante deactivate, reactivate, etc.).

  public get email(): Email {
    return this._email;
  }

  public get fullName(): FullName {
    return this._fullName;
  }

  public get phone(): Maybe<string> {
    return this._phone;
  }

  public get role(): UserRole {
    return this._role;
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  public get lastLoginAt(): Maybe<Date> {
    return this._lastLoginAt;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }
}
