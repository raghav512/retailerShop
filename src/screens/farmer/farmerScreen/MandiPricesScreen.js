import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  StatusBar,
  FlatList,
  InteractionManager
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { useState, useMemo, useEffect } from "react";
import { State, City } from "country-state-city";
import apiService from "../../../Redux/apiService";
import { FARMER_COLORS } from '../../../colorsList/ColorList';

const indianStates = State.getStatesOfCountry("IN");

const MandiPricesScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  
  const [mandiState, setMandiState] = useState("");
  const [mandiDistrict, setMandiDistrict] = useState("");
  const [mandiCommodity, setMandiCommodity] = useState("");
  const [mandiPrices, setMandiPrices] = useState([]);
  const [loadingMandi, setLoadingMandi] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showMandiStateDropdown, setShowMandiStateDropdown] = useState(false);
  const [showMandiDistrictDropdown, setShowMandiDistrictDropdown] = useState(false);
  const [stateSearch, setStateSearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");

  const districts = useMemo(() => mandiState ? City.getCitiesOfState("IN", mandiState) : [], [mandiState]);

  const filteredStates = useMemo(() => {
    if (!stateSearch) return indianStates;
    return indianStates.filter(s => s.name.toLowerCase().includes(stateSearch.toLowerCase()));
  }, [indianStates, stateSearch]);

  const filteredDistricts = useMemo(() => {
    if (!districtSearch) return districts;
    return districts.filter(d => d.name.toLowerCase().includes(districtSearch.toLowerCase()));
  }, [districts, districtSearch]);

  const fetchMandiPrices = async () => {
    if (!mandiState || !mandiDistrict || !mandiCommodity) return;
    try {
      setLoadingMandi(true);
      setHasSearched(true);
      const stateObj = indianStates.find(s => s.isoCode === mandiState);
      const stateName = stateObj ? stateObj.name : "";
      
      const res = await apiService.getMandiPrices(stateName, mandiDistrict, mandiCommodity);
      console.log('📦 Raw Mandi API Response:', JSON.stringify(res, null, 2));

      let finalPrices = [];
      if (Array.isArray(res?.data)) finalPrices = res.data;
      else if (Array.isArray(res?.data?.data)) finalPrices = res.data.data;
      else if (Array.isArray(res?.data?.records)) finalPrices = res.data.records;
      else if (Array.isArray(res?.records)) finalPrices = res.records;
      else if (Array.isArray(res)) finalPrices = res;

      setMandiPrices(finalPrices);
    } catch (error) {
      console.log('Error fetching mandi prices', error);
      setMandiPrices([]);
    } finally {
      setLoadingMandi(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Icon name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("mandi_prices", "Mandi Prices")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.mandiCard}>
          <Text style={styles.sectionTitle}>{t("check_market_prices", "Check Market Prices")}</Text>
          <Text style={styles.subtitle}>{t("enter_details_below", "Enter your state, district, and crop to see current market rates.")}</Text>
          
          {/* STATE */}
          <Text style={[styles.mandiLabel, {marginTop: 0}]}>{t("state", "State")}</Text>
          <TouchableOpacity style={styles.mandiSelect} onPress={() => { setShowMandiStateDropdown(!showMandiStateDropdown); setShowMandiDistrictDropdown(false); }}>
             <Text style={styles.mandiSelectText} numberOfLines={1}>{mandiState ? indianStates.find(s => s.isoCode === mandiState)?.name : t("select_state", "Select State")}</Text>
             <Icon name="chevron-down-outline" size={18} color={FARMER_COLORS.primaryLight} />
          </TouchableOpacity>
          
          {showMandiStateDropdown && (
            <View style={styles.dropdownList}>
              <TextInput style={styles.searchInputInline} placeholder={t("search_state", "Search state...")} placeholderTextColor="#999" value={stateSearch} onChangeText={setStateSearch} />
              <FlatList
                data={filteredStates}
                keyExtractor={item => item.isoCode}
                style={{maxHeight: 200}}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
                initialNumToRender={15}
                renderItem={({item}) => (
                  <TouchableOpacity style={styles.mandiOption} onPress={() => { setMandiState(item.isoCode); setMandiDistrict(""); setShowMandiStateDropdown(false); setStateSearch(""); }}>
                    <Text style={styles.mandiOptionText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {/* DISTRICT */}
          <Text style={styles.mandiLabel}>{t("district", "District")}</Text>
          <TouchableOpacity style={styles.mandiSelect} onPress={() => { setShowMandiDistrictDropdown(!showMandiDistrictDropdown); setShowMandiStateDropdown(false); }}>
             <Text style={styles.mandiSelectText} numberOfLines={1}>{mandiDistrict || t("select_district", "Select District")}</Text>
             <Icon name="chevron-down-outline" size={18} color={FARMER_COLORS.primaryLight} />
          </TouchableOpacity>

          {showMandiDistrictDropdown && (
            <View style={styles.dropdownList}>
              <TextInput style={styles.searchInputInline} placeholder={t("search_district", "Search district...")} placeholderTextColor="#999" value={districtSearch} onChangeText={setDistrictSearch} />
              <FlatList
                data={filteredDistricts}
                keyExtractor={item => item.name}
                style={{maxHeight: 200}}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
                initialNumToRender={15}
                ListEmptyComponent={() => (
                  <Text style={{padding: 15, textAlign: 'center', color: '#9CA3AF'}}>
                    {districts.length === 0 ? t("select_state_first", "Select state first") : t("no_results", "No matching results")}
                  </Text>
                )}
                renderItem={({item}) => (
                  <TouchableOpacity style={styles.mandiOption} onPress={() => { setMandiDistrict(item.name); setShowMandiDistrictDropdown(false); setDistrictSearch(""); }}>
                    <Text style={styles.mandiOptionText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {/* CROP */}
          <Text style={styles.mandiLabel}>{t("crop_commodity", "Crop / Commodity")}</Text>
          <TextInput 
             style={styles.mandiInput}
             placeholder={t("enter_crop", "Enter Crop (e.g., Wheat)")}
             placeholderTextColor="#9CA3AF"
             value={mandiCommodity}
             onChangeText={setMandiCommodity}
          />

          <TouchableOpacity style={[styles.mandiSearchBtn, (!mandiState || !mandiDistrict || !mandiCommodity) && {opacity: 0.6}]} onPress={fetchMandiPrices} disabled={!mandiState || !mandiDistrict || !mandiCommodity}>
             <Text style={styles.mandiSearchBtnText}>{t("check_prices", "Check Prices")}</Text>
          </TouchableOpacity>
        </View>

        {/* RESULTS */}
        {loadingMandi ? (
          <ActivityIndicator size="large" color={FARMER_COLORS.primaryLight} style={{marginTop: 40}} />
        ) : (
          <View style={styles.resultsContainer}>
            {mandiPrices && mandiPrices.length > 0 ? mandiPrices.map((price, index) => (
              <View key={index} style={styles.priceSquareCard}>
                <Text style={styles.priceMarketName} numberOfLines={1}>{price.market || "Mandi"}</Text>
                <Text style={styles.priceCommodity}>{price.commodity}</Text>
                <Text style={styles.priceValue}>₹{price.modal_price || price.price || "--"}</Text>
                <Text style={styles.priceDate}>{price.arrival_date || price.date || ""}</Text>
              </View>
            )) : (
              <Text style={styles.noPricesText}>
                {hasSearched 
                  ? t("no_prices_found", "No current prices found for this location and crop.")
                  : t("mandi_prices_hint", "Results will appear here.")}
              </Text>
            )}
          </View>
        )}

      </ScrollView>



    </View>
  );
};

export default MandiPricesScreen;

const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
  },
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16,
    backgroundColor: '#ffffff', borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    elevation: 8, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 }, zIndex: 10, justifyContent: 'space-between',
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  mandiCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 10,
    zIndex: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 16,
  },
  mandiLabel: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 6,
    marginTop: 12,
    fontWeight: '600',
  },
  mandiSelect: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
  },
  mandiSelectText: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  mandiInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: '#FAFAFA',
  },
  dropdownList: {
    maxHeight: 220,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    marginTop: 8,
    backgroundColor: '#ffffff',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  searchInputInline: {
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1F2937',
    backgroundColor: '#F9FAF8',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  mandiOption: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderColor: '#F3F4F6',
  },
  mandiOptionText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  mandiSearchBtn: {
    backgroundColor: FARMER_COLORS.primaryLight,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  mandiSearchBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  resultsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  priceSquareCard: {
    width: '48%',
    height: 140,
    backgroundColor: '#FEF9E7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  priceMarketName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  priceCommodity: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: FARMER_COLORS.primaryLight,
    marginBottom: 4,
  },
  priceDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  noPricesText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    width: '100%',
    paddingVertical: 10,
    fontStyle: 'italic',
  }
});
