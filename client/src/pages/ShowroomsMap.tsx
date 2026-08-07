import React, { useState, useRef, useCallback } from 'react';
import {
  MapPin, Search, Phone, Clock, BatteryCharging,
  Navigation, ExternalLink, X, Locate, Zap, AlertCircle, CheckCircle2
} from 'lucide-react';

// ============================================================
// Haversine formula – tính khoảng cách (km) giữa 2 tọa độ GPS
// ============================================================
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ============================================================
// DATA: Tọa độ GPS thực – Showroom & Trạm sạc VinFast
// ============================================================
const locationsData = [
  { id: 1,  name: 'VinFast Showroom Ocean Park',          type: 'showroom', address: 'Vinhomes Ocean Park, Gia Lâm, Hà Nội',             phone: '1900 23 23 89', hours: '08:00–21:00', chargers: '2 cổng 250kW, 8 cổng 60kW',       lat: 20.9972, lng: 105.9388, city: 'Hà Nội' },
  { id: 2,  name: 'VinFast Smart City Tây Mỗ',            type: 'showroom', address: 'Vincom Mega Mall Smart City, Nam Từ Liêm, HN',       phone: '1900 23 23 89', hours: '08:00–22:00', chargers: '4 cổng 150kW, 12 cổng 30kW',      lat: 20.9762, lng: 105.7534, city: 'Hà Nội' },
  { id: 3,  name: 'VinFast Showroom Times City',           type: 'showroom', address: '458 Minh Khai, Hai Bà Trưng, Hà Nội',               phone: '1900 23 23 89', hours: '08:00–21:00', chargers: '6 cổng nhanh 60kW',               lat: 21.0024, lng: 105.8612, city: 'Hà Nội' },
  { id: 4,  name: 'Trạm sạc Cao tốc HN – HP (Km52)',      type: 'charger',  address: 'Trạm dừng Km52, Cao tốc Hà Nội – Hải Phòng',       phone: '1900 23 23 89', hours: '24/7',        chargers: '12 cổng 150kW, 4 cổng 250kW',    lat: 20.9438, lng: 106.3372, city: 'Hải Dương' },
  { id: 5,  name: 'VinFast Showroom Landmark 81',          type: 'showroom', address: 'Vincom Center Landmark 81, Q.Bình Thạnh, TP.HCM',   phone: '1900 23 23 89', hours: '09:00–22:00', chargers: '6 cổng 250kW, 10 cổng 60kW',     lat: 10.7950, lng: 106.7218, city: 'TP.HCM' },
  { id: 6,  name: 'VinFast Showroom Grand Park',           type: 'showroom', address: 'Vincom Mega Mall Grand Park, Thủ Đức, TP.HCM',      phone: '1900 23 23 89', hours: '09:00–22:00', chargers: '8 cổng siêu nhanh 150kW',         lat: 10.8548, lng: 106.7983, city: 'TP.HCM' },
  { id: 7,  name: 'Trạm sạc HCM – Long Thành (Km20)',     type: 'charger',  address: 'Trạm dừng Km20, Cao tốc HCM – Long Thành, ĐNai',   phone: '1900 23 23 89', hours: '24/7',        chargers: '16 cổng 250kW',                   lat: 10.8167, lng: 106.9167, city: 'TP.HCM' },
  { id: 8,  name: 'Trạm sạc Gigamall Thủ Đức',            type: 'charger',  address: '240-242 Phạm Văn Đồng, Bình Thạnh, TP.HCM',        phone: '1900 23 23 89', hours: '24/7',        chargers: '6 cổng siêu nhanh 150kW',         lat: 10.8372, lng: 106.7344, city: 'TP.HCM' },
  { id: 9,  name: 'Trạm sạc Aeon Mall Tân Phú',           type: 'charger',  address: 'Aeon Mall Tân Phú, 30 Bờ Bao Tân Thắng, TP.HCM',   phone: '1900 23 23 89', hours: '07:00–22:00', chargers: '8 cổng 60kW, 2 cổng 150kW',      lat: 10.7910, lng: 106.6284, city: 'TP.HCM' },
  { id: 10, name: 'VinFast Showroom Đà Nẵng',             type: 'showroom', address: '115 Nguyễn Văn Linh, Q.Hải Châu, Đà Nẵng',         phone: '1900 23 23 89', hours: '08:00–20:00', chargers: '4 cổng nhanh 60kW',               lat: 16.0544, lng: 108.2022, city: 'Đà Nẵng' },
  { id: 11, name: 'Trạm sạc Hầm Hải Vân (Nam)',           type: 'charger',  address: 'Trạm trung chuyển Hầm Hải Vân, Liên Chiểu, ĐN',    phone: '1900 23 23 89', hours: '24/7',        chargers: '8 cổng siêu nhanh 150kW',         lat: 16.1294, lng: 108.0932, city: 'Đà Nẵng' },
  { id: 12, name: 'VinFast Showroom Vincom Huế',          type: 'showroom', address: 'TTTM Vincom Huế, 50A Hùng Vương, Huế',              phone: '1900 23 23 89', hours: '09:00–21:00', chargers: '4 cổng 60kW',                     lat: 16.4637, lng: 107.5909, city: 'Huế' },
  { id: 13, name: 'Trạm sạc Nha Trang (Vinpearl)',        type: 'charger',  address: 'Khu du lịch Vinpearl, Vĩnh Nguyên, Nha Trang',      phone: '1900 23 23 89', hours: '24/7',        chargers: '10 cổng 150kW',                   lat: 12.2388, lng: 109.1967, city: 'Nha Trang' },
  { id: 14, name: 'VinFast Showroom Cần Thơ',             type: 'showroom', address: 'TTTM Vincom Cần Thơ, Ninh Kiều, Cần Thơ',           phone: '1900 23 23 89', hours: '09:00–21:00', chargers: '6 cổng 60kW',                     lat: 10.0341, lng: 105.7852, city: 'Cần Thơ' },
  { id: 15, name: 'Trạm sạc Cần Thơ (QL1A)',              type: 'charger',  address: 'Trạm dừng QL1A Km1973, Cần Thơ',                    phone: '1900 23 23 89', hours: '24/7',        chargers: '8 cổng 150kW',                    lat: 10.0519, lng: 105.7726, city: 'Cần Thơ' },
];

