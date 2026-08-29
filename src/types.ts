export type BayType = 'parallel' | 'diagonal' | 'perpendicular';
export type SpotStatus = 'available' | 'locked' | 'occupied' | 'reserved' | 'maintenance';
export type VehicleType = 'car' | 'suv' | 'two_wheeler' | 'ev_car' | 'ev_scooter' | 'auto';
export type LightingQuality = 'high' | 'medium' | 'low';
export type CrimeRiskRating = 'very_low' | 'low' | 'moderate' | 'high';
export type ChennaiZone = 
  | 'T. Nagar (Pondy Bazaar / Usman Rd)'
  | 'Anna Nagar (2nd Ave / Shanthi Colony)'
  | 'Nungambakkam (Khader Nawaz Khan Rd)'
  | 'Mylapore (Luz / Kapaleeshwarar)'
  | 'Besant Nagar & Adyar (Elliot\'s Beach)'
  | 'Velachery (100 Ft Bypass Rd)'
  | 'OMR IT Corridor (Perungudi / Thoraipakkam)'
  | 'Marina Beach (Kamarajar Salai)'
  | 'Alwarpet & RA Puram (TTK Rd)';

export interface ParkingSpot {
  id: string;
  code: string;
  name: string;
  streetAddress: string;
  zone: ChennaiZone;
  landmark: string;
  bayType: BayType;
  lat: number;
  lng: number;
  hourlyRateINR: number; // in Indian Rupee ₹ (e.g., ₹20, ₹40, ₹60)
  status: SpotStatus;
  maxStayHours: number;
  isEVCharging: boolean;
  evChargerPowerKw?: number;
  isHandicap: boolean;
  vehicleTypes: VehicleType[];
  safetyScore: number; // 0 - 100
  lightingQuality: LightingQuality;
  ambientLux: number; // e.g. 180 lux (street lights)
  cctvMonitored: boolean;
  patrolFrequency: string; // e.g., "GCC & Chennai Police Patrol every 20 mins"
  crimeRiskRating: CrimeRiskRating;
  distanceMeters: number;
  walkTimeMinutes: number;
  sensorBatteryPct: number;
  lastOccupiedChange: string;
  currentPlate?: string;
  currentLockExpiresAt?: number; // epoch ms
  currentLockUserId?: string;
  userRating: number;
  reviewCount: number;
  features: string[];
  smartMeterNumber: string;
}

export interface RedisLock {
  key: string;
  spotId: string;
  userId: string;
  userName: string;
  acquiredAt: number;
  expiresAt: number;
  ttlSeconds: number;
  lockState: 'active' | 'released' | 'expired' | 'promoted';
}

export interface Reservation {
  id: string;
  spotId: string;
  spotCode: string;
  spotName: string;
  streetAddress: string;
  zone: ChennaiZone;
  userId: string;
  userName: string;
  userPhone: string;
  vehiclePlate: string; // e.g. TN-09-CB-4821
  vehicleType: VehicleType;
  startTime: string;
  endTime: string;
  durationHours: number;
  baseFeeINR: number;
  convenienceFeeINR: number;
  discountINR: number;
  totalFeeINR: number;
  status: 'locked' | 'active' | 'completed' | 'cancelled' | 'expired';
  qrCodeData: string;
  pinCode: string;
  createdAt: string;
  paymentMethod: 'UPI' | 'FASTag' | 'Card' | 'NetBanking' | 'Cash on Bay';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  guardianActive: boolean;
  actualCheckIn?: string;
  actualCheckOut?: string;
}

export interface ParkMateAIRecommendation {
  spotId: string;
  spot: ParkingSpot;
  matchScore: number; // 0 - 100
  reasons: string[];
  safetyHighlights: string[];
  estimatedCostINR: number;
  walkingRecommendation: string;
  availabilityConfidence: number; // %
  co2SavedGrams: number;
  timeSavedMinutes: number;
  bestSuitedFor: string;
  chennaiLocalTips: string;
}

export interface AvailabilityForecast {
  spotId: string;
  spotName: string;
  zone: ChennaiZone;
  currentOccupancyProbability: number;
  predictions: {
    timeOffset: string; // "+30m", "+1h", "+2h", "+4h", "+8h"
    displayTime: string;
    probabilityAvailable: number; // 0 - 100%
    crowdLevel: 'low' | 'moderate' | 'high' | 'critical';
    rushHourRisk: string;
  }[];
  peakHours: string[];
  bestTimeToArrive: string;
  aiAnalysis: string;
}

export interface SafetyGuardianSession {
  id: string;
  reservationId: string;
  spotId: string;
  spotName: string;
  streetAddress: string;
  userLat: number;
  userLng: number;
  status: 'monitoring' | 'safe_walk' | 'alert' | 'ended';
  startedAt: string;
  lightingScore: number;
  cctvLiveStatus: 'online' | 'motion_detected' | 'standby';
  perimeterSensors: {
    motionDetected: boolean;
    proximityWarning: boolean;
    vibrationTamper: boolean;
    ambientLux: number;
  };
  liveHazards: string[];
  emergencyContactName: string;
  emergencyContactPhone: string;
  alertsHistory: {
    id: string;
    type: 'light_dip' | 'unusual_motion' | 'time_expiring' | 'high_crime_hour' | 'zone_incident';
    message: string;
    timestamp: string;
    severity: 'info' | 'warning' | 'critical';
  }[];
}

export interface CommunityReport {
  id: string;
  spotId?: string;
  spotName?: string;
  streetAddress: string;
  zone: ChennaiZone;
  reportType: 'waterlogging' | 'gcc_sweeping' | 'meter_broken' | 'free_spot_opened' | 'auto_blockage' | 'street_light_down' | 'road_repair';
  description: string;
  upvotes: number;
  downvotes: number;
  reportedBy: string;
  createdAt: string;
  status: 'active' | 'resolved' | 'investigating';
  severity: 'low' | 'medium' | 'high';
  userAction?: 'upvoted' | 'downvoted';
}

export interface EcoImpactMetrics {
  totalTrips: number;
  totalMinutesSaved: number;
  totalFuelSavedLitres: number;
  totalCo2ReducedKg: number;
  totalRupeesSavedINR: number;
  treeEquivalent: number;
}

export interface AdminMetrics {
  totalSpots: number;
  occupiedSpots: number;
  availableSpots: number;
  reservedSpots: number;
  lockedSpots: number;
  occupancyRate: number;
  todayRevenueINR: number;
  activeGuardianSessions: number;
  pendingReportsCount: number;
  zoneOccupancies: { zone: string; rate: number; count: number; available: number }[];
  redisLockContentionCount: number;
  sensorHealthPct: number;
  simSpeedMultiplier: number;
}

export interface PostgresTableMeta {
  tableName: string;
  description: string;
  rowCount: number;
  columns: { name: string; type: string; isPrimary?: boolean; isForeign?: boolean }[];
  sampleRows: any[];
}
