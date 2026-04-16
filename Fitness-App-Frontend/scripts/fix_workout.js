const fs = require('fs');
let code = fs.readFileSync('app/(screens)/WorkoutPlayer.tsx', 'utf8');

// 1. Replace Top-Bar wrapper so it doesn't have black BG
code = code.replace("<View style={{flex: 1, backgroundColor: '#000000'}}>", "<View style={{flex: 1, backgroundColor: '#FFFFFF'}}>");

// 2. Adjust Social Proof Message position
code = code.replace(
  "<Animated.View style={{ position: 'absolute', top: insets.top + 60, flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 }}>",
  "<Animated.View style={{ position: 'absolute', top: insets.top + 130, flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, zIndex: 10 }}>"
);

// 3. Update the Bottom Sheet UI for Workout Player
code = code.replace(
  "<View style={{ flex: 1, backgroundColor: '#121212', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingTop: 40, paddingHorizontal: 24 }}>",
  "<View style={{ flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingTop: 40, paddingHorizontal: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 15 }}>"
);

// Text colors in header of sheet
code = code.replace(
  "<Text style={{ color: '#fff', fontSize: 28, fontFamily: theme.black, textTransform: 'uppercase' }} numberOfLines={2}>{currentExercise.name}</Text>",
  "<Text style={{ color: '#000', fontSize: 28, fontFamily: theme.black, textTransform: 'uppercase' }} numberOfLines={2}>{currentExercise.name}</Text>"
);

code = code.replace(
  "<Text style={{ color: '#fff', fontSize: 16, fontFamily: theme.medium, marginTop: 4 }}>",
  "<Text style={{ color: 'rgba(0,0,0,0.6)', fontSize: 16, fontFamily: theme.medium, marginTop: 4 }}>"
);

// List Button
code = code.replace(
  "backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>\n                                <Ionicons name=\"list\" size={18} color=\"#000\"",
  "backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' }}>\n                                <Ionicons name=\"list\" size={18} color=\"#000\""
);

// Total time text
code = code.replace(
  "<Text style={{ color: '#fff', fontSize: 20, fontFamily: theme.medium }}>{formatTime(totalElapsed)}</Text>\n                                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: theme.medium }}>Total time</Text>",
  "<Text style={{ color: '#000', fontSize: 20, fontFamily: theme.bold }}>{formatTime(totalElapsed)}</Text>\n                                <Text style={{ color: 'rgba(0,0,0,0.5)', fontSize: 12, fontFamily: theme.medium }}>Total time</Text>"
);

// Total burn text
code = code.replace(
  "<Animated.Text style={{ color: '#fff', fontSize: 28, fontFamily: theme.bold, transform: [{ scale: calPulseAnim }] }}>",
  "<Animated.Text style={{ color: '#000', fontSize: 28, fontFamily: theme.black, transform: [{ scale: calPulseAnim }] }}>"
);

code = code.replace(
  "<Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: theme.medium }}>Burned</Text>",
  "<Text style={{ color: 'rgba(0,0,0,0.5)', fontSize: 12, fontFamily: theme.medium }}>Burned</Text>"
);

// Completed text
code = code.replace(
  "<Text style={{ color: '#fff', fontSize: 20, fontFamily: theme.medium }}>{Math.round(((currentIndex + 1) / totalExercises) * 100)}%</Text>\n                                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: theme.medium }}>Completed</Text>",
  "<Text style={{ color: '#000', fontSize: 20, fontFamily: theme.bold }}>{Math.round(((currentIndex + 1) / totalExercises) * 100)}%</Text>\n                                <Text style={{ color: 'rgba(0,0,0,0.5)', fontSize: 12, fontFamily: theme.medium }}>Completed</Text>"
);

// Previous Button
code = code.replace(
  "style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#2C2C2E', alignItems: 'center', justifyContent: 'center' }}",
  "style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' }}"
);

code = code.replace(
  "<Ionicons name=\"play-skip-back\" size={24} color={(currentIndex === 0 && currentSet === 1) ? \"rgba(255,255,255,0.3)\" : \"rgba(255,255,255,0.6)\"} />",
  "<Ionicons name=\"play-skip-back\" size={24} color={(currentIndex === 0 && currentSet === 1) ? \"rgba(0,0,0,0.3)\" : \"#000\"} />"
);

fs.writeFileSync('app/(screens)/WorkoutPlayer.tsx', code);
