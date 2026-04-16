const fs = require('fs');
let code = fs.readFileSync('app/(screens)/WorkoutPlayer.tsx', 'utf8');

code = code.replace(
`                        {/* Stats Row */}
                        <View style={{ flexDirection: 'row', marginTop: 30, justifyContent: 'space-between', alignItems: 'center' }}>
                            
                            </View>

                            <View style={{ flex: 1, alignItems: 'center' }}>`,
`                        {/* Stats Row */}
                        <View style={{ flexDirection: 'row', marginTop: 30, justifyContent: 'space-between', alignItems: 'center' }}>

                            <View style={{ flex: 1, alignItems: 'flex-start' }}>`
);

fs.writeFileSync('app/(screens)/WorkoutPlayer.tsx', code);
console.log('Fixed extra view tag');
