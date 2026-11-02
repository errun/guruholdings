import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const readJson = async (file) => JSON.parse(await readFile(path.join(root, file), 'utf8'));
const snapshot = await readJson('data-generated/snapshots/latest.json');
// Run only after data:build AND data:verify succeed. Every manager must have
// an immutable SEC source and hash before advancing the public check record.
if (snapshot.validation.status !== 'passed' || snapshot.managers.some(m => !m.latestFiling?.infoTableSha256 || !m.latestFiling?.sourceUrl)) {
  throw new Error('Cannot record a successful check for an unvalidated snapshot');
}
const proof = JSON.parse(await readFile(process.argv[2], 'utf8'));
if (proof.status !== 'passed' || proof.generatedAt !== snapshot.generatedAt ||
    proof.managerCount !== snapshot.managers.length || proof.checks.length !== snapshot.managers.length ||
    snapshot.managers.some(m => !proof.checks.some(c => c.managerId === m.id && c.hash === m.latestFiling.infoTableSha256 && c.sourceStatus === 200))) {
  throw new Error('Independent SEC verification does not match the published snapshot');
}
await writeFile(path.join(root, 'data-generated/freshness.json'), JSON.stringify({
  checkedAt: new Date().toISOString(), dataFingerprint: snapshot.dataFingerprint,
  latestQuarter: snapshot.latestQuarter, verifiedManagerCount: snapshot.managers.length,
}, null, 2) + '\n');
console.log(`Recorded successful SEC verification for ${snapshot.managers.length} managers`);
