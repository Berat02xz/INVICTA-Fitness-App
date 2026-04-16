const fs = require('fs');
let code = fs.readFileSync('app/(screens)/WorkoutPlayer.tsx', 'utf8');

code = code.replace(
  "<Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, fontFamily: theme.medium, marginTop: 4 }}>\n                                    Exercise {currentIndex + 1}/{totalExercises}\n                                </Text>",
  "<Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, fontFamily: theme.medium, marginTop: 4 }}>\n                                    Set {Math.min(currentSet, currentExercise.sets)}/{currentExercise.sets}   •   Exercise {currentIndex + 1}/{totalExercises}\n                                </Text>"
);

fs.writeFileSync('app/(screens)/WorkoutPlayer.tsx', code);
console.log('Fixed player title stats');