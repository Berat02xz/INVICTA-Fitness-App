
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Image, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import UserDTO from "@/models/DTO/UserDTO";
import { User } from "@/models/User";
import database from "@/database/database";
import CalculateBMI from "@/utils/CalculateBMI";
import { useProStatus } from "@/hooks/useProStatus";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { getCaloriePlans } from "@/utils/GetCaloriePlans";
import { LogoutUser } from "@/api/UserDataEndpoint";
import UnitSwitch from "@/components/ui/UnitSwitch"; // Importing UnitSwitch
import DevMenu from "@/components/Testing/DevMenu";

const VERSION = "1.0.0";

// --- Design Tokens (Matching Reference) ---
const D = {
  bg: "#000000",
  card: "#121212",
  cardAlt: "#1C1C1E",
  primary: "#AAFB05",
  text: "#FFFFFF",
  sub: "#666666",
  border: "#222222",
  accent: "#AAFB05",
};

export default function Profile() {
  const insets = useSafeAreaInsets();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isPro } = useProStatus();
  
  // Modals state
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [adjustedWeight, setAdjustedWeight] = useState(0);
  
  const [heightModalVisible, setHeightModalVisible] = useState(false);
  const [adjustedHeightFeet, setAdjustedHeightFeet] = useState(0);
  const [adjustedHeightInches, setAdjustedHeightInches] = useState(0);
  const [adjustedHeightCm, setAdjustedHeightCm] = useState(0);

  const [ageModalVisible, setAgeModalVisible] = useState(false);
  const [adjustedAge, setAdjustedAge] = useState(0);

  const [fitnessLevelModalVisible, setFitnessLevelModalVisible] = useState(false);
  const [equipmentModalVisible, setEquipmentModalVisible] = useState(false);
  const [calorieModalVisible, setCalorieModalVisible] = useState(false);
  const [caloriePlans, setCaloriePlans] = useState<any[]>([]);

  const fitnessLevels = ["Beginner", "Intermediate", "Advanced", "Gym Enthusiast"];
  const equipmentOptions = [
    { label: "Home Workouts", value: "Home Workouts" },
    { label: "Basic Equipment", value: "Basic Equipment" },
    { label: "Gym Access", value: "Gym Access" },
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await User.getUserDetails(database);
      if (user) {
        setUserData({
          name: user.name,
          email: user.email,
          weight: user.weight,
          height: user.height,
          age: user.age,
          gender: user.gender,
          bmi: user.bmi,
          fitnessLevel: user.fitnessLevel,
          equipmentAccess: user.equipmentAccess,
          activityLevel: user.activityLevel,
          goal: user.goal,
          caloricIntake: user.caloricIntake,
          role: user.role,
          unit: user.unit,
        });
        
        // Initialize Modal Values
        setAdjustedWeight(user.weight);
        setAdjustedAge(user.age);
        
        if (user.unit === "imperial") {
            const totalInches = parseFloat(user.height);
            setAdjustedHeightFeet(Math.floor(totalInches / 12));
            setAdjustedHeightInches(Math.round(totalInches % 12));
            setAdjustedHeightCm(0); // Clear metric
        } else {
            setAdjustedHeightCm(parseFloat(user.height));
            setAdjustedHeightFeet(0); 
            setAdjustedHeightInches(0);
        }

        // Calculate calorie plans
        refreshCaloriePlans(user);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshCaloriePlans = (user: any) => {
        // Prepare userData in the format expected by GetCaloriePlans
        // The attached example uses strings for some fields, ensuring consistent types
        const userDataFormatted = {
            age: Number(user.age),
            sex: String(user.gender),
            height: user.height, // Keep original string/number format, logic inside utils handles it
            weight: Number(user.weight),
            unit: String(user.unit),
            activity_level: String(user.activityLevel || "Sedentary"), // Default fallback
        };

        const plans = getCaloriePlans(userDataFormatted);
        setCaloriePlans(plans);
  };

  const handleLogout = () => {
    LogoutUser();
  };

  // --- Handlers ---

  const handleUpdateUnit = async (newUnit: "metric" | "imperial") => {
    if (newUnit === userData?.unit) return;
    try {
        const user = await User.getUserDetails(database);
        if(!user) return;

        let newWeight = user.weight;
        let newHeight = user.height;

        // Convert values
        if (newUnit === "imperial" && user.unit === "metric") {
            // Metric to Imperial
            newWeight = parseFloat( (user.weight * 2.20462).toFixed(1) );
            newHeight = (parseFloat(user.height) / 2.54).toString(); // cm to inches
        } else if (newUnit === "metric" && user.unit === "imperial") {
            // Imperial to Metric
            newWeight = parseFloat( (user.weight / 2.20462).toFixed(1) );
            newHeight = (parseFloat(user.height) * 2.54).toFixed(0); // inches to cm
        }

        await database.write(async () => {
            await user.update(u => {
                u.unit = newUnit;
                u.weight = newWeight;
                u.height = newHeight;
            });
        });
        
        // Reload locally
        loadUserData();

    } catch (e) {
        Alert.alert("Error", "Failed to update unit preference");
    }
  };

  const handleUpdateWeight = async () => {
    if (!userData) return;
    try {
        const user = await User.getUserDetails(database);
        if (user) {
             const newBMI = CalculateBMI(
                userData.unit,
                adjustedWeight.toString(),
                userData.height
             );
             await database.write(async () => {
                 await user.update(u => { 
                     u.weight = adjustedWeight;
                     u.bmi = newBMI; 
                 });
             });
             setWeightModalVisible(false);
             loadUserData(); // refresh UI
        }
    } catch(e) { Alert.alert("Error", "Could not update weight"); }
  };

  const handleUpdateHeight = async () => {
     if (!userData) return;
     try {
         let heightToSave = "";
         if (userData.unit === "imperial") {
             heightToSave = ((adjustedHeightFeet * 12) + adjustedHeightInches).toString();
         } else {
             heightToSave = adjustedHeightCm.toString();
         }

         const user = await User.getUserDetails(database);
         if (user) {
             const newBMI = CalculateBMI(
                userData.unit,
                userData.weight.toString(),
                heightToSave
             );
             await database.write(async () => {
                 await user.update(u => {
                     u.height = heightToSave;
                     u.bmi = newBMI;
                 });
             });
             setHeightModalVisible(false);
             loadUserData();
         }
     } catch(e) { Alert.alert("Error", "Could not update height"); }
  };

  const handleUpdateAge = async () => {
      if (!userData) return;
      try {
          const user = await User.getUserDetails(database);
          if (user) {
              await database.write(async () => {
                  await user.update(u => { u.age = adjustedAge; });
              });
              setAgeModalVisible(false);
              loadUserData();
          }
      } catch(e) { Alert.alert("Error", "Could not update age"); }
  };

  const handleUpdateFitnessLevel = async (level: string) => {
        try {
            const user = await User.getUserDetails(database);
            if (user) {
                await database.write(async () => { await user.update(u => { u.fitnessLevel = level; }); });
                setFitnessLevelModalVisible(false);
                loadUserData();
            }
        } catch(e) { Alert.alert("Error", "Failed to update fitness level"); }
  };

  const handleUpdateEquipment = async (val: string) => {
      try {
            const user = await User.getUserDetails(database);
            if (user) {
                await database.write(async () => { await user.update(u => { u.equipmentAccess = val; }); });
                setEquipmentModalVisible(false);
                loadUserData();
            }
        } catch(e) { Alert.alert("Error", "Failed to update equipment"); }
  };

  const handleUpdateCaloriePlan = async (plan: any) => {
      try {
          const user = await User.getUserDetails(database);
          if (user) {
              await database.write(async () => {
                  await user.update(u => {
                      u.goal = plan.type;
                      u.caloricIntake = plan.caloriesPerDay;
                  });
              });
              setCalorieModalVisible(false);
              loadUserData();
          }
      } catch(e) { Alert.alert("Error", "Failed to update calorie plan"); }
  };

  // Formatters
  const formatHeight = () => {
     if(!userData?.height) return "-";
     if(userData.unit === "metric") return `${userData.height} cm`;
     const total = parseFloat(userData.height);
     if (isNaN(total)) return "-";
     return `${Math.floor(total/12)}'${Math.round(total%12)}`;
  };
  const formatWeight = () => userData?.weight ? `${userData.weight} ${userData.unit === "metric" ? "kg" : "lbs"}` : "-";

  if (loading) return <View style={s.center}><Text style={{color:"#fff"}}>Loading...</Text></View>;

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={[s.scrollContent, { paddingTop: insets.top + 10 }]} showsVerticalScrollIndicator={false}>
        
        {/* -- Header Reference Style -- */}
        <View style={s.headerRow}>
            <View style={s.headerLeft}>
                <DevMenu />
                <TouchableOpacity><Ionicons name="notifications" size={24} color="#FFF" /></TouchableOpacity>
            </View>
            <View style={s.coinPill}>
                <FontAwesome5 name="coins" size={14} color="#FFD700" />
                <Text style={s.coinText}>20,710.00</Text>
                <TouchableOpacity style={s.plusBtn}><Ionicons name="add" size={16} color="#000" /></TouchableOpacity>
            </View>
        </View>

        {/* -- Avatar & Profile Info -- */}
        <View style={s.profileHeader}>
            <View style={s.avatarContainer}>
                {/* Dashed Ring */}
                <View style={s.dashRing} />
                <View style={s.avatarCircle}>
                   <Text style={s.avatarInitials}>{userData?.name?.substring(0,2).toUpperCase()}</Text>
                </View>
            </View>
            <Text style={s.userName}>{userData?.name || "User"}</Text>
            <Text style={s.userHandle}>@{userData?.email?.split("@")[0] || "handle"}</Text>
        </View>

        {/* -- 3 Stats Row (Clickable) -- */}
        <View style={s.statsRow}>
            <TouchableOpacity style={s.statItem} onPress={() => setWeightModalVisible(true)}>
                <Ionicons name="scale-outline" size={20} color={D.primary} style={{marginBottom:4}} />
                <Text style={s.statVal}>{formatWeight()}</Text>
                <Text style={s.statLabel}>Weight {userData?.unit === "metric" ? "(kg)" : "(lbs)"}</Text>
            </TouchableOpacity>
            <View style={s.vertDiv} />
            <TouchableOpacity style={s.statItem} onPress={() => {
                // Pre-fill
                if (userData.unit === "imperial") {
                    const total = parseFloat(userData.height);
                    setAdjustedHeightFeet(Math.floor(total/12));
                    setAdjustedHeightInches(Math.round(total%12));
                } else {
                    setAdjustedHeightCm(parseFloat(userData.height));
                }
                setHeightModalVisible(true);
            }}>
                <Ionicons name="resize-outline" size={20} color={D.primary} style={{marginBottom:4}}/>
                <Text style={s.statVal}>{formatHeight()}</Text>
                <Text style={s.statLabel}>Height</Text>
            </TouchableOpacity>
            <View style={s.vertDiv} />
            <TouchableOpacity style={s.statItem} onPress={() => {
                setAdjustedAge(userData.age);
                setAgeModalVisible(true);
            }}>
                <Ionicons name="calendar-outline" size={20} color={D.primary} style={{marginBottom:4}} />
                <Text style={s.statVal}>{userData?.age} yrs</Text>
                <Text style={s.statLabel}>Age</Text>
            </TouchableOpacity>
        </View>

        {/* -- "Keep It Up" / Pro Banner (Mimicking the trophy card) -- */}
        <TouchableOpacity style={s.proCard} onPress={() => !isPro && router.push("/(auth)/SubscriptionCheck")}>
            <View style={{flex:1}}>
                <Text style={s.proTitle}>{isPro ? "Premium Active" : "Go Pro"}</Text>
                <Text style={s.proSub}>{isPro ? "You have access to all features." : "Unlock advanced AI features."}</Text>
                <View style={s.dotsRow}>
                    <View style={[s.dot, s.dotActive]} />
                    <View style={s.dot} /><View style={s.dot} />
                </View>
            </View>
            <Ionicons name="trophy" size={48} color={D.primary} />
        </TouchableOpacity>

        {/* -- Settings Grid (Replacing Calendar/Friends) -- */}
        <Text style={s.sectionTitle}>Fitness Details</Text>
        <View style={s.grid}>
             <GridItem 
                icon="barbell" 
                label="Fitness Level" 
                value={userData?.fitnessLevel} 
                onPress={() => setFitnessLevelModalVisible(true)} 
             />
             <GridItem 
                icon="fitness" 
                label="Equipment" 
                value={userData?.equipmentAccess} 
                onPress={() => setEquipmentModalVisible(true)}
            />
             <GridItem 
                icon="flame" 
                label="Calories" 
                value={`${userData?.caloricIntake}`} 
                onPress={() => {
                    refreshCaloriePlans(userData);
                    setCalorieModalVisible(true);
                }} 
            />
             <GridItem 
                icon="body" 
                label="BMI" 
                value={userData?.bmi ? Number(userData.bmi).toFixed(1) : "-"} 
            />
        </View>

        <Text style={s.sectionTitle}>Account</Text>
        <TouchableOpacity style={s.logoutRow} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#FF453A" />
            <Text style={s.logoutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>

       {/* -- Modals -- */}
      
      {/* Weight Modal */}
      <SimpleModal visible={weightModalVisible} onClose={()=>setWeightModalVisible(false)} title={`Edit Weight`}>
           <View style={s.inputContainer}>
               <View style={{alignSelf: 'center', marginBottom: 10}}>
                    <UnitSwitch 
                        unit={userData?.unit || "metric"} 
                        onSelect={handleUpdateUnit} 
                        metricLabel="Kg" 
                        imperialLabel="Lbs" 
                    />
               </View>
               <TextInput 
                  style={s.textInput} 
                  keyboardType="numeric" 
                  value={adjustedWeight.toString()} 
                  onChangeText={(t) => setAdjustedWeight(parseFloat(t) || 0)}
               />
               <TouchableOpacity style={s.saveBtn} onPress={handleUpdateWeight}>
                   <Text style={s.saveBtnText}>Save Weight</Text>
               </TouchableOpacity>
           </View>
      </SimpleModal>

      {/* Height Modal */}
      <SimpleModal visible={heightModalVisible} onClose={()=>setHeightModalVisible(false)} title="Edit Height">
           <View style={s.inputContainer}>
                <View style={{alignSelf: 'center', marginBottom: 10}}>
                    <UnitSwitch 
                        unit={userData?.unit || "metric"} 
                        onSelect={handleUpdateUnit} 
                        metricLabel="Cm" 
                        imperialLabel="Ft/In" 
                    />
               </View>
               {userData?.unit === "imperial" ? (
                   <View style={s.rowInputs}>
                       <View style={{flex:1}}>
                           <Text style={s.label}>Feet</Text>
                           <TextInput 
                              style={s.textInput} 
                              keyboardType="numeric"
                              value={adjustedHeightFeet.toString()} 
                              onChangeText={(t) => setAdjustedHeightFeet(parseFloat(t) || 0)}
                           />
                       </View>
                       <View style={{flex:1}}>
                           <Text style={s.label}>Inches</Text>
                           <TextInput 
                              style={s.textInput} 
                              keyboardType="numeric"
                              value={adjustedHeightInches.toString()} 
                              onChangeText={(t) => setAdjustedHeightInches(parseFloat(t) || 0)}
                           />
                       </View>
                   </View>
               ) : (
                   <View>
                        <Text style={s.label}>Centimeters</Text>
                        <TextInput 
                            style={s.textInput} 
                            keyboardType="numeric" 
                            value={adjustedHeightCm.toString()} 
                            onChangeText={(t) => setAdjustedHeightCm(parseFloat(t) || 0)}
                        />
                   </View>
               )}

               <TouchableOpacity style={s.saveBtn} onPress={handleUpdateHeight}>
                   <Text style={s.saveBtnText}>Save Height</Text>
               </TouchableOpacity>
           </View>
      </SimpleModal>

      {/* Age Modal */}
      <SimpleModal visible={ageModalVisible} onClose={()=>setAgeModalVisible(false)} title="Edit Age">
           <View style={s.inputContainer}>
               <TextInput 
                  style={s.textInput} 
                  keyboardType="numeric" 
                  value={adjustedAge.toString()} 
                  onChangeText={(t) => setAdjustedAge(parseFloat(t) || 0)}
               />
               <TouchableOpacity style={s.saveBtn} onPress={handleUpdateAge}>
                   <Text style={s.saveBtnText}>Save Age</Text>
               </TouchableOpacity>
           </View>
      </SimpleModal>

      {/* Fitness & Equipment Modals */}
      <SimpleModal visible={fitnessLevelModalVisible} onClose={()=>setFitnessLevelModalVisible(false)} title="Fitness Level">
           {fitnessLevels.map(l => (
               <TouchableOpacity key={l} style={s.modalOpt} onPress={()=>handleUpdateFitnessLevel(l)}>
                   <Text style={s.modalOptText}>{l}</Text>
                   {userData?.fitnessLevel === l && <Ionicons name="checkmark" size={16} color={D.primary} />}
               </TouchableOpacity>
           ))}
      </SimpleModal>

      <SimpleModal visible={equipmentModalVisible} onClose={()=>setEquipmentModalVisible(false)} title="Equipment">
           {equipmentOptions.map(l => (
               <TouchableOpacity key={l.value} style={s.modalOpt} onPress={()=>handleUpdateEquipment(l.value)}>
                   <Text style={s.modalOptText}>{l.label}</Text>
                   {userData?.equipmentAccess === l.value && <Ionicons name="checkmark" size={16} color={D.primary} />}
               </TouchableOpacity>
           ))}
      </SimpleModal>

      {/* Calorie Plan Modal */}
      <SimpleModal visible={calorieModalVisible} onClose={() => setCalorieModalVisible(false)} title="Select Goal">
            <ScrollView style={{maxHeight: 400}}>
                {caloriePlans.length > 0 ? (
                    caloriePlans.map((plan, index) => (
                        <TouchableOpacity 
                            key={index} 
                            style={[
                                s.modalOpt, 
                                userData?.goal === plan.type && {
                                    borderColor: D.primary, 
                                    borderWidth: 1, 
                                    backgroundColor: "rgba(170,251,5,0.1)",
                                    borderRadius: 12,
                                    borderBottomWidth: 1,
                                    paddingHorizontal: 12, // Add padding inside the border so text isn't flush with edge
                                    marginVertical: 4, // Add margin so borders don't overlap with neighbors
                                    borderBottomColor: D.primary,
                                }
                            ]} 
                            onPress={() => handleUpdateCaloriePlan(plan)}
                        >
                            <View style={{flex:1}}>
                                <Text style={s.modalOptText}>{plan.type || "Plan"}</Text>
                                <Text style={s.modalSubText}>{plan.caloriesPerDay} kcal/day</Text>
                            </View>
                            
                            {plan.rate ? (
                                <View style={{backgroundColor: D.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginLeft: 10}}>
                                     <Text style={{color: "#000", fontFamily: theme.bold, fontSize: 12}}>{plan.rate}</Text>
                                </View>
                            ) : null}
                            
                            {userData?.goal === plan.type && <View style={{marginLeft: 10}}><Ionicons name="checkmark-circle" size={20} color={D.primary} /></View>}
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={{color: D.sub, textAlign: "center", padding: 20}}>
                        Ensure your height, weight, and age are set correctly to see plans.
                    </Text>
                )}
            </ScrollView>
      </SimpleModal>

    </View>
  );
}

// Subcomponents
const GridItem = ({icon, label, value, onPress}: any) => (
    <TouchableOpacity style={s.gridItem} onPress={onPress} activeOpacity={0.7} disabled={!onPress}>
        <View style={s.gridIconCircle}>
            <Ionicons name={icon} size={20} color="#FFF" />
        </View>
        <View style={{gap:4}}>
            <Text style={s.gridLabel}>{label}</Text>
            <Text style={s.gridValue} numberOfLines={1}>{value}</Text>
        </View>
    </TouchableOpacity>
);

const SimpleModal = ({visible, onClose, title, children}:any) => (
    <Modal visible={visible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1}}>
            <TouchableOpacity style={s.modalOverlay} onPress={onClose} activeOpacity={1}>
                <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                    <View style={s.modalContent}>
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>{title}</Text>
                            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#FFF"/></TouchableOpacity>
                        </View>
                        {children}
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    </Modal>
);

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: D.bg },
    scrollContent: { 
        paddingHorizontal: 20, 
        paddingBottom: 100,
        maxWidth: 768,
        width: "100%",
        alignSelf: "center",
    },
    center: { flex:1, alignItems:"center", justifyContent:"center", backgroundColor:D.bg},

    // Header
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    headerLeft: { flexDirection: "row", gap: 15 },
    coinPill: { 
        flexDirection: "row", alignItems: "center", gap: 8, 
        backgroundColor: "#1A1A1A", borderRadius: 20, 
        paddingLeft: 12, paddingRight: 4, paddingVertical: 4
    },
    coinText: { fontSize: 13, fontFamily: theme.bold, color: D.text },
    plusBtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: D.primary, alignItems: "center", justifyContent: "center" },

    // Avatar Area
    profileHeader: { alignItems: "center", marginBottom: 24 },
    avatarContainer: { width: 100, height: 100, marginBottom: 12, alignItems:"center", justifyContent:"center" },
    dashRing: { 
        position: "absolute", width: 100, height: 100, borderRadius: 50, 
        borderWidth: 2, borderColor: D.primary, borderStyle: "dashed" 
    },
    avatarCircle: { 
        width: 86, height: 86, borderRadius: 43, 
        backgroundColor: "#222", alignItems: "center", justifyContent: "center" 
    },
    avatarInitials: { fontSize: 32, fontFamily: theme.bold, color: "#FFF" },
    userName: { fontSize: 22, fontFamily: theme.bold, color: D.text, marginBottom: 2 },
    userHandle: { fontSize: 13, fontFamily: theme.medium, color: D.sub },

    // Stats Row
    statsRow: { 
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        backgroundColor: D.cardAlt, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 10, marginBottom: 24 
    },
    statItem: { flex: 1, alignItems: "center" },
    statVal: { fontSize: 16, fontFamily: theme.bold, color: "#FFF", marginBottom: 2 },
    statLabel: { fontSize: 11, fontFamily: theme.medium, color: D.sub },
    vertDiv: { width: 1, height: 30, backgroundColor: "#333" },

    // Pro Card
    proCard: { 
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        backgroundColor: "#111", borderRadius: 20, padding: 20, marginBottom: 24,
        borderWidth: 1, borderColor: "#222"
    },
    proTitle: { fontSize: 16, fontFamily: theme.bold, color: "#FFF", marginBottom: 4 },
    proSub: { fontSize: 12, color: D.sub, marginBottom: 12, maxWidth: 180 },
    dotsRow: { flexDirection: "row", gap: 4 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#333" },
    dotActive: { backgroundColor: D.primary },

    // Grid
    sectionTitle: { fontSize: 18, fontFamily: theme.bold, color: "#FFF", marginBottom: 12 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 30 },
    gridItem: { 
        width: "48%", backgroundColor: D.cardAlt, borderRadius: 16, padding: 16, 
        gap: 12
    },
    gridIconCircle: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#2A2A2A", alignItems: "center", justifyContent: "center" },
    gridLabel: { fontSize: 12, color: D.sub, fontFamily: theme.medium },
    gridValue: { fontSize: 14, color: "#FFF", fontFamily: theme.bold },

    logoutRow: { 
        flexDirection: "row", alignItems: "center", gap: 10, 
        backgroundColor: "rgba(255,69,58,0.1)", padding: 16, borderRadius: 16 
    },
    logoutText: { fontSize: 15, fontFamily: theme.bold, color: "#FF453A" },

    // Modals
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
    modalContent: { backgroundColor: "#1C1C1E", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: 400 },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    modalTitle: { fontSize: 18, fontFamily: theme.bold, color: "#FFF" },
    modalOpt: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#333", alignItems:"center" },
    modalOptText: { fontSize: 16, color: "#FFF", fontFamily: theme.medium },
    modalSubText: { fontSize: 12, color: D.sub, fontFamily: theme.regular, marginTop: 2 },
    
    // Inputs
    inputContainer: { gap: 16 },
    rowInputs: { flexDirection: "row", gap: 12 },
    label: { color: D.sub, marginBottom: 6, fontSize: 12 },
    textInput: { 
        backgroundColor: "#222", color: "#FFF", padding: 16, borderRadius: 12, fontSize: 16, fontFamily: theme.bold,
        borderWidth: 1, borderColor: "#333" 
    },
    saveBtn: { backgroundColor: D.primary, padding: 16, borderRadius: 12, alignItems: "center", marginTop: 10 },
    saveBtnText: { color: "#000", fontFamily: theme.bold, fontSize: 16 },
});

