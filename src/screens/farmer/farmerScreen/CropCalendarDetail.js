import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import apiService from '../../../Redux/apiService';
import { showAlert } from '../../../common/reusableComponent/CustomAlert';
import { FARMER_COLORS } from '../../../colorsList/ColorList';
import { useTranslation } from 'react-i18next';

const THEME = FARMER_COLORS.primaryLight;
const THEME_LIGHT = '#e2f0c9';
const THEME_DARK = FARMER_COLORS.primaryDark;

/* ─── helpers ─── */
const daysSince = (dateStr) => {
  if (!dateStr) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000));
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

/**
 * Safely convert any value to a readable string —
 * handles nested objects and arrays of objects.
 */
const safeFormat = (val, depth = 0, t) => {
  if (val === null || val === undefined) return t ? t('crop_calendar.na') : 'N/A';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (typeof val !== 'object') return String(val);

  if (Array.isArray(val)) {
    if (val.length === 0) return t ? t('crop_calendar.none') : 'None';
    return val
      .map((item) =>
        typeof item === 'object' && item !== null
          ? Object.entries(item)
              .filter(([k]) => k !== '_id')
              .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${safeFormat(v, depth + 1, t)}`)
              .join(' | ')
          : String(item)
      )
      .join(depth === 0 ? '\n' : ', ');
  }

  // Plain object
  return Object.entries(val)
    .filter(([k]) => k !== '_id')
    .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${safeFormat(v, depth + 1, t)}`)
    .join(' | ');
};

/**
 * Enrich stages with { startDay, endDay, status, stageProgress }.
 * status: 'completed' | 'active' | 'upcoming'
 * Falls back to 0 duration if no duration key found.
 */
const enrichStages = (stages = [], currentDay) => {
  let cursor = 0;
  return stages.map((stage) => {
    const duration = Number(
      stage.duration_days ?? stage.duration ?? stage.days ?? stage.total_days ?? 0
    );
    const startDay = cursor;
    const endDay = cursor + duration;
    cursor = endDay;

    const status =
      currentDay >= endDay
        ? 'completed'
        : currentDay >= startDay
        ? 'active'
        : 'upcoming';

    const stageProgress =
      status === 'completed'
        ? 1
        : status === 'active'
        ? Math.min((currentDay - startDay) / Math.max(duration, 1), 1)
        : 0;

    return { ...stage, startDay, endDay, duration, status, stageProgress };
  });
};

/* ─── AnimatedProgressBar ─── */
const AnimatedProgressBar = ({ progress, color }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: progress, duration: 850, useNativeDriver: false }).start();
  }, [progress]);
  return (
    <View style={pb.track}>
      <Animated.View
        style={[
          pb.fill,
          {
            backgroundColor: color,
            width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          },
        ]}
      />
    </View>
  );
};
const pb = StyleSheet.create({
  track: { height: 5, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
});

/* ─── ProgressStageCard ─── */
const ProgressStageCard = ({ stage, index, isLast, t }) => {
  const [expanded, setExpanded] = useState(stage.status === 'active');

  const statusColor =
    stage.status === 'completed' ? THEME :
    stage.status === 'active'   ? '#F59E0B' : '#9CA3AF';

  const statusBg =
    stage.status === 'completed' ? '#F0FFF4' :
    stage.status === 'active'   ? '#FFFBEB' : '#F9FAFB';

  const statusLabel =
    stage.status === 'completed' ? t('crop_calendar.status_done') :
    stage.status === 'active'   ? t('crop_calendar.status_active') : t('crop_calendar.status_upcoming');

  const dotIcon =
    stage.status === 'completed' ? 'checkmark-circle' :
    stage.status === 'active'   ? 'radio-button-on' : 'ellipse-outline';

  const SKIP = new Set([
    '_id', 'stage_name', 'name', 'duration_days', 'duration', 'days',
    'total_days', 'startDay', 'endDay', 'status', 'stageProgress',
  ]);

  const details = Object.entries(stage).filter(
    ([k, v]) => !SKIP.has(k) && v !== null && v !== undefined && v !== ''
  );

  return (
    <View style={tl.row}>
      {/* Timeline column */}
      <View style={tl.col}>
        <View style={[tl.dot, { backgroundColor: statusColor }]}>
          <Text style={tl.dotText}>{index + 1}</Text>
        </View>
        {!isLast && <View style={[tl.line, { backgroundColor: stage.status === 'completed' ? THEME : '#E5E7EB' }]} />}
      </View>

      {/* Card */}
      <TouchableOpacity
        style={[tl.card, { backgroundColor: statusBg }]}
        onPress={() => setExpanded(p => !p)}
        activeOpacity={0.85}
      >
        {/* Header row */}
        <View style={tl.cardHead}>
          <View style={{ flex: 1 }}>
            {/* Stage name + status badge */}
            <View style={tl.nameRow}>
              <Text style={[tl.stageName, { color: statusColor }]}>
                {stage.stage_name || stage.name || `Stage ${index + 1}`}
              </Text>
              <View style={[tl.badge, { backgroundColor: statusColor + '22' }]}>
                <Icon name={dotIcon} size={11} color={statusColor} />
                <Text style={[tl.badgeText, { color: statusColor }]}>{statusLabel}</Text>
              </View>
              {stage.status === 'active' && (
                <View style={tl.livePulse}>
                  <View style={tl.liveDot} />
                  <Text style={tl.liveText}>{t('crop_calendar.status_live')}</Text>
                </View>
              )}
            </View>

            {/* Day range */}
            <Text style={tl.dayRange}>
              {t('crop_calendar.day')} {stage.startDay} → {stage.endDay}  ({stage.duration} {t('crop_calendar.day')}s)
            </Text>

            {/* Progress bar */}
            <AnimatedProgressBar progress={stage.stageProgress} color={statusColor} />
          </View>

          <Icon
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="#9CA3AF"
            style={{ marginLeft: 10, marginTop: 4 }}
          />
        </View>

        {/* Expanded details */}
        {expanded && details.length > 0 && (
          <View style={tl.details}>
            {details.map(([key, val]) => (
              <View key={key} style={tl.detailRow}>
                <Text style={tl.detailKey}>
                  {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </Text>
                <Text style={tl.detailVal}>
                  {safeFormat(val, 0, t)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const tl = StyleSheet.create({
  row: { flexDirection: 'row', marginBottom: 0 },
  col: { alignItems: 'center', width: 34, marginRight: 10 },
  dot: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', zIndex: 1,
  },
  dotText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  line: { width: 2, flex: 1, minHeight: 14, marginTop: 4, marginBottom: 4 },

  card: {
    flex: 1, borderRadius: 14, marginBottom: 10,
    padding: 13, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start' },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  stageName: { fontSize: 14, fontWeight: '700', textTransform: 'capitalize' },

  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2,
  },
  badgeText: { fontSize: 10, fontWeight: '700' },

  livePulse: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#F59E0B', borderRadius: 8,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  liveDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#fff' },
  liveText: { fontSize: 10, fontWeight: '700', color: '#fff' },

  dayRange: { fontSize: 11, color: '#6B7280', marginBottom: 7 },

  details: { borderTopWidth: 1, borderTopColor: '#E5E7EB', marginTop: 10, paddingTop: 10 },
  detailRow: { flexDirection: 'row', marginBottom: 7, gap: 8 },
  detailKey: { fontSize: 12, fontWeight: '600', color: '#6B7280', width: 108 },
  detailVal: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 18 },
});

/* ─── renderValue helper (for non-stage sections) ─── */
const renderValue = (value, depth = 0, t) => {
  if (value === null || value === undefined) return <Text style={s.sectionContent}>{t ? t('crop_calendar.na') : 'N/A'}</Text>;

  if (Array.isArray(value)) {
    if (value.length === 0) return <Text style={s.sectionContent}>{t ? t('crop_calendar.none') : 'None'}</Text>;
    return (
      <View style={{ marginLeft: depth * 10 }}>
        {value.map((item, i) => (
          <View key={i} style={s.listItem}>
            <Icon name="checkmark-circle" size={14} color="#10B981" />
            <View style={{ flex: 1, marginLeft: 6 }}>
              {typeof item === 'object' && item !== null
                ? renderValue(item, depth + 1, t)
                : <Text style={s.listItemText}>{String(item)}</Text>}
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (typeof value === 'object') {
    return (
      <View style={{ marginLeft: depth * 10 }}>
        {Object.entries(value).map(([key, val]) => {
          if (key === '_id') return null;
          
          // Try to translate the key
          const translationKey = `crop_calendar.${key.toLowerCase()}`;
          const translatedKey = t ? t(translationKey) : key;
          const displayKey = translatedKey !== translationKey ? translatedKey : key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          
          return (
            <View key={key} style={s.objectItem}>
              <Text style={s.objectKey}>
                {displayKey}:
              </Text>
              {renderValue(val, depth + 1, t)}
            </View>
          );
        })}
      </View>
    );
  }

  return <Text style={s.sectionContent}>{String(value)}</Text>;
};

const ICON_MAP = {
  total_duration_days: 'time-outline',
  variety: 'flower-outline',
  season: 'sunny-outline',
  sowing_time: 'calendar-outline',
  harvesting_time: 'calendar-outline',
  duration: 'time-outline',
  soil_type: 'earth-outline',
  climate: 'partly-sunny-outline',
  temperature: 'thermometer-outline',
  rainfall: 'rainy-outline',
  land_preparation: 'construct-outline',
  seed_rate: 'nutrition-outline',
  spacing: 'resize-outline',
  irrigation: 'water-outline',
  fertilizers: 'flask-outline',
  organic_manure: 'leaf-outline',
  common_pests: 'bug-outline',
  common_diseases: 'medical-outline',
  pest_control: 'shield-checkmark-outline',
  disease_control: 'medkit-outline',
  harvesting_method: 'cut-outline',
  yield: 'trending-up-outline',
  post_harvest: 'archive-outline',
  market_price: 'cash-outline',
  storage: 'cube-outline',
  additional_tips: 'bulb-outline',
  notes: 'document-text-outline',
};

const fmtKey = (k, t) => {
  // Try to get translation first
  const translationKey = `crop_calendar.${k.toLowerCase()}`;
  const translated = t(translationKey);
  
  // If translation exists and is different from the key, use it
  if (translated !== translationKey) {
    return translated;
  }
  
  // Otherwise, format the key as before
  return k.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

/* ══════════════════════════════════════════════
   MAIN SCREEN
══════════════════════════════════════════════ */
const CropCalendarDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { cropName, variety, sowingDate } = route.params;   // variety and sowingDate optional
  const { t } = useTranslation();

  const [cropData, setCropData] = useState(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (cropName) fetchCropDetail();
  }, []);

  const fetchCropDetail = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCropCalendarByName(cropName, variety);
      setCropData(response.data);
    } catch (error) {
      showAlert({ type: 'error', title: t('error'), message: t('crop_calendar.error_fetch') });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  /* Derived */
  const currentDay = daysSince(sowingDate);
  const totalDays = cropData?.total_duration_days ?? 0;
  const overallProgress = sowingDate && totalDays ? Math.min(currentDay / totalDays, 1) : null;
  const stages = cropData?.stages ?? [];
  const enriched = sowingDate ? enrichStages(stages, currentDay) : [];
  const activeStage = enriched.find(st => st.status === 'active');
  const completedCount = enriched.filter(st => st.status === 'completed').length;
  
  // Get crop name based on language
  const currentLanguage = t('i18n_locale');
  const displayCropName = currentLanguage === 'hi-IN' && cropData?.crop_name 
    ? cropData.crop_name 
    : (cropData?.crop_name_english || cropData?.crop_name || 'Unknown Crop');
  
  // Get crop type based on language
  const displayCropType = cropData?.crop_type 
    ? (t(`crop_calendar.${cropData.crop_type.toLowerCase()}`) !== `crop_calendar.${cropData.crop_type.toLowerCase()}` 
        ? t(`crop_calendar.${cropData.crop_type.toLowerCase()}`) 
        : cropData.crop_type)
    : null;

  /* ── Loading state ── */
  if (loading) {
    return (
      <View style={s.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={FARMER_COLORS.primary} translucent={false} />
        
        {/* Gradient Header */}
        <LinearGradient
          colors={[FARMER_COLORS.primary, FARMER_COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.gradientHeader}
        >
          <View style={s.header}>
            <TouchableOpacity
              style={s.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={s.headerCenter}>
              <Text style={s.headerTitle}>{t('crop_calendar.header_title')}</Text>
            </View>
            <View style={{ width: 42 }} />
          </View>
        </LinearGradient>
        
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={THEME} />
          <Text style={s.loadingText}>{t('crop_calendar.loading')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={FARMER_COLORS.primary} translucent={false} />

      {/* Gradient Header */}
      <LinearGradient
        colors={[FARMER_COLORS.primary, FARMER_COLORS.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.gradientHeader}
      >
        <View style={s.header}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>{t('crop_calendar.header_title')}</Text>
          </View>
          <View style={{ width: 42 }} />
        </View>
      </LinearGradient>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ── Hero card ── */}
        <View style={s.heroCard}>
          <Icon name="leaf" size={44} color={THEME} />
          <View style={s.heroNameContainer}>
            <Text style={s.heroName}>{displayCropName}</Text>
            {variety && (
              <Text style={s.heroVariety}>- {variety}</Text>
            )}
          </View>
          {displayCropType && (
            <View style={s.typePill}>
              <Text style={s.typePillText}>{displayCropType}</Text>
            </View>
          )}
          {cropData?.scientific_name && (
            <Text style={s.scientificName}>{cropData.scientific_name}</Text>
          )}
          {sowingDate && (
            <View style={s.sownRow}>
              <Icon name="calendar-outline" size={13} color="#6B7280" />
              <Text style={s.sownText}>{t('crop_calendar.sown')} {formatDate(sowingDate)}</Text>
              <View style={s.dayBadge}>
                <Text style={s.dayBadgeText}>{t('crop_calendar.day')} {currentDay}</Text>
              </View>
            </View>
          )}
        </View>

        {/* ── Overall progress (only when sowing date known) ── */}
        {overallProgress !== null && (
          <View style={s.overallCard}>
            <View style={s.overallTop}>
              <Text style={s.overallTitle}>{t('crop_calendar.overall_progress')}</Text>
              <Text style={s.overallPct}>{Math.round(overallProgress * 100)}%</Text>
            </View>

            <AnimatedProgressBar progress={overallProgress} color={THEME} />

            <View style={s.overallBottom}>
              <Text style={s.overallSub}>{t('crop_calendar.day')} {currentDay} {t('crop_calendar.of')} {totalDays}</Text>
              <Text style={s.overallSub}>{completedCount}/{enriched.length} {t('crop_calendar.stages_done')}</Text>
            </View>

            {activeStage && (
              <View style={s.activeStagePill}>
                <Icon name="flash" size={13} color="#F59E0B" />
                <Text style={s.activeStagePillText}>
                  {t('crop_calendar.currently')} {activeStage.stage_name || activeStage.name}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ══ GROWTH STAGES ══ */}
        {stages.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Icon name="git-network-outline" size={18} color={THEME} />
              <Text style={s.sectionTitle}>{t('crop_calendar.growth_stages')}</Text>
              {!sowingDate && (
                <Text style={s.noDateHint}>{t('crop_calendar.add_sowing_hint')}</Text>
              )}
            </View>

            {/* Progressive timeline (when sowingDate given) */}
            {sowingDate ? (
              <View style={{ paddingLeft: 2, paddingTop: 8 }}>
                {enriched.map((stage, i) => (
                  <ProgressStageCard
                    key={i}
                    stage={stage}
                    index={i}
                    isLast={i === enriched.length - 1}
                    t={t}
                  />
                ))}
              </View>
            ) : (
              /* Plain accordion (no sowing date) */
              <PlainStagesAccordion stages={stages} t={t} />
            )}
          </View>
        )}

        {/* ══ OTHER INFO SECTIONS ══ */}
        {cropData && Object.entries(cropData).map(([key, value]) => {
          if (['_id', 'crop_name', 'crop_name_english', 'scientific_name', 'crop_type', '__v', 'generated_at', 'stages', 'createdAt', 'updatedAt'].includes(key)) return null;
          if (value === null || value === undefined || value === '') return null;

          return (
            <View key={key} style={s.section}>
              <View style={s.sectionHeader}>
                <Icon name={ICON_MAP[key] || 'information-circle-outline'} size={18} color={THEME} />
                <Text style={s.sectionTitle}>{fmtKey(key, t)}</Text>
              </View>
              {renderValue(value, 0, t)}
            </View>
          );
        })}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

/* Plain stages accordion (no sowing date) */
const PlainStagesAccordion = ({ stages, t }) => {
  const [expanded, setExpanded] = useState({});
  const toggle = (i) => setExpanded(p => ({ ...p, [i]: !p[i] }));

  return (
    <>
      {stages.map((stage, i) => (
        <View key={i} style={s.accordionItem}>
          <TouchableOpacity
            style={s.accordionHeader}
            onPress={() => toggle(i)}
            activeOpacity={0.7}
          >
            <View style={s.stageNum}>
              <Text style={s.stageNumText}>{i + 1}</Text>
            </View>
            <Text style={s.accordionTitle}>
              {stage.stage_name || stage.name || `Stage ${i + 1}`}
            </Text>
            <Icon name={expanded[i] ? 'chevron-up' : 'chevron-down'} size={18} color={THEME} />
          </TouchableOpacity>
          {expanded[i] && (
            <View style={s.accordionBody}>{renderValue(stage, 0, t)}</View>
          )}
        </View>
      ))}
    </>
  );
};

/* ─── Styles ─── */
const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },
  /* GRADIENT HEADER */
  gradientHeader: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    textTransform: 'capitalize',
  },
  headerVariety: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    fontStyle: 'italic',
    opacity: 0.9,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
  scroll: { flex: 1, backgroundColor: '#F4F6F8' },
  content: { padding: 16 },

  /* Hero */
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 14,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  heroNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    textTransform: 'capitalize',
  },
  heroVariety: {
    fontSize: 19,
    fontWeight: '600',
    color: THEME,
    fontStyle: 'italic',
  },
  typePill: {
    backgroundColor: THEME_LIGHT,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 6,
  },
  typePillText: { fontSize: 13, fontWeight: '600', color: THEME },
  scientificName: { fontSize: 12, color: '#6B7280', fontStyle: 'italic', marginTop: 4 },
  sownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  sownText: { fontSize: 13, color: '#6B7280' },
  dayBadge: {
    backgroundColor: THEME,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  dayBadgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  /* Overall progress */
  overallCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
    shadowColor: THEME,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  overallTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  overallTitle: { fontSize: 14, fontWeight: '700', color: THEME_DARK },
  overallPct: { fontSize: 18, fontWeight: '800', color: THEME },
  overallBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  overallSub: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  activeStagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  activeStagePillText: { fontSize: 13, fontWeight: '600', color: '#D97706' },

  /* Sections */
  section: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
    flexWrap: 'wrap',
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  noDateHint: { fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' },

  sectionContent: { fontSize: 14, color: '#4B5563', lineHeight: 20 },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 7 },
  listItemText: { fontSize: 14, color: '#4B5563', flex: 1 },
  objectItem: { marginBottom: 7 },
  objectKey: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 3 },

  /* Plain accordion */
  accordionItem: {
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
  },
  stageNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stageNumText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  accordionTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textTransform: 'capitalize',
  },
  accordionBody: {
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});

export default CropCalendarDetail;
