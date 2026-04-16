const fs = require('fs');
let code = fs.readFileSync('app/(screens)/WorkoutPlayer.tsx', 'utf8');

// I'm going to find the specific block using regex to account for carriage returns.
code = code.replace(/\{\/\* Stats Row \*\/\}\r?\n\s*<View style=\{\{ flexDirection: 'row', marginTop: 30, justifyContent: 'space-between', alignItems: 'center' \}\}>\r?\n\s*<\/View>\r?\n\r?\n\s*<View style=\{\{ flex: 1, alignItems: '(?:center|flex-start)' \}\}>/m, 
`{/* Stats Row */}
                        <View style={{ flexDirection: 'row', marginTop: 30, justifyContent: 'space-between', alignItems: 'center' }}>

                            <View style={{ flex: 1, alignItems: 'flex-start' }}>`);

fs.writeFileSync('app/(screens)/WorkoutPlayer.tsx', code);
console.log('Fixed extra view tag cleanly');
