const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/workout/index.tsx', 'utf8');

code = code.replace(
  "width: SCREEN_W - 40,",
  "width: SCREEN_W * 0.72,"
);

code = code.replace(
  "snapToInterval={SCREEN_W - 40 + 16}",
  "snapToInterval={SCREEN_W * 0.72 + 16}"
);

code = code.replace(
  "{routine.title}",
  "{routine.name}"
);

fs.writeFileSync('app/(tabs)/workout/index.tsx', code);
console.log('done');
