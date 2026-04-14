import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Clock, Star, Phone, Activity, Search, CheckCircle, BadgeCheck } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const libraries = ['places'];
const mapContainerStyle = { width: '100%', height: '100%', borderRadius: '1rem' };
const defaultCenter = { lat: 28.6139, lng: 77.2090 }; // Default: New Delhi (Fallback)

export default function AppointmentBookingPage() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useAuth();
  
  // Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [map, setMap] = useState(null);
  const [center, setCenter] = useState(defaultCenter);
  const [hospitals, setHospitals] = useState([]);
  const [featuredHospitals, setFeaturedHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  
  // Booking Form State
  const [specialist, setSpecialist] = useState(state?.specialist_recommended || 'General Physician');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Generate next 14 days
  const upcomingDates = Array.from({length: 14}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d.toISOString().split('T')[0];
  });

  const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '04:00 PM'];

  const [locationLoading, setLocationLoading] = useState(true);

  // Geolocation & Places Fetching — actively grab current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCenter(userLocation);
          setLocationLoading(false);
          toast.success('Using your current location to find nearby clinics.');
        },
        (error) => {
          console.warn("Geolocation blocked/failed, using default center.", error);
          setLocationLoading(false);
          toast.error('Location access denied. Showing default area. Please enable location permissions for best results.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationLoading(false);
      toast.error('Geolocation is not supported by your browser.');
    }
  }, []);

  const searchHospitals = useCallback((mapInstance, location) => {
    if (!mapInstance || !window.google) return;
    
    // Create Places service
    const service = new window.google.maps.places.PlacesService(mapInstance);
    
    const keyword = searchQuery.trim() || `${specialist} hospital clinic`;
    const request = {
      location: location,
      radius: '5000', // 5km
      keyword: keyword,
      type: ['hospital']
    };

    service.nearbySearch(request, async (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        // Sort by prominent/rating
        const sorted = results.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8);
        
        // Asynchronously fetch deep details specifically for Timings & formatted address
        const detailedHospitals = await Promise.all(sorted.map((place) => {
          return new Promise((resolve) => {
            service.getDetails({
              placeId: place.place_id,
              fields: ['opening_hours', 'formatted_address', 'formatted_phone_number']
            }, (details, detailStatus) => {
              if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK) {
                resolve({ ...place, ...details });
              } else {
                resolve(place);
              }
            });
          });
        }));

        setHospitals(detailedHospitals);
        
        // Auto-select first if none selected
        if (detailedHospitals.length > 0 && !selectedHospital) {
          setSelectedHospital(detailedHospitals[0]);
        }
      }
    });
  }, [specialist, selectedHospital, searchQuery]);

  // Fetch featured hospitals from Google Maps by name
  const fetchFeaturedHospitals = useCallback((mapInstance) => {
    if (!mapInstance || !window.google) return;
    const service = new window.google.maps.places.PlacesService(mapInstance);
    const defaultNames = ['Father Mullers Hospital Mangalore', 'AJ Hospital Mangalore', 'KMC Hospital Mangalore'];

    Promise.all(defaultNames.map((name) => {
      return new Promise((resolve) => {
        service.findPlaceFromQuery({ query: name, fields: ['place_id', 'name', 'geometry', 'rating', 'formatted_address', 'opening_hours', 'business_status'] }, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
            const place = results[0];
            // Deep-fetch details for timings & phone
            service.getDetails({ placeId: place.place_id, fields: ['opening_hours', 'formatted_address', 'formatted_phone_number', 'rating', 'name', 'geometry', 'vicinity', 'photos'] }, (details, detailStatus) => {
              if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK) {
                resolve({ ...place, ...details, vicinity: details.formatted_address || place.formatted_address });
              } else {
                resolve({ ...place, vicinity: place.formatted_address });
              }
            });
          } else {
            resolve(null);
          }
        });
      });
    })).then((results) => {
      setFeaturedHospitals(results.filter(Boolean));
    });
  }, []);

  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
    searchHospitals(mapInstance, center);
    fetchFeaturedHospitals(mapInstance);
  }, [center, searchHospitals, fetchFeaturedHospitals]);

  // Handle re-search if center changes significantly
  useEffect(() => {
    if (map && center) {
      searchHospitals(map, center);
    }
  }, [map, center, searchHospitals]);


  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedHospital || !date || !time) {
      toast.error('Please select a hospital, date, and time.');
      return;
    }
    
    setIsBooking(true);
    
    // Mock booking for demo — simulate a 2-second server delay
    setTimeout(() => {
      const confirmationId = 'MC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      setBookingConfirmed({
        id: confirmationId,
        hospital: selectedHospital.name,
        address: selectedHospital.vicinity || selectedHospital.formatted_address || '',
        specialist: specialist,
        date: date,
        time: time,
        phone: selectedHospital.formatted_phone_number || 'N/A',
      });
      setIsBooking(false);
      toast.success('Appointment booked successfully!');
    }, 2000);
  };

  // ── Booking Confirmed Screen ──────────────────────────────────────────────
  if (bookingConfirmed) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-8 lg:p-12">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-center text-white">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Booking Confirmed!</h1>
            <p className="text-emerald-100 mt-1 text-sm">Your appointment has been scheduled successfully.</p>
          </div>

          {/* Confirmation Details */}
          <div className="p-6 md:p-8 space-y-5">
            {/* Confirmation ID */}
            <div className="text-center">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirmation ID</p>
              <p className="text-2xl font-bold text-slate-900 mt-1 tracking-widest">{bookingConfirmed.id}</p>
            </div>

            <hr className="border-slate-100" />

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Hospital</p>
                <p className="font-bold text-slate-900 text-sm">{bookingConfirmed.hospital}</p>
                <p className="text-xs text-slate-500 mt-0.5 flex items-start gap-1">
                  <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                  {bookingConfirmed.address}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Specialist</p>
                <p className="font-bold text-slate-900 text-sm">{bookingConfirmed.specialist}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-500" />
                  {new Date(bookingConfirmed.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Time Slot</p>
                <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-500" />
                  {bookingConfirmed.time}
                </p>
              </div>
            </div>

            {bookingConfirmed.phone !== 'N/A' && (
              <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-4 text-center">
                <p className="text-xs font-semibold text-cyan-600 uppercase tracking-wider mb-1">Hospital Contact</p>
                <p className="font-bold text-cyan-800 flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" /> {bookingConfirmed.phone}
                </p>
              </div>
            )}

            <hr className="border-slate-100" />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all text-sm"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => setBookingConfirmed(null)}
                className="flex-1 py-3 px-6 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all text-sm"
              >
                Book Another
              </button>
            </div>

            <p className="text-xs text-center text-slate-400">
              A confirmation email has been sent to your registered email address.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) return <div className="text-center p-12 text-rose-500">Error loading Google Maps</div>;
  if (!isLoaded || locationLoading) return (
    <div className="text-center p-12 space-y-3">
      <div className="animate-spin w-8 h-8 mx-auto border-4 border-cyan-500 border-t-transparent rounded-full"></div>
      <p className="text-sm text-slate-500 font-medium">{locationLoading ? 'Detecting your location...' : 'Loading Maps...'}</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-800 transition-colors rounded-full hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Book Specialist Appointment</h1>
          <p className="text-slate-500">Pick a nearby {specialist} and choose your time</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <form onSubmit={(e) => { e.preventDefault(); if (map) { setIsSearching(true); searchHospitals(map, center); setTimeout(() => setIsSearching(false), 1500); } }} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clinics, hospitals, or specialists (e.g. Dentist, Eye Clinic)..."
            className="w-full pl-12 pr-28 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 shadow-sm transition-all text-sm"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column - Maps & Hospitals */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="h-80 md:h-96 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={13}
              center={center}
              onLoad={onMapLoad}
              options={{ disableDefaultUI: true, zoomControl: true }}
            >
              {/* User Location Marker */}
              <Marker position={center} icon={{ url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" }} />
              
              {/* Hospital Markers */}
              {hospitals.map(h => (
                <Marker 
                  key={h.place_id} 
                  position={h.geometry.location} 
                  onClick={() => setSelectedHospital(h)}
                  animation={selectedHospital?.place_id === h.place_id ? window.google.maps.Animation.BOUNCE : null}
                />
              ))}
            </GoogleMap>
          </div>

          {/* Featured Hospitals */}
          {featuredHospitals.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                Featured Hospitals
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredHospitals.map((hospital) => (
                  <div 
                    key={hospital.place_id}
                    onClick={() => setSelectedHospital(hospital)}
                    className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                      selectedHospital?.place_id === hospital.place_id 
                      ? 'border-cyan-500 bg-cyan-50/50 shadow-lg ring-2 ring-cyan-500' 
                      : 'border-slate-200 bg-white hover:border-cyan-300 hover:shadow-md shadow-sm'
                    }`}
                  >
                    {hospital.photos && hospital.photos.length > 0 && (
                      <img
                        src={hospital.photos[0].getUrl({ maxWidth: 400, maxHeight: 200 })}
                        alt={hospital.name}
                        className="w-full h-32 object-cover rounded-xl mb-3"
                      />
                    )}
                    <h4 className="font-bold text-slate-900 text-base">{hospital.name}</h4>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
                      {hospital.vicinity || hospital.formatted_address}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-3 text-xs font-medium">
                      {hospital.rating && (
                        <span className="flex items-center text-amber-500 bg-amber-50 px-2 py-1 rounded-md">
                          <Star className="w-3 h-3 mr-1 fill-current" /> {hospital.rating}
                        </span>
                      )}
                      {hospital.opening_hours?.weekday_text ? (
                        <span className="text-slate-600 bg-slate-100 flex items-center px-2 py-1 rounded-md" title={hospital.opening_hours.weekday_text[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]}>
                          <Clock className="w-3 h-3 mr-1 shrink-0" />
                          <span className="truncate">{hospital.opening_hours.weekday_text[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]?.split(': ')[1] || 'Hours N/A'}</span>
                        </span>
                      ) : hospital.opening_hours?.isOpen?.() ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">Open Now</span>
                      ) : (
                        <span className="text-rose-700 bg-rose-50 px-2 py-1 rounded-md border border-rose-100">Closed</span>
                      )}
                    </div>
                    {hospital.formatted_phone_number && (
                      <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                        <Phone className="w-3 h-3" /> {hospital.formatted_phone_number}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nearby Clinics */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4">Nearby Clinics ({hospitals.length})</h3>
            <div className="flex overflow-x-auto pb-4 gap-4 snap-x no-scrollbar">
              {hospitals.length === 0 ? (
                <p className="text-slate-500 text-sm">Searching for clinics...</p>
              ) : ''}
              {hospitals.map((hospital) => (
                <div 
                  key={hospital.place_id}
                  onClick={() => setSelectedHospital(hospital)}
                  className={`min-w-[280px] snap-center cursor-pointer rounded-2xl border p-4 transition-all ${
                    selectedHospital?.place_id === hospital.place_id 
                    ? 'border-cyan-500 bg-cyan-50/50 shadow-md ring-1 ring-cyan-500 hover:border-cyan-600' 
                    : 'border-slate-200 bg-white hover:border-cyan-300 shadow-sm'
                  }`}
                >
                  <h4 className="font-bold text-slate-900 truncate">{hospital.name}</h4>
                  <p className="text-sm text-slate-500 truncate mt-1">{hospital.vicinity}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs font-medium">
                    {hospital.rating && (
                      <span className="flex items-center text-amber-500 bg-amber-50 px-2 py-1 rounded-md">
                        <Star className="w-3 h-3 mr-1 fill-current" /> {hospital.rating}
                      </span>
                    )}
                    {hospital.opening_hours?.weekday_text ? (
                      <span className="text-slate-600 bg-slate-100 flex items-center px-2 py-1 rounded-md truncate max-w-[150px]" title={hospital.opening_hours.weekday_text[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]}>
                        <Clock className="w-3 h-3 mr-1 shrink-0" />
                        <span className="truncate">{hospital.opening_hours.weekday_text[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]?.split(': ')[1] || 'Hours N/A'}</span>
                      </span>
                    ) : hospital.opening_hours?.isOpen?.() ? (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">Open Now</span>
                    ) : (
                      <span className="text-rose-700 bg-rose-50 px-2 py-1 rounded-md border border-rose-100">Closed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Booking Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleBooking} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
              <h2 className="font-bold text-slate-900 text-lg">Booking Details</h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Selected Hospital Info */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Selected Location</p>
                {selectedHospital ? (
                  <div>
                    <h4 className="font-bold text-cyan-700 text-base">{selectedHospital.name}</h4>
                    <p className="text-sm text-slate-600 mt-1 flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                      {selectedHospital.vicinity}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">Please select a clinic from the map.</p>
                )}
              </div>

              {/* Specialist */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Specialist Required</label>
                <input 
                  type="text" 
                  value={specialist}
                  onChange={(e) => setSpecialist(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 text-slate-900 transition-colors" 
                  required
                />
              </div>
              
              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl pl-10 pr-8 py-3 text-sm text-slate-900 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1em] bg-[right_0.75rem_center] bg-no-repeat transition-colors"
                    >
                      <option value="" disabled>Select Date</option>
                      {upcomingDates.map(d => <option key={d} value={d}>{new Date(d).toLocaleDateString(undefined, {weekday: 'short', month: 'short', day: 'numeric'})}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Time</label>
                  <div className="relative">
                    <Clock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select 
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl pl-10 pr-8 py-3 text-sm text-slate-900 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1em] bg-[right_0.75rem_center] bg-no-repeat transition-colors"
                    >
                      <option value="" disabled>Select Time</option>
                      {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4 mt-4 border-t border-slate-100">
                <button 
                  type="submit" 
                  disabled={isBooking || !selectedHospital}
                  className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-cyan-500/25 flex justify-center items-center gap-2"
                >
                  {isBooking ? <Activity className="w-5 h-5 animate-spin" /> : 'Confirm & Request OTP'}
                </button>
                <p className="text-xs text-center text-slate-400 mt-3">An OTP will be sent to your registered phone number to confirm the booking.</p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
