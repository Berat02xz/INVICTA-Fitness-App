const fs = require('fs');
let code = fs.readFileSync('app/(screens)/WorkoutPlayer.tsx', 'utf8');

// Reverse the bottom sheet style
code = code.replace(
  "<View style={{ flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingTop: 40, paddingHorizontal: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 15 }}>",
  "<View style={{ flex: 1, backgroundColor: '#121212', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingTop: 40, paddingHorizontal: 24 }}>"
);

// Title text back to white AND marquee via ScrollView
code = code.replace(
  "<Text style={{ color: '#000', fontSize: 28, fontFamily: theme.black, textTransform: 'uppercase' }} numberOfLines={2}>{currentExercise.name}</Text>",
  "<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}><Text style={{ color: '#fff', fontSize: 28, fontFamily: theme.black, textTransform: 'uppercase', marginRight: 40 }}>{currentExercise.name}</Text></ScrollView>"
);

// Exercise X/Y back to white/alpha
code = code.replace(
  "<Text style={{ color: 'rgba(0,0,0,0.6)', fontSize: 16, fontFamily: theme.medium, marginTop: 4 }}>\n                                    Exercise {currentIndex + 1}/{totalExercises}\n                                </Text>",
  "<Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, fontFamily: theme.medium, marginTop: 4 }}>\n                                    Exercise {currentIndex + 1}/{totalExercises}\n                                </Text>"
);

// List Icon Color
code = code.replace(
  "<Pressable onPress={() => handleOpenSheet(\"upNext\")} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' }}>",
  "<Pressable onPress={() => handleOpenSheet(\"upNext\")} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>"
);

// Stats logic back to white
code = code.replace(
  "<Text style={{ color: '#000', fontSize: 20, fontFamily: theme.bold }}>{formatTime(totalElapsed)}</Text>",
  "<Text style={{ color: '#fff', fontSize: 20, fontFamily: theme.bold }}>{formatTime(totalElapsed)}</Text>"
);
code = code.replace(
  "<Text style={{ color: 'rgba(0,0,0,0.5)', fontSize: 12, fontFamily: theme.medium }}>Total time</Text>",
  "<Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: theme.medium }}>Total time</Text>"
);

code = code.replace(
  "<Animated.Text style={{ color: '#000', fontSize: 28, fontFamily: theme.black, transform: [{ scale: calPulseAnim }] }}>",
  "<Animated.Text style={{ color: '#fff', fontSize: 28, fontFamily: theme.bold, transform: [{ scale: calPulseAnim }] }}>"
);
code = code.replace(
  "<Text style={{ color: 'rgba(0,0,0,0.5)', fontSize: 12, fontFamily: theme.medium }}>Burned</Text>",
  "<Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: theme.medium }}>Burned</Text>"
);

code = code.replace(
  "<Text style={{ color: '#000', fontSize: 20, fontFamily: theme.bold }}>{Math.round(((currentIndex + 1) / totalExercises) * 100)}%</Text>",
  "<Text style={{ color: '#fff', fontSize: 20, fontFamily: theme.medium }}>{Math.round(((currentIndex + 1) / totalExercises) * 100)}%</Text>"
);
code = code.replace(
  "<Text style={{ color: 'rgba(0,0,0,0.5)', fontSize: 12, fontFamily: theme.medium }}>Completed</Text>",
  "<Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: theme.medium }}>Completed</Text>"
);

// Prev Button
code = code.replace(
  "style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' }}",
  "style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#2C2C2E', alignItems: 'center', justifyContent: 'center' }}"
);
code = code.replace(
  "<Ionicons name=\"play-skip-back\" size={24} color={(currentIndex === 0 && currentSet === 1) ? \"rgba(0,0,0,0.3)\" : \"#000\"} />",
  "<Ionicons name=\"play-skip-back\" size={24} color={(currentIndex === 0 && currentSet === 1) ? \"rgba(255,255,255,0.3)\" : \"rgba(255,255,255,0.6)\"} />"
);

// Animate the tiny divider lines under stats using progressWidth
code = code.replace(
  "<View style={{ height: 2, backgroundColor: D.primary, width: '100%', marginTop: 8 }} />",
  "<View style={{ height: 2, backgroundColor: 'rgba(255,255,255,0.1)', width: '100%', marginTop: 8, overflow: 'hidden' }}><Animated.View style={{ height: '100%', backgroundColor: D.primary, width: progressWidth }} /></View>"
);
code = code.replace(
  "<View style={{ height: 2, backgroundColor: '#444', width: '100%', marginTop: 8 }} />",
  "<View style={{ height: 2, backgroundColor: 'rgba(255,255,255,0.1)', width: '100%', marginTop: 8, overflow: 'hidden' }}><Animated.View style={{ height: '100%', backgroundColor: D.primary, width: progressWidth }} /></View>"
);

// In REST, change SKIP to Start Exercise
code = code.replace(
  "<Text style={{ color: '#000', fontFamily: theme.medium, fontSize: 18 }}>Skip</Text>",
  "<Text style={{ color: '#000', fontFamily: theme.medium, fontSize: 16 }}>Start Exercise</Text>"
);

fs.writeFileSync('app/(screens)/WorkoutPlayer.tsx', code);
