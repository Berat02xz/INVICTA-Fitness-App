const fs = require('fs');
let code = fs.readFileSync('app/(screens)/WorkoutPlayer.tsx', 'utf8');

code = code.replace(
  '<Ionicons name="chevron-down" size={32} color="#fff" />',
  '<Ionicons name="chevron-down" size={32} color="#000" />'
);

code = code.replace(
  "backgroundColor: 'rgba(255,255,255,0.15)'",
  "backgroundColor: 'rgba(0,0,0,0.1)'"
);
code = code.replace(
  "backgroundColor: 'rgba(255,255,255,0.25)'",
  "backgroundColor: 'rgba(0,0,0,0.15)'"
);
code = code.replace(
  "color: '#fff',\n    fontFamily: theme.bold,\n    fontSize: 14",
  "color: '#000',\n    fontFamily: theme.bold,\n    fontSize: 14"
);

// update timer text
code = code.replace(
  "<Text style={[styles.toggleTextActive, { fontSize: 16, fontWeight: '700' }]}>{formatTime(exerciseTimer)}</Text>",
  "<Text style={[styles.toggleTextActive, { fontSize: 16, fontWeight: '700', color: '#000' }]}>{formatTime(exerciseTimer)}</Text>"
);

fs.writeFileSync('app/(screens)/WorkoutPlayer.tsx', code);