type LocationItem = (typeof locationsData)[0] & { distanceKm?: number };

// ============================================================
// Main Component
// ============================================================
export default function ShowroomsMap() {
  const [filterType, setFilterType] = useState<'all' | 'showroom' | 'charger'>('all');
  const [filterCity, setFilterCity] = useState('TP.HCM');
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<LocationItem>(locationsData.find(l => l.id === 5)!);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [nearestCharger, setNearestCharger] = useState<LocationItem | null>(null);
  const [showNearestBanner, setShowNearestBanner] = useState(false);

  const cities = ['Tất cả', ...Array.from(new Set(locationsData.map(l => l.city)))];

  // Attach distance if user pos known
  const withDistance = (loc: typeof locationsData[0]): LocationItem =>
    userPos
      ? { ...loc, distanceKm: haversineKm(userPos.lat, userPos.lng, loc.lat, loc.lng) }
      : loc;

  const filtered: LocationItem[] = locationsData
    .map(withDistance)
    .filter(loc => {
      const matchType = filterType === 'all' || loc.type === filterType;
      const matchCity = filterCity === 'Tất cả' || loc.city === filterCity;
      const matchSearch =
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.city.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchCity && matchSearch;
    })
    .sort((a, b) =>
      userPos && a.distanceKm !== undefined && b.distanceKm !== undefined
        ? a.distanceKm - b.distanceKm
        : 0
    );

  // ---- Find nearest CHARGER using browser GPS ----
  const findNearestCharger = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Trình duyệt không hỗ trợ định vị GPS.');
      return;
    }
    setGpsLoading(true);
    setGpsError('');
    setShowNearestBanner(false);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPos({ lat: latitude, lng: longitude });

        // Find nearest charger
        const chargers = locationsData.filter(l => l.type === 'charger');
        const ranked = chargers
          .map(c => ({ ...c, distanceKm: haversineKm(latitude, longitude, c.lat, c.lng) }))
          .sort((a, b) => a.distanceKm - b.distanceKm);

        const nearest = ranked[0];
        setNearestCharger(nearest);
        setSelected(nearest);
        setFilterType('all');
        setFilterCity('Tất cả');
        setShowNearestBanner(true);
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) setGpsError('Bạn đã từ chối quyền truy cập vị trí. Vui lòng cho phép trong cài đặt trình duyệt.');
        else setGpsError('Không thể xác định vị trí của bạn. Vui lòng thử lại.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const mapEmbedUrl = `https://www.google.com/maps?q=${selected.lat},${selected.lng}&z=16&output=embed`;

  const openDirections = () => {
    const dest = `${selected.lat},${selected.lng}`;
    const origin = userPos ? `${userPos.lat},${userPos.lng}` : '';
    const url = `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${origin}` : ''}&destination=${dest}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const openInGoogleMaps = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${selected.lat},${selected.lng}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-gray-900">
      {/* Title */}
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-wider">
          MẠNG LƯỚI SHOWROOM & TRẠM SẠC
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto text-xs">
          Hơn 200 showroom và 150.000+ cổng sạc VinFast trên toàn quốc.
        </p>
      </div>

      {/* ==================== NEAREST CHARGER HERO BUTTON ==================== */}
      <div className="mb-6 flex flex-col items-center gap-3">
        <button
          onClick={findNearestCharger}
          disabled={gpsLoading}
          className="relative group flex items-center gap-3 bg-blue-600 px-8 py-4 rounded-2xl text-sm font-extrabold uppercase tracking-wider shadow-sm hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {gpsLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Đang xác định vị trí của bạn...
            </>
          ) : (
            <>
              <Locate className="w-5 h-5" />
              ⚡ Tìm Trạm Sạc Gần Tôi Nhất
              <span className="absolute -top-2 -right-2 bg-red-500 text-gray-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                GPS
              </span>
            </>
          )}
        </button>

        {/* GPS Error */}
        {gpsError && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-2.5 rounded-xl max-w-lg text-center">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {gpsError}
          </div>
        )}

        {/* Nearest charger result banner */}
        {showNearestBanner && nearestCharger && (
          <div className="w-full max-w-2xl bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-[10px] text-green-400 font-bold uppercase">Trạm sạc gần bạn nhất</span>
                </div>
                <p className="font-extrabold text-sm text-gray-900 mt-0.5">{nearestCharger.name}</p>
                <p className="text-[10px] text-gray-500">{nearestCharger.address}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-green-400 font-extrabold text-sm">
                    📍 {nearestCharger.distanceKm!.toFixed(1)} km
                  </span>
                  <span className="text-[10px] text-gray-500">{nearestCharger.chargers}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  setSelected(nearestCharger);
                  window.open(
                    `https://www.google.com/maps/dir/?api=1${userPos ? `&origin=${userPos.lat},${userPos.lng}` : ''}&destination=${nearestCharger.lat},${nearestCharger.lng}&travelmode=driving`,
                    '_blank'
                  );
                }}
                className="flex items-center gap-1.5 bg-green-500 hover:bg-green-400 px-4 py-2 rounded-lg text-[10px] font-bold text-gray-900 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                Chỉ Đường
              </button>
              <button
                onClick={() => setShowNearestBanner(false)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ==================== Left Panel ==================== */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-white border border-gray-100 p-4 rounded-2xl space-y-3">
            {/* City pills */}
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase mb-1.5">📍 Tỉnh thành</p>
              <div className="flex flex-wrap gap-1.5">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setFilterCity(city);
                      setShowNearestBanner(false);
                      if (city !== 'Tất cả') {
                        const first = locationsData.find(l => l.city === city);
                        if (first) setSelected(first);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      filterCity === city
                        ? 'bg-blue-600 border-blue-500 text-gray-900'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên, địa chỉ..."
                className="w-full bg-gray-50 border border-gray-100 focus:border-blue-300 rounded-lg px-3.5 pr-9 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none transition-colors"
              />
              {searchQuery ? (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-900">
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
              )}
            </div>

            {/* Type filter */}
            <div className="flex gap-2">
              {(['all', 'showroom', 'charger'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                    filterType === t
                      ? 'bg-blue-600 border-blue-500 text-gray-900'
                      : 'border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  {t === 'all' ? 'Tất cả' : t === 'showroom' ? 'Showroom' : 'Trạm Sạc'}
                </button>
              ))}
            </div>

            <p className="text-[10px] text-gray-400">
              {userPos && <span className="text-green-400 font-bold mr-1">📡 GPS đang hoạt động •</span>}
              <span className="text-blue-600 font-bold">{filtered.length}</span> địa điểm
              {filterCity !== 'Tất cả' && <span> tại <span className="text-gray-900 font-bold">{filterCity}</span></span>}
              {userPos && <span className="ml-1 text-gray-500">• Sắp xếp theo khoảng cách</span>}
            </p>
          </div>

          {/* Location Cards */}
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-xs">
                Không tìm thấy địa điểm phù hợp.
              </div>
            ) : (
              filtered.map(loc => (
                <div
                  key={loc.id}
                  onClick={() => { setSelected(loc); setShowNearestBanner(false); }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selected.id === loc.id
                      ? 'bg-blue-50 border-blue-500 shadow-sm'
                      : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <h4 className="font-bold text-xs text-gray-900 leading-tight pr-2">{loc.name}</h4>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                        loc.type === 'showroom'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-green-500/15 text-green-400'
                      }`}>
                        {loc.type === 'showroom' ? '🏢 Showroom' : '⚡ Trạm Sạc'}
                      </span>
                      {loc.distanceKm !== undefined && (
                        <span className="text-[9px] font-extrabold text-yellow-400">
                          📍 {loc.distanceKm < 1 ? `${(loc.distanceKm * 1000).toFixed(0)}m` : `${loc.distanceKm.toFixed(1)}km`}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 mb-2 flex items-start gap-1">
                    <MapPin className="w-3 h-3 flex-shrink-0 text-blue-600 mt-0.5" />
                    {loc.address}
                  </p>
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-blue-600" /> {loc.hours}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-blue-600" /> {loc.phone}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ==================== Right Panel: Google Map ==================== */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Info bar */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                selected.type === 'showroom' ? 'bg-blue-50' : 'bg-green-500/20'
              }`}>
                {selected.type === 'showroom'
                  ? <MapPin className="w-5 h-5 text-blue-600" />
                  : <BatteryCharging className="w-5 h-5 text-green-400" />}
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-sm text-gray-900 truncate">{selected.name}</p>
                <p className="text-[10px] text-gray-500 truncate">{selected.address}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className="text-[10px] text-blue-600">{selected.chargers}</p>
                  {(selected as LocationItem).distanceKm !== undefined && (
                    <span className="text-[10px] text-yellow-400 font-bold">
                      📍 {(selected as LocationItem).distanceKm! < 1
                        ? `${((selected as LocationItem).distanceKm! * 1000).toFixed(0)}m`
                        : `${(selected as LocationItem).distanceKm!.toFixed(1)}km từ bạn`}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={openInGoogleMaps}
                className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 px-3 py-2 rounded-lg text-[10px] font-bold text-gray-900 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Xem Maps
              </button>
              <button
                onClick={openDirections}
                className="flex items-center gap-1.5 bg-blue-600 px-4 py-2 rounded-lg text-[10px] font-bold text-gray-900 shadow-sm hover:opacity-90 transition-opacity"
              >
                <Navigation className="w-3.5 h-3.5" />
                Chỉ Đường
              </button>
            </div>
          </div>

          {/* Google Maps iframe */}
          <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-md" style={{ height: '490px' }}>
            <iframe
              key={selected.id}
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Bản đồ ${selected.name}`}
            />
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-100/80 to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-100 backdrop-blur border border-gray-200 px-4 py-2 rounded-full shadow-md whitespace-nowrap">
              <div className={`w-2 h-2 rounded-full animate-pulse ${selected.type === 'charger' ? 'bg-green-400' : 'bg-blue-600'}`} />
              <span className="text-[10px] font-bold text-gray-900">{selected.name}</span>
              {(selected as LocationItem).distanceKm !== undefined && (
                <span className="text-[10px] text-yellow-400 font-bold ml-1">
                  • {(selected as LocationItem).distanceKm!.toFixed(1)}km
                </span>
              )}
              <button onClick={openDirections} className="ml-2 flex items-center gap-1 text-blue-600 text-[10px] font-bold hover:underline">
                <Navigation className="w-3 h-3" /> Chỉ đường
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Showrooms', value: `${locationsData.filter(l => l.type === 'showroom').length}+`, icon: '🏢' },
              { label: 'Trạm sạc', value: '150,000+', icon: '⚡' },
              { label: 'Tỉnh thành', value: '63/63', icon: '📍' },
            ].map(stat => (
              <div key={stat.label} className="bg-white border border-gray-100 p-3 rounded-xl text-center">
                <p className="text-xl">{stat.icon}</p>
                <p className="text-sm font-extrabold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-[9px] text-gray-400 uppercase font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

