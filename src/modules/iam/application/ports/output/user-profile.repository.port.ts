/**
 * UserProfileRepositoryPort — Puerto de salida del modulo IAM hacia la
 * persistencia de UserProfiles.
 *
 * Define el contrato que el dominio necesita para cargar y guardar
 * UserProfiles, sin saber NADA de Prisma, Postgres ni ningun otro
 * detalle de infraestructura. La implementacion concreta vive en
 * iam/infrastructure/persistence/prisma/.
 *
 * Si manana cambiamos de Prisma a TypeORM, o de Postgres a SQL Server,
 * o agregamos caching con Redis delante de la BD: solo cambia el
 * adapter. Este puerto y todos los interactors que lo consumen quedan
 * intactos.
 *
 * Decision sobre transacciones: el parametro `tx` es opcional. Cuando
 * se pasa, el adapter ejecuta usando esa TransactionContext (compartida
 * con otras operaciones del mismo $transaction). Cuando NO se pasa, el
 * adapter usa el cliente de Prisma directo, sin transaccion. Esto
 * permite que el mismo metodo sirva para lecturas standalone como para
 * operaciones que se componen dentro de una transaccion.
 *
 * → CAPA: Use Cases (Uncle Bob)
 */

import { Maybe } from '../../../../../shared-kernel/domain/maybe';
import { UniqueId } from '../../../../../shared-kernel/domain/unique-id.value-object';
import { TransactionContext } from '../../../../../shared-kernel/infrastructure/event-bus/event-handler.port';

import { UserProfile } from '../../../domain/aggregates/user-profile.aggregate';

export interface UserProfileRepositoryPort {
  /**
   * Busca un UserProfile por su id (que coincide con auth.users.id de
   * Supabase). Retorna Maybe.none() si no existe en BD.
   *
   * NUNCA lanza si el usuario no existe — esa es informacion de negocio
   * legitima, representada por Maybe.none(). Solo lanza ante fallos de
   * infraestructura (BD inaccesible, timeout, etc.).
   */
  findById(id: UniqueId, tx?: TransactionContext): Promise<Maybe<UserProfile>>;

  /**
   * Persiste un UserProfile (insert si es nuevo, update si ya existe).
   * El adapter detecta el caso por el id mediante upsert.
   *
   * Tipicamente se llama dentro de una $transaction junto con la
   * publicacion de eventos del aggregate (eventBus.publish), para
   * garantizar que la persistencia y los efectos de los eventos sean
   * atomicos: si un handler falla, to do se revierte.
   */
  save(userProfile: UserProfile, tx?: TransactionContext): Promise<void>;
}

/**
 * Symbol token para inyeccion de dependencias en NestJS. Uso:
 *
 *   { provide: USER_PROFILE_REPOSITORY, useClass: UserProfilePrismaRepositoryAdapter }
 *
 * Y en el consumidor:
 *
 *   constructor(@Inject(USER_PROFILE_REPOSITORY) private readonly repo: UserProfileRepositoryPort) {}
 */
export const USER_PROFILE_REPOSITORY = Symbol('UserProfileRepository');
