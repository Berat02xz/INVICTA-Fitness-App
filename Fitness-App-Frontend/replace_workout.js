const fs = require("fs");

let content = fs.readFileSync("app/(screens)/WorkoutPlayer.tsx", "utf8");

const startQuote = "          ) : (";
const nextLine = "\n            currentExercise && (";

let startIdx = content.indexOf("          ) : (\r\n            currentExercise && (");
if (startIdx === -1) {
    startIdx = content.indexOf("          ) : (\n            currentExercise && (");
}

let endIdx = content.indexOf("              </FadeTranslate>\r\n            )\r\n          )}\r\n        </Animated.View>", startIdx);
if (endIdx === -1) {
    endIdx = content.indexOf("              </FadeTranslate>\n            )\n          )}\n        </Animated.View>", startIdx);
}
const endLength = "              </FadeTranslate>\n            )\n          )}\n        </Animated.View>".length;

if (startIdx !== -1 && endIdx !== -1) {
  const codeToReplace = content.substring(startIdx, endIdx + endLength);
  
  const newCode = `          ) : (
            currentExercise && (
              <View style={{ flex: 1 }}>
                 {/* Top Image Section */}
                 <View style={{ height: SCREEN_H * 0.55, position: 'absolute', top: -insets.top, left: 0, right: 0 }}>
                    {currentExercise.gifUrl ? (
                        <Image source={{ uri: currentExercise.gifUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                        <View style={{ width: '100%', height: '100%', backgroundColor: '#1C1C1E', alignItems: 'center', justifyContent: 'center' }}>
                           <Ionicons name="barbell-outline" size={100} color="#333" />
                        </View>
                    )}
                    
                    {/* Top Icons Overlay */}
                    <View style={{ position: 'absolute', top: insets.top + 16, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <Pressable onPress={() => router.back()} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                                <Ionicons name="chevron-back" size={24} color="#fff" />
                            </Pressable>
                            <Pressable style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                                <Ionicons name="volume-mute" size={24} color="#fff" />
                            </Pressable>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <Pressable style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                                <Ionicons name="settings-sharp" size={24} color="#fff" />
                            </Pressable>
                            <Pressable onPress={() => router.back()} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                                <Ionicons name="chevron-down" size={24} color="#fff" />
                            </Pressable>
                        </View>
                    </View>

                    {/* TAP TO STOP OVERLAY */}
                    <View style={{ position: 'absolute', bottom: -20, alignSelf: 'center', zIndex: 10 }}>
                         <Pressable onPress={() => setIsPaused(!isPaused)} style={{ backgroundColor: '#fff', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30 }}>
                             <Text style={{ color: '#000', fontFamily: theme.bold, fontSize: 14 }}>
                                {isPaused ? "TAP TO RESUME VIDEO" : "TAP TO STOP THE VIDEO"}
                             </Text>
                         </Pressable>
                    </View>
                 </View>

                 {/* Bottom Information Section */}
                 <View style={{ flex: 1, marginTop: SCREEN_H * 0.55 - insets.top }}>
                     <View style={{ flex: 1, backgroundColor: '#121212', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingTop: 40, paddingHorizontal: 24 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <View style={{ flex: 1, paddingRight: 16 }}>
                                <Text style={{ color: '#fff', fontSize: 28, fontFamily: theme.black, textTransform: 'uppercase' }} numberOfLines={2}>{currentExercise.name}</Text>
                                <Text style={{ color: '#fff', fontSize: 16, fontFamily: theme.medium, marginTop: 4 }}>
                                    Exercise {currentIndex + 1}/{totalExercises}
                                </Text>
                            </View>
                            <Pressable onPress={() => handleOpenSheet("instruction")} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ color: '#000', fontFamily: theme.bold, fontSize: 18, lineHeight: 22 }}>i</Text>
                            </Pressable>
                        </View>

                        {/* Stats Row */}
                        <View style={{ flexDirection: 'row', marginTop: 30, justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={{ alignItems: 'flex-start', flex: 1 }}>
                                <Text style={{ color: '#fff', fontSize: 20, fontFamily: theme.medium }}>{formatTime(totalElapsed)}</Text>
                                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: theme.medium }}>Total time</Text>
                                <View style={{ height: 2, backgroundColor: D.primary, width: '100%', marginTop: 8 }} />
                            </View>

                            <View style={{ flex: 1, alignItems: 'center' }}>
                                <Text style={{ color: '#fff', fontSize: 44, fontFamily: theme.medium }}>{formatTime(exerciseTimer)}</Text>
                            </View>

                            <View style={{ alignItems: 'flex-end', flex: 1 }}>
                                <Text style={{ color: '#fff', fontSize: 20, fontFamily: theme.medium }}>{Math.round(((currentIndex + 1) / totalExercises) * 100)}%</Text>
                                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: theme.medium }}>Completed</Text>
                                <View style={{ height: 2, backgroundColor: '#444', width: '100%', marginTop: 8 }} />
                            </View>
                        </View>

                        {/* Next / Prev Controls */}
                        <View style={{ flexDirection: 'row', marginTop: 'auto', marginBottom: insets.bottom + 20, gap: 16 }}>
                            <Pressable 
                                onPress={handlePrevious} 
                                disabled={currentIndex === 0 && currentSet === 1} 
                                style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: '#2C2C2E', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Ionicons name="play-skip-back" size={24} color={(currentIndex === 0 && currentSet === 1) ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.6)"} />
                            </Pressable>

                            {/* Large Next Button */}
                            <Pressable onPress={handleNext} style={{ flex: 1, height: 64, borderRadius: 16, backgroundColor: D.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
                                {(() => {
                                   let nextExName = "Workout Complete";
                                   let nextExTime = "0:00";
                                   let nextExImg = null;
                                   
                                   if (currentSet < currentExercise.sets) {
                                       nextExName = currentExercise.name + " (Set " + (currentSet + 1) + ")";
                                       nextExTime = formatTime(getExerciseDuration(currentExercise));
                                       nextExImg = currentExercise.gifUrl;
                                   } else if (currentIndex < exercises.length - 1) {
                                       const nextEx = exercises[currentIndex + 1];
                                       nextExName = nextEx.name;
                                       nextExTime = formatTime(getExerciseDuration(nextEx));
                                       nextExImg = nextEx.gifUrl;
                                   }

                                   return (
                                     <>
                                        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                                            {nextExImg && <Image source={{ uri: nextExImg }} style={{ width: '100%', height: '100%' }} />}
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <Text style={{ color: '#000', fontSize: 16, fontFamily: theme.bold }} numberOfLines={1}>{nextExName}</Text>
                                            <Text style={{ color: 'rgba(0,0,0,0.6)', fontSize: 14, fontFamily: theme.medium }}>{nextExTime}</Text>
                                        </View>
                                        <View style={{ width: 40, alignItems: 'center', justifyContent: 'center' }}>
                                            <Ionicons name="play-skip-forward" size={24} color="#000" />
                                        </View>
                                     </>
                                   )
                                })()}
                            </Pressable>
                        </View>
                     </View>
                 </View>
              </View>
            )
          )}
        </Animated.View>`;

  content = content.replace(codeToReplace, newCode);
  fs.writeFileSync("app/(screens)/WorkoutPlayer.tsx", content);
  console.log("Successfully replaced!");
} else {
  console.log("Indices not found! " + startIdx + " " + endIdx);
}
