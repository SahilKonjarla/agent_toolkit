import { open } from 'node:fs/promises';
import { constants } from 'node:fs';

// Open non-blocking before stat: O_NOFOLLOW alone does not prevent a FIFO from wedging open().
export async function readRegularText(path, maximum = 256000, tail = false) {
  const file = await open(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0) | (constants.O_NONBLOCK ?? 0));
  try {
    const stat = await file.stat();
    if (!stat.isFile()) throw new Error('Not a regular artifact file');
    if (!tail && stat.size > maximum) throw new Error('Artifact exceeds read limit');
    const buffer = Buffer.alloc(Math.min(maximum, stat.size));
    const { bytesRead } = await file.read(buffer, 0, buffer.length, tail ? Math.max(0, stat.size - buffer.length) : 0);
    return buffer.subarray(0, bytesRead).toString('utf8');
  } finally { await file.close(); }
}
