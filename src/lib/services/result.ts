/**
 * Data service layer.
 *
 * Every function here is `async` and returns plain domain objects, exactly like
 * a REST client would. Today they persist to localStorage; to connect a backend
 * later, replace the bodies with `fetch()` calls — contexts and components do
 * not need to change.
 */

export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export const ok = <T>(data: T): Result<T> => ({ ok: true, data });
export const fail = <T = never>(error: string): Result<T> => ({ ok: false, error });

