const fs = require('fs');

const code = fs.readFileSync('app/(tabs)/workout/index.tsx', 'utf8');

// Find featured workouts
const featuredStartIndex = code.indexOf('<FadeTranslate order={0} delay={400} direction="y" translateYFrom={-16}>');
if (featuredStartIndex === -1) {
    console.error("Could not find featured start");
    process.exit(1);
}
// End of featured workouts block is right before the routines block
const routinesStartIndex = code.indexOf('<FadeTranslate order={0} delay={600} direction="y" translateYFrom={16}>');
if (routinesStartIndex === -1) {
    console.error("Could not find routines start");
    process.exit(1);
}

let featuredBlock = code.slice(featuredStartIndex, routinesStartIndex);
let routinesEndIndex = code.indexOf('          </ScrollView>\n        </FadeTranslate>', routinesStartIndex);
let endTextRaw = '          </ScrollView>\n        </FadeTranslate>';
if (routinesEndIndex === -1) {
    console.error("Could not find routines end");
    process.exit(1);
}
const endText = endTextRaw;
const routinesBlock = code.slice(routinesStartIndex, routinesEndIndex + endText.length);

// Manipulate blocks
featuredBlock = featuredBlock.replace('delay={400}', 'delay={600}');
let newRoutinesBlock = routinesBlock.replace('delay={600}', 'delay={400}');

newRoutinesBlock = newRoutinesBlock.replace(
    /const bgColors = \[.*?\];/s,
    `const bgGradients = [
                ["#B855F6", "#8F2CE0"],
                ["#AAFB05", "#81C402"],
                ["#FF4F4F", "#D93636"],
                ["#4FCCFF", "#25A4D9"],
              ];`
);

newRoutinesBlock = newRoutinesBlock.replace(
    'const cardBg = bgColors[idx % bgColors.length];',
    'const cardBg = bgGradients[idx % bgGradients.length];'
);

newRoutinesBlock = newRoutinesBlock.replace(
    'const isLight = cardBg === "#AAFB05" || cardBg === "#4FCCFF";',
    'const isLight = cardBg[0] === "#AAFB05" || cardBg[0] === "#4FCCFF";'
);

newRoutinesBlock = newRoutinesBlock.replace(
    'style={[s.routineCardLarge, { backgroundColor: cardBg }]}',
    'style={[s.routineCardLarge, { overflow: "hidden" }]}'
);

newRoutinesBlock = newRoutinesBlock.replace(
    '<View style={s.routineLargeInner}>',
    `<LinearGradient
                      colors={cardBg}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <View style={s.routineLargeInner}>`
);

const beforeFeatured = code.slice(0, featuredStartIndex);
const afterRoutines = code.slice(routinesEndIndex + endText.length);

const finalCode = beforeFeatured + newRoutinesBlock + "\n\n        " + featuredBlock.trim() + "\n\n" + afterRoutines;

fs.writeFileSync('app/(tabs)/workout/index.tsx', finalCode);
console.log("Successfully swapped and added gradients!");
