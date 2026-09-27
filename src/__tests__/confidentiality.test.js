/**
 * Client work is described at sector level only: no client or product names
 * anywhere in the site's source or its case study write-ups.
 *
 * The names are checked by their SHA-256 hashes, never listed in plain text,
 * because this repository is public: a test that spelled them out would leak
 * exactly what it guards. To add a name, hash its lowercase form, e.g.
 *   node -e "console.log(require('crypto').createHash('sha256').update('name').digest('hex'))"
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const FORBIDDEN = new Set([
  '56463f70391d04f7f885c867b32836506c219806c325480a23e7b1cd0a8df979',
  'dae81aa98b38728867f273013316792301db4a2924640c0f16bd11f5e9af4e1b',
  'b03ce31066124010f36267b772dc526af87aaafad09c2b31e6d07d556212d6d8',
  '45affb5817708917332cc351c19ea5a3edf4dc84adbd189f51c4d37b54a84745',
  'a1211da2ed26418a688d42d16c64b34d4c56006fdcfd27afb595f5cfa576ef77',
  '8e928a41b91fd837dede4c086dd5df1fc746a170eb243ed3a04c8325520fc4d6',
  '8ed5fea33ea1fbc23ca9bf9ab224b30e38c18771bf53418fc3e90c242777ba33',
  '55f4a96d581feabd72a08608a0394d7f606c53c8286260011e01e7ded2cce9f6',
  '1956b382c023966c9d278ff4e261f64c8614b62a8ae2e7c3d0a30adbfa44ca2e',
  'f7957cffd395e842fdc94d3d196b79bdbc10d90f9a80130eed69e77054aebac0',
  'a11eb1039b0a1c7c3efaa0ff5ba0ab8ac5e08b1008ff2945c1744237d166db9c',
  'b528a1bb37510c6ea6d93dc307edea06bff5a16b0ed60a8eaa75a8c33cf3a3e3',
]);

const TEXT = /\.(jsx?|css|md|html|json)$/;

const walk = (dir, files = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'assets', 'portfolio_data'].includes(entry.name)) continue;
      walk(full, files);
    } else if (TEXT.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
};

const sha = (word) => crypto.createHash('sha256').update(word).digest('hex');

describe('confidentiality', () => {
  it('names no client or client product in the source or the write-ups', () => {
    const files = [...walk(path.join(ROOT, 'src')), ...walk(path.join(ROOT, 'public', 'markdowns')), path.join(ROOT, 'index.html')];
    const hits = [];
    files.forEach((file) => {
      const words = new Set(fs.readFileSync(file, 'utf8').toLowerCase().match(/[a-z0-9]+/g) || []);
      words.forEach((w) => {
        if (FORBIDDEN.has(sha(w))) hits.push(`${path.relative(ROOT, file)}: a client name (hash ${sha(w).slice(0, 8)})`);
      });
    });
    expect(hits).toEqual([]);
  });

  it('is not vacuous: it reads the files where client work is written', () => {
    const files = walk(path.join(ROOT, 'src')).map((f) => path.relative(ROOT, f).split(path.sep).join('/'));
    expect(files).toContain('src/data/clientWork.js');
    expect(files).toContain('src/data/experience.js');
  });
});
