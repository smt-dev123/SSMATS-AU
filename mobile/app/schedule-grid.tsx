import { getCourses } from "@/api/CourseAPI";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function ScheduleGridScreen() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || "";
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getCourses();
        if (res && res.data) {
          setCourses(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch schedule:", error);
      } finally {
        setLoading(false);
      }
    };
    if (role) {
      fetchData();
    }
  }, [role]);

  // Group by time slots
  const timeSlotsSet = new Set<string>();
  courses.forEach(c => {
    const start = c.schedule?.sessionTime?.firstSessionStartTime || "00:00";
    const end = c.schedule?.sessionTime?.secondSessionEndTime || "00:00";
    timeSlotsSet.add(`${start} - ${end}`);
  });
  
  const timeSlots = Array.from(timeSlotsSet).sort();

  // helper to get course for a specific time slot and day
  const getCourseForSlot = (day: string, slot: string) => {
    return courses.find(c => {
      if (c.day !== day) return false;
      const start = c.schedule?.sessionTime?.firstSessionStartTime || "00:00";
      const end = c.schedule?.sessionTime?.secondSessionEndTime || "00:00";
      return `${start} - ${end}` === slot;
    });
  };

  const isDark = colorScheme === 'dark';
  const bgColor = isDark ? '#1E293B' : '#F8FAFC';
  const headerBg = isDark ? '#0F172A' : '#E2E8F0';
  const borderColor = isDark ? '#334155' : '#CBD5E1';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const textMuted = isDark ? '#94A3B8' : '#64748B';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <StatusBar barStyle="light-content" />
      <ScreenHeader title="Full Schedule Grid" showBack />
      
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 10, color: textMuted }}>Loading schedule...</Text>
        </View>
      ) : (
        <View style={{ flex: 1, backgroundColor: bgColor }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={true} style={{ flex: 1, padding: 16 }}>
            <ScrollView showsVerticalScrollIndicator={true}>
              <View style={{ paddingBottom: 40, paddingRight: 32 }}>
                {/* Table Container */}
                <View style={{ 
                  borderWidth: 1, 
                  borderColor, 
                  borderRadius: 8, 
                  overflow: 'hidden',
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  minWidth: 800
                }}>
                  
                  {/* Header Row */}
                  <View style={{ flexDirection: 'row', backgroundColor: headerBg, borderBottomWidth: 1, borderColor }}>
                    <View style={{ width: 120, padding: 12, borderRightWidth: 1, borderColor, justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 12 }}>Time</Text>
                    </View>
                    {DAYS.map(day => (
                      <View key={day} style={{ width: 140, padding: 12, borderRightWidth: day === 'Sunday' ? 0 : 1, borderColor, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 12 }}>{day.toUpperCase()}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Data Rows */}
                  {timeSlots.map((slot, index) => (
                    <View key={slot} style={{ flexDirection: 'row', borderBottomWidth: index === timeSlots.length - 1 ? 0 : 1, borderColor }}>
                      <View style={{ width: 120, padding: 12, borderRightWidth: 1, borderColor, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: textColor, fontWeight: '600', fontSize: 12 }}>{slot}</Text>
                      </View>
                      
                      {DAYS.map(day => {
                        const course = getCourseForSlot(day, slot);
                        return (
                          <View key={day} style={{ width: 140, padding: 12, borderRightWidth: day === 'Sunday' ? 0 : 1, borderColor, justifyContent: 'center', alignItems: 'center' }}>
                            {course ? (
                              <>
                                <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 13, textAlign: 'center', marginBottom: 4 }}>{course.name}</Text>
                                {course.schedule?.classroom?.name && (
                                  <Text style={{ color: colors.primary, fontSize: 10, textAlign: 'center', marginBottom: 4, borderWidth: 1, borderColor: colors.primary + '55', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: colors.primary + '11' }}>{course.schedule.classroom.name}</Text>
                                )}
                                {course.schedule?.teacher && (
                                  <>
                                    <View style={{ width: '80%', height: 1, borderStyle: 'solid', borderWidth: 0, borderTopWidth: 1, borderColor: borderColor, marginVertical: 6 }} />
                                    <Text style={{ color: textMuted, fontSize: 11, textAlign: 'center' }}>{course.schedule.teacher.name}</Text>
                                    {course.schedule.teacher.phone && (
                                      <Text style={{ color: textMuted, fontSize: 10, textAlign: 'center', marginTop: 2 }}>{course.schedule.teacher.phone}</Text>
                                    )}
                                  </>
                                )}
                              </>
                            ) : (
                              <Text style={{ color: textMuted, fontSize: 12, fontStyle: 'italic', opacity: 0.5 }}>-</Text>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  ))}
                  
                  {timeSlots.length === 0 && (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <Text style={{ color: textMuted }}>No schedule available.</Text>
                    </View>
                  )}

                </View>
              </View>
            </ScrollView>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}
