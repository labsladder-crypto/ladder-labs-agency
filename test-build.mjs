import { build } from 'vite';
import fs from 'fs';
build().catch(e => {
    fs.writeFileSync('error.json', JSON.stringify({
        message: e.message,
        code: e.code,
        frame: e.frame,
        loc: e.loc
    }, null, 2));
    process.exit(1);
});
