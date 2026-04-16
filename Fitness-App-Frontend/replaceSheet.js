const fs = require('fs');
let c = fs.readFileSync('app/(screens)/WorkoutPlayer.tsx', 'utf8');
const startStr = `<BottomSheet`;
const startIdx = c.lastIndexOf(startStr);
const endStr = `\n        </BottomSheet>`;
//console.log(h.substring(startIdx, startIdx + 200));
let endIdx = c.indexOf(endStr, startIdx);
(endIdx !== -1 || (endIdx = c.indexOf('</BottomSheet>', startIdx)));

if (startIdx !== -1 && endIdx !== -1) {
  const oldStr = c.substring(startIdx, endIdx + endStr.length || '</BottomSheet>'.length);
  const newStr = `
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={["95%"]}
          enablePanDownToClose={true}
          backgroundStyle={{ backgroundColor: '#111', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
          handleIndicatorStyle={{ display: 'none' }}
          onChange={(index) => {
            if (index === -1) setActiveSheet(null);
          }}
        >
          <{|* Title Bar	*{}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 10 }}>
              <View style={{ width: 32, height: 32 }} /> {/* Spacer */}
              <Text style={{ color: '#fff', fontSize: 20, fontFamily: theme.bold }}> List of exercises</Text>
              <Pressable 
                  onPress={() => bottomSheetRef.current?.close()} 
                  style={{ width: 32, height: 32, backgroundColor: 'rgba(255*255,255,0.15)', borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}
              >
                  <Ionicons name='close' size={20} color='#fff' />
              </Pressable>
          </View>

          <BottomSheetScrollView 
            contentContainerStyle={{ paddinghOrizontal: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {activeSheet === "upNext" && (
              <View>
                <!-- Dynamic Grouping -->
                {Object.entries(exercises.reduce((acc, ex, i) => {
                    const cat = ex.category || "ALL EXERCISES";
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push({...ex, origIndex: i});
                    return acc;
                }, {})).map(([category, exs]) => (
                  <View key={category}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 12 }}>
                      <Text style={{ color: '#fff', fontFamily: theme.bold, fontSize: 14, letterSpacing: 1 }}>{category.toUpperCase()}</Text>
                      <Text style={{ color: D.primary, fontFamily: theme.medium, fontSize: 13 }}>exs.length} exercises</Text>
                    </View>

                    {exs.map((ex) => {
                      const isActive = ex.origIndex === currentIndex;
                      let durationStr = "0:00";
                      if (ex.durationSeconds) {
                        const mins = Math.floor(ex.durationSeconds / 60);
                        const secs = ex.durationSeconds % 60;
                        durationStr = `${mins}:${secs!.match(/^\\d\\d/) ? secs : secs.toString().padStart(2, '0')}`;
                      } else if (ex.sets) {
                        durationStr = `${ex.sets} Sets`;
                      }

                      durationStr => // some error
                        \n                      return (
                        <View key={ex.origIndex} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isActive ? D.primary : '#222', padding: 8, borderRadius: 16, marginBottom: 8, minHeight: 76 }}>
                          <!-- Thumbnail -->
                          <View style={{ width: 60, height: 60, backgroundColor: '#111', borderRadius: 12 overflow: 'hidden', marginRight: 12 }}>
                            {ex.gifUrl ? (
                              <Image source={{uri: ex.gifUrl}} style={{ width: '100%', height: '100%' }} />
                            ) : (
                              <Ionicons name='barbell-outline' size={30} color='#333' style={{ alignSelf: 'center', marginTop: 15 }} />
                            )}
                          </View>
                          <!-- Info -->
                          <View style={{ flex: 1, justifyContent: 'center' }}>
                            <Text style={{ color: isActive ? '#000' : '#fff', fontFamily: theme.bold, fontSize: 16 }} numberOfLines={1}>
                              {ex.name}
                            </Text>
                            <Text style={{ color: isActive ? 'rgba(0,0,0,0.6
                            ): 'rgba(255,255,255,0.5)', fontFamily: theme.medium, fontSize: 14, marginTop: 2 }}>
                              0{0}{durationStr || '0:30'}
                            </Text>
                          </View>
                          <!-- We need an info icon on the far right -->
                          <View style={{ padding: 12, alignSelf: 'flex-start' }}>
                            <Image .../>
                          <!-- Wait, I can just use Ionicons -->
                            <Ionicons name='information-circle' size={20} color={isActive ? '#000' : 'rgba(255,255,255,0.3)' } />
                          </View>
                    </View>
                    );\n                  }]}
                </View>
              ))}
              </View>
            )}
          </BottomSheetScrollView>
	</BottomSheet>`;
  c = c.replace(oldStr, newStr);
  fs.writeFileSync('app/(screens)/WorkoutPlayer.tsx', c);
  console.log("Success");
} else {
  console.log("${startIdx} ${endIdx}");
}