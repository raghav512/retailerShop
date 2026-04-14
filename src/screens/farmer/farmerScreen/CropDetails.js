import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import IonIcon from "react-native-vector-icons/Ionicons";
import apiService from "../../../Redux/apiService";
import { FARMER_COLORS } from '../../../colorsList/ColorList';

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const THEME = FARMER_COLORS.primaryLight;
const THEME_LIGHT = "#e2f0c9";
const THEME_DARK = FARMER_COLORS.primaryDark;

/* ─── helpers ─── */
const daysSince = (dateStr) => {
  if (!dateStr) return 0;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.floor(diff / 86400000));
};

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * Given the calendar stages and current days since sowing,
 * returns an enriched array: each stage gets { startDay, endDay, status }.
 *   status: 'completed' | 'active' | 'upcoming'
 */
const enrichStages = (stages = [], daysSinceSowing) => {
  let cursor = 0;
  return stages.map((stage) => {
    const duration =
      stage.duration_days ??
      stage.duration ??
      stage.days ??
      stage.total_days ??
      0;
    const startDay = cursor;
    const endDay = cursor + Number(duration);
    cursor = endDay;

    let status = "upcoming";
    if (daysSinceSowing >= endDay) {
      status = "completed";
    } else if (daysSinceSowing >= startDay) {
      status = "active";
    }

    // progress within this stage (0-1)
    const stageProgress =
      status === "completed"
        ? 1
        : status === "active"
        ? Math.min((daysSinceSowing - startDay) / Math.max(duration, 1), 1)
        : 0;

    return { ...stage, startDay, endDay, duration, status, stageProgress };
  });
};

/* ─── sub-components ─── */

const StatCard = ({ icon, value, label, color = THEME }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIconBox, { backgroundColor: color + "20" }]}>
      <Icon name={icon} size={24} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const StageProgressBar = ({ progress, status }) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const barColor =
    status === "completed"
      ? THEME
      : status === "active"
      ? "#FF8F00"
      : "#D1D5DB";

  return (
    <View style={styles.progressTrack}>
      <Animated.View
        style={[
          styles.progressFill,
          {
            backgroundColor: barColor,
            width: animatedWidth.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
          },
        ]}
      />
    </View>
  );
};

const StageCard = ({ stage, index, isLast }) => {
  const [expanded, setExpanded] = useState(stage.status === "active");
  const animHeight = useRef(new Animated.Value(stage.status === "active" ? 1 : 0)).current;

  const toggle = () => {
    setExpanded((prev) => {
      Animated.timing(animHeight, {
        toValue: prev ? 0 : 1,
        duration: 260,
        useNativeDriver: false,
      }).start();
      return !prev;
    });
  };

  const statusColor =
    stage.status === "completed"
      ? THEME
      : stage.status === "active"
      ? "#FF8F00"
      : "#9CA3AF";

  const statusBg =
    stage.status === "completed"
      ? THEME_LIGHT
      : stage.status === "active"
      ? "#FFF3E0"
      : "#F3F4F6";

  const statusLabel =
    stage.status === "completed"
      ? "Completed"
      : stage.status === "active"
      ? "Active Now"
      : "Upcoming";

  const statusIcon =
    stage.status === "completed"
      ? "check-circle"
      : stage.status === "active"
      ? "radio-button-on"
      : "radio-button-off";

  // Fields to suppress in the detail view
  const SKIP_KEYS = new Set([
    "_id",
    "stage_name",
    "name",
    "duration_days",
    "duration",
    "days",
    "total_days",
    "startDay",
    "endDay",
    "status",
    "stageProgress",
  ]);

  const detailEntries = Object.entries(stage).filter(
    ([k, v]) => !SKIP_KEYS.has(k) && v !== null && v !== undefined && v !== ""
  );

  return (
    <View style={styles.stageRow}>
      {/* Left timeline */}
      <View style={styles.timelineCol}>
        <View style={[styles.timelineDot, { backgroundColor: statusColor }]}>
          <Text style={styles.timelineDotText}>{index + 1}</Text>
        </View>
        {!isLast && (
          <View
            style={[
              styles.timelineLine,
              {
                backgroundColor:
                  stage.status === "completed" ? THEME : "#E5E7EB",
              },
            ]}
          />
        )}
      </View>

      {/* Card */}
      <View style={[styles.stageCard, { backgroundColor: statusBg }]}>
        <TouchableOpacity
          onPress={toggle}
          activeOpacity={0.8}
          style={styles.stageCardHeader}
        >
          <View style={{ flex: 1 }}>
            <View style={styles.stageTopRow}>
              <Text style={[styles.stageName, { color: statusColor }]}>
                {stage.stage_name || stage.name || `Stage ${index + 1}`}
              </Text>
              {stage.status === "active" && (
                <View style={styles.activeBadge}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeBadgeText}>Live</Text>
                </View>
              )}
            </View>

            <View style={styles.stageMeta}>
              <IonIcon name="time-outline" size={13} color="#6B7280" />
              <Text style={styles.stageMetaText}>
                Day {stage.startDay} – {stage.endDay}
                {"  "}({stage.duration} days)
              </Text>
            </View>

            <StageProgressBar
              progress={stage.stageProgress}
              status={stage.status}
            />
          </View>

          <View style={styles.stageStatusBadge}>
            <IonIcon name={statusIcon} size={14} color={statusColor} />
            <Text style={[styles.stageStatusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>

          <IonIcon
            name={expanded ? "chevron-up" : "chevron-down"}
            size={18}
            color="#9CA3AF"
            style={{ marginLeft: 6 }}
          />
        </TouchableOpacity>

        {/* Expandable detail */}
        {expanded && detailEntries.length > 0 && (
          <View style={styles.stageDetail}>
            {detailEntries.map(([key, val]) => (
              <View key={key} style={styles.detailRow}>
                <Text style={styles.detailKey}>
                  {key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </Text>
                <Text style={styles.detailVal}>
                  {Array.isArray(val) ? val.join(", ") : String(val)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

/* ─── main screen ─── */
const CropDetails = ({ route, navigation }) => {
  const { cropId } = route.params;
  const [crop, setCrop] = useState(null);
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [cropId]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      // Fetch crop details
      const cropRes = await apiService.getUserCropsByUserId();
      const found = cropRes?.data?.find((c) => c._id === cropId);
      if (found) {
        setCrop({
          ...found,
          farmName:
            found?.farmId?.farmName || found?.farmName || "Unknown Farm",
        });
      }
    } catch (e) {
      console.error("Fetch crop details error:", e);
    } finally {
      setLoading(false);
    }

    // Fetch calendar separately (non-blocking)
    try {
      setCalendarLoading(true);
      const calRes = await apiService.getCropCalendarById(cropId);
      setCalendarData(calRes?.data || calRes);
    } catch (e) {
      console.warn("Crop calendar not available:", e.message);
      setCalendarError(true);
    } finally {
      setCalendarLoading(false);
    }
  };

  // ─── derived values ───
  const days = daysSince(crop?.sowingDate);
  const totalDuration =
    calendarData?.total_duration_days ?? calendarData?.totalDurationDays ?? null;
  const overallProgress = totalDuration
    ? Math.min(days / totalDuration, 1)
    : null;

  const stages = calendarData?.stages ?? [];
  const enrichedStages = enrichStages(stages, days);
  const activeStage = enrichedStages.find((s) => s.status === "active");
  const completedCount = enrichedStages.filter(
    (s) => s.status === "completed"
  ).length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
        <View style={styles.headerSpacer} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Crop</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME} />
          <Text style={styles.loadingText}>Loading crop info...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

      {/* ── Header ── */}
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Crop</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Crop Hero Card ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Icon name="grass" size={36} color={THEME} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroName}>{crop?.cropName || "Crop"}</Text>
            <View style={styles.heroFarmRow}>
              <Icon name="location-on" size={14} color={THEME} />
              <Text style={styles.heroFarm}>{crop?.farmName}</Text>
            </View>
          </View>
          {activeStage && (
            <View style={styles.heroStagePill}>
              <Text style={styles.heroStagePillText} numberOfLines={1}>
                📍 {activeStage.stage_name || activeStage.name}
              </Text>
            </View>
          )}
        </View>

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          <StatCard
            icon="square-foot"
            value={`${crop?.area || "0"} ${crop?.unit || "acre"}`}
            label="Area"
          />
          <StatCard
            icon="event"
            value={formatDate(crop?.sowingDate)}
            label="Sown On"
            color="#1565C0"
          />
          <StatCard
            icon="calendar-today"
            value={`${days}d`}
            label="Crop Age"
            color="#6A1B9A"
          />
        </View>

        {/* ── Overall Progress ── */}
        {overallProgress !== null && (
          <View style={styles.overallCard}>
            <View style={styles.overallTop}>
              <Text style={styles.overallTitle}>🌱 Overall Growth</Text>
              <Text style={styles.overallPct}>
                {Math.round(overallProgress * 100)}%
              </Text>
            </View>
            <View style={styles.overallTrack}>
              <View
                style={[
                  styles.overallFill,
                  { width: `${Math.round(overallProgress * 100)}%` },
                ]}
              />
            </View>
            <View style={styles.overallBottom}>
              <Text style={styles.overallDay}>Day {days}</Text>
              <Text style={styles.overallDay}>of {totalDuration} days</Text>
            </View>
            <View style={styles.overallMeta}>
              <View style={styles.overallMetaItem}>
                <IonIcon name="checkmark-circle" size={14} color={THEME} />
                <Text style={styles.overallMetaText}>
                  {completedCount}/{enrichedStages.length} stages done
                </Text>
              </View>
              {activeStage && (
                <View style={styles.overallMetaItem}>
                  <IonIcon name="flash" size={14} color="#FF8F00" />
                  <Text style={[styles.overallMetaText, { color: "#FF8F00" }]}>
                    {activeStage.stage_name || activeStage.name}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── Crop Staging ── */}
        <View style={styles.sectionHeader}>
          <IonIcon name="git-network-outline" size={18} color={THEME} />
          <Text style={styles.sectionTitle}>Crop Staging</Text>
        </View>

        {calendarLoading ? (
          <View style={styles.calendarLoadingBox}>
            <ActivityIndicator size="small" color={THEME} />
            <Text style={styles.calendarLoadingText}>
              Loading growth stages...
            </Text>
          </View>
        ) : calendarError || enrichedStages.length === 0 ? (
          <View style={styles.calendarErrorBox}>
            <IonIcon name="leaf-outline" size={40} color="#D1D5DB" />
            <Text style={styles.calendarErrorText}>
              {calendarError
                ? "Crop calendar not available for this crop yet."
                : "No growth stages found."}
            </Text>
          </View>
        ) : (
          <View style={styles.stagesList}>
            {enrichedStages.map((stage, i) => (
              <StageCard
                key={i}
                stage={stage}
                index={i}
                isLast={i === enrichedStages.length - 1}
              />
            ))}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

/* ─── styles ─── */
const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#6B7280",
  },
  scrollContent: {
    padding: 16,
  },

  /* Hero card */
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
    shadowColor: THEME,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: THEME,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  heroName: {
    fontSize: 20,
    fontWeight: "800",
    color: THEME_DARK,
    marginBottom: 4,
  },
  heroFarmRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroFarm: {
    fontSize: 13,
    color: "#388E3C",
    marginLeft: 3,
    fontWeight: "500",
  },
  heroStagePill: {
    backgroundColor: "#FFF3E0",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    maxWidth: 110,
  },
  heroStagePillText: {
    fontSize: 11,
    color: "#E65100",
    fontWeight: "600",
  },

  /* Stats */
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
  },
  statIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME_DARK,
    marginBottom: 2,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
  },

  /* Overall card */
  overallCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: THEME,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  overallTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  overallTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME_DARK,
  },
  overallPct: {
    fontSize: 18,
    fontWeight: "800",
    color: THEME,
  },
  overallTrack: {
    height: 10,
    backgroundColor: "#E8F5E9",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  overallFill: {
    height: "100%",
    backgroundColor: THEME,
    borderRadius: 6,
  },
  overallBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  overallDay: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  overallMeta: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  overallMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  overallMetaText: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME,
  },

  /* Section header */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: THEME_DARK,
  },

  /* Calendar loading/error */
  calendarLoadingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    elevation: 1,
  },
  calendarLoadingText: {
    fontSize: 14,
    color: "#6B7280",
  },
  calendarErrorBox: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    elevation: 1,
  },
  calendarErrorText: {
    marginTop: 10,
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
  },

  /* Stages list */
  stagesList: {
    paddingLeft: 4,
  },

  /* Stage row */
  stageRow: {
    flexDirection: "row",
    marginBottom: 0,
  },
  timelineCol: {
    alignItems: "center",
    width: 36,
    marginRight: 10,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  timelineDotText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 16,
    marginTop: 4,
    marginBottom: 4,
  },

  /* Stage card */
  stageCard: {
    flex: 1,
    borderRadius: 14,
    marginBottom: 10,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  stageCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  stageTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    flexWrap: "wrap",
    gap: 6,
  },
  stageName: {
    fontSize: 15,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF8F00",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    gap: 3,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#fff",
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  stageMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  stageMetaText: {
    fontSize: 12,
    color: "#6B7280",
  },
  progressTrack: {
    height: 5,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  stageStatusBadge: {
    alignItems: "center",
    marginLeft: 12,
    minWidth: 58,
  },
  stageStatusText: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
    textAlign: "center",
  },

  /* Stage detail */
  stageDetail: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    padding: 14,
    paddingTop: 10,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
    gap: 8,
  },
  detailKey: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    width: 110,
  },
  detailVal: {
    flex: 1,
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
  },
});

export default CropDetails;