import { nanoid } from 'nanoid';

/**
 * Attaches a stable `_uid` to each item in an array.
 * Uses the item's existing `_id` or `id` if available,
 * otherwise generates one via nanoid.
 *
 * Call this ONCE when data arrives (e.g. inside useEffect / setState),
 * never inside render — that would create new ids every frame.
 */
export function withUids(items) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => ({
    ...item,
    _uid: item._uid || item._id || item.id || nanoid(),
  }));
}
