const fs = require('fs');
let code = fs.readFileSync('app/(screens)/WorkoutPlayer.tsx', 'utf8');

// Title text 
code = code.replace(
  "<Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, fontFamily: theme.medium, marginTop: 4 }}>\n                                    Exercise {currentIndex + 1}/{totalExercises}\n                                </Text>",
  "<Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, fontFamily: theme.medium, marginTop: 4 }}>\n                                    Set {currentSet}/{currentExercise.sets}   •   Exercise {currentIndex + 1}/{totalExercises}\n                                </Text>"
);

// Remove 'Total time' stat (we'll find the block and remove it carefully)
const matchBeforeTotalTime = "<View style={{ flexDirection: 'row', marginTop: 30, justifyContent: 'space-between', alignItems: 'center' }}>";
const totalTimeBlockStart = code.indexOf("<View style={{ alignItems: 'flex-start', flex: 1 }}>");
if (totalTimeBlockStart !== -1) {
    const totalTimeBlockEnd = code.indexOf("</View>", totalTimeBlockStart) + "</View>".length;
    code = code.slice(0, totalTimeBlockStart) + code.slice(totalTimeBlockEnd);
}

// Ensure the other two have correct alignments
code = code.replace(
  "<View style={{ flex: 1, alignItems: 'center' }}>\n                                <Animated.View style={{ transform: [{ scale: fireScaleAnim }, { rotate: fireRotationInterpolate }] }}>",
  "<View style={{ flex: 1, alignItems: 'flex-start' }}>\n                                <Animated.View style={{ transform: [{ scale: fireScaleAnim }, { rotate: fireRotationInterpolate }] }}>"
);

// Update top progress bar to be thicker and darker
code = code.replace(
  "<View style={{ flex: 1, height: 6, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>",
  "<View style={{ flex: 1, height: 12, backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 6, position: 'relative', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' }}>"
);

code = code.replace(
  "backgroundColor: '#000000',\n                         zIndex: 2",
  "backgroundColor: '#ffffff',\n                         zIndex: 2"
);

code = code.replace(
  "backgroundColor: D.primary,\n                     width: progressWidth",
  "backgroundColor: '#000000',\n                     width: progressWidth"
);

fs.writeFileSync('app/(screens)/WorkoutPlayer.tsx', code);
console.log('Fixed player stats');
