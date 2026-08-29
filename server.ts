import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import type {
  ParkingSpot,
  RedisLock,
  Reservation,
  ParkMateAIRecommendation,
  AvailabilityForecast,
  SafetyGuardianSession,
  CommunityReport,
  EcoImpactMetrics,
  AdminMetrics,
  PostgresTableMeta,
  ChennaiZone
} from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// ==========================================
// IN-MEMORY POSTGRESQL & REDIS ENGINE
// ==========================================

// Seed Chennai Roadside Parking Bays
let parkingSpots: ParkingSpot[] = [
  {
    id: 'spot-tnagar-01',
    code: 'TN-PB-101',
    name: 'Pondy Bazaar Pedestrian Plaza Bay A',
    streetAddress: 'Sir Thyagaraya Road, T. Nagar, Chennai - 600017',
    zone: 'T. Nagar (Pondy Bazaar / Usman Rd)',
    landmark: 'Opposite Naidu Hall & Big Bazaar junction',
    bayType: 'parallel',
    lat: 13.0416,
    lng: 80.2337,
    hourlyRateINR: 40,
    status: 'available',
    maxStayHours: 4,
    isEVCharging: true,
    evChargerPowerKw: 22,
    isHandicap: false,
    vehicleTypes: ['car', 'suv', 'ev_car', 'two_wheeler'],
    safetyScore: 92,
    lightingQuality: 'high',
    ambientLux: 240,
    cctvMonitored: true,
    patrolFrequency: 'GCC & Law & Order Police every 15 mins',
    crimeRiskRating: 'very_low',
    distanceMeters: 80,
    walkTimeMinutes: 1,
    sensorBatteryPct: 94,
    lastOccupiedChange: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    userRating: 4.8,
    reviewCount: 142,
    features :[],
    smartMeterNumber: 'GCC-SM-TN-401'
  },
  {
    id: 'spot-tnagar-02',
    code: 'TN-US-104',
    name: 'Usman Road Flyover Roadside Bay B',
    streetAddress: 'South Usman Road, Near Saravana Stores, T. Nagar, Chennai',
    zone: 'T. Nagar (Pondy Bazaar / Usman Rd)',
    landmark: 'Below Usman Road Flyover pillar 12',
    bayType: 'diagonal',
    lat: 13.0378,
    lng: 80.2304,
    hourlyRateINR: 30,
    status: 'occupied',
    maxStayHours: 3,
    isEVCharging: false,
    isHandicap: true,
    vehicleTypes: ['car', 'suv', 'two_wheeler', 'auto'],
    safetyScore: 84,
    lightingQuality: 'medium',
    ambientLux: 160,
    cctvMonitored: true,
    patrolFrequency: 'Traffic Police regular patrol',
    crimeRiskRating: 'low',
    distanceMeters: 250,
    walkTimeMinutes: 3,
    sensorBatteryPct: 88,
    lastOccupiedChange: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    currentPlate: 'TN-09-AX-7721',
    userRating: 4.3,
    reviewCount: 98,
    features: ['Handicap Ramp', 'Shaded Bay', 'FASTag Bay Enabled'],
    smartMeterNumber: 'GCC-SM-TN-402'
  },
  {
    id: 'spot-annanagar-01',
    code: 'AN-2AV-201',
    name: 'Anna Nagar 2nd Avenue Commercial Bay 1',
    streetAddress: '2nd Avenue, Near Roundtana, Anna Nagar, Chennai - 600040',
    zone: 'Anna Nagar (2nd Ave / Shanthi Colony)',
    landmark: 'Adjacent to K4 Police Station & Metro Station Gate 2',
    bayType: 'perpendicular',
    lat: 13.0850,
    lng: 80.2101,
    hourlyRateINR: 50,
    status: 'available',
    maxStayHours: 5,
    isEVCharging: true,
    evChargerPowerKw: 50,
    isHandicap: false,
    vehicleTypes: ['car', 'suv', 'ev_car', 'ev_scooter', 'two_wheeler'],
    safetyScore: 96,
    lightingQuality: 'high',
    ambientLux: 280,
    cctvMonitored: true,
    patrolFrequency: 'Police Station perimeter patrol 24x7',
    crimeRiskRating: 'very_low',
    distanceMeters: 120,
    walkTimeMinutes: 2,
    sensorBatteryPct: 99,
    lastOccupiedChange: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    userRating: 4.9,
    reviewCount: 215,
    features: ['50kW DC Fast Charger', 'Metro Intermodal Connectivity', '24x7 High-res Dome CCTV', 'Towing Warning Alarm'],
    smartMeterNumber: 'GCC-SM-AN-501'
  },
  {
    id: 'spot-annanagar-02',
    code: 'AN-SC-208',
    name: 'Shanthi Colony Food Street Curb Bay',
    streetAddress: '4th Avenue, Shanthi Colony, Anna Nagar, Chennai - 600040',
    zone: 'Anna Nagar (2nd Ave / Shanthi Colony)',
    landmark: 'Next to Starbucks & Hot Breads Shanthi Colony',
    bayType: 'parallel',
    lat: 13.0822,
    lng: 80.2185,
    hourlyRateINR: 40,
    status: 'available',
    maxStayHours: 3,
    isEVCharging: false,
    isHandicap: false,
    vehicleTypes: ['car', 'suv', 'two_wheeler', 'ev_scooter'],
    safetyScore: 89,
    lightingQuality: 'high',
    ambientLux: 220,
    cctvMonitored: true,
    patrolFrequency: 'Active night foot patrol',
    crimeRiskRating: 'low',
    distanceMeters: 180,
    walkTimeMinutes: 2,
    sensorBatteryPct: 91,
    lastOccupiedChange: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    userRating: 4.6,
    reviewCount: 167,
    features: ['Food Street Valet Sync', 'Tree Shaded', 'Automated LED Vacancy Display'],
    smartMeterNumber: 'GCC-SM-AN-502'
  },
  {
    id: 'spot-nungambakkam-01',
    code: 'NB-KNK-301',
    name: 'Khader Nawaz Khan High Street Bay 1',
    streetAddress: 'Khader Nawaz Khan Road, Nungambakkam, Chennai - 600006',
    zone: 'Nungambakkam (Khader Nawaz Khan Rd)',
    landmark: 'Near Starbucks & Taj Coromandel corner',
    bayType: 'parallel',
    lat: 13.0612,
    lng: 80.2458,
    hourlyRateINR: 60,
    status: 'available',
    maxStayHours: 4,
    isEVCharging: true,
    evChargerPowerKw: 22,
    isHandicap: false,
    vehicleTypes: ['car', 'suv', 'ev_car', 'two_wheeler'],
    safetyScore: 95,
    lightingQuality: 'high',
    ambientLux: 260,
    cctvMonitored: true,
    patrolFrequency: 'Private high-street security & Police marshals',
    crimeRiskRating: 'very_low',
    distanceMeters: 60,
    walkTimeMinutes: 1,
    sensorBatteryPct: 96,
    lastOccupiedChange: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    userRating: 4.8,
    reviewCount: 189,
    features: ['Premium Boutique Strip', '22kW Type-2 EV Gun', 'Smart Pavement LED Border', 'VIP Valet Buffer'],
    smartMeterNumber: 'GCC-SM-NB-601'
  },
  {
    id: 'spot-nungambakkam-02',
    code: 'NB-STR-305',
    name: 'Sterling Road Avenue Roadside Spot',
    streetAddress: 'Sterling Road, Opp Loyola College Gate 2, Nungambakkam, Chennai',
    zone: 'Nungambakkam (Khader Nawaz Khan Rd)',
    landmark: 'Opposite Loyola College Main Gate',
    bayType: 'diagonal',
    lat: 13.0655,
    lng: 80.2374,
    hourlyRateINR: 35,
    status: 'occupied',
    maxStayHours: 4,
    isEVCharging: false,
    isHandicap: false,
    vehicleTypes: ['car', 'two_wheeler', 'ev_scooter', 'auto'],
    safetyScore: 86,
    lightingQuality: 'medium',
    ambientLux: 175,
    cctvMonitored: true,
    patrolFrequency: 'College zone police beat',
    crimeRiskRating: 'low',
    distanceMeters: 310,
    walkTimeMinutes: 4,
    sensorBatteryPct: 87,
    lastOccupiedChange: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    currentPlate: 'TN-01-BK-9102',
    userRating: 4.2,
    reviewCount: 76,
    features: ['Wide Turning Bay', 'Student Discount Eligible', 'Covered Tree Canopy'],
    smartMeterNumber: 'GCC-SM-NB-602'
  },
  {
    id: 'spot-mylapore-01',
    code: 'MY-LUZ-401',
    name: 'Luz Corner Heritage Bay A',
    streetAddress: 'Luz Church Road, Mylapore, Chennai - 600004',
    zone: 'Mylapore (Luz / Kapaleeshwarar)',
    landmark: 'Near Luz Corner & Nageswara Rao Park',
    bayType: 'diagonal',
    lat: 13.0368,
    lng: 80.2676,
    hourlyRateINR: 30,
    status: 'available',
    maxStayHours: 3,
    isEVCharging: false,
    isHandicap: true,
    vehicleTypes: ['car', 'two_wheeler', 'auto', 'suv'],
    safetyScore: 90,
    lightingQuality: 'high',
    ambientLux: 210,
    cctvMonitored: true,
    patrolFrequency: 'Mylapore E1 Station regular patrol',
    crimeRiskRating: 'very_low',
    distanceMeters: 140,
    walkTimeMinutes: 2,
    sensorBatteryPct: 92,
    lastOccupiedChange: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    userRating: 4.7,
    reviewCount: 134,
    features: ['Handicap Priority Access', 'CCTV Integrated', 'Nageswara Park Walking Corridor'],
    smartMeterNumber: 'GCC-SM-MY-701'
  },
  {
    id: 'spot-mylapore-02',
    code: 'MY-KAP-407',
    name: 'Kapaleeshwarar Sannidhi Street Bay',
    streetAddress: 'North Mada Street, Near Temple Tank, Mylapore, Chennai - 600004',
    zone: 'Mylapore (Luz / Kapaleeshwarar)',
    landmark: 'North Mada Street near Temple Gopuram & Giri Trading',
    bayType: 'parallel',
    lat: 13.0335,
    lng: 80.2698,
    hourlyRateINR: 35,
    status: 'available',
    maxStayHours: 2,
    isEVCharging: false,
    isHandicap: false,
    vehicleTypes: ['two_wheeler', 'car', 'ev_scooter'],
    safetyScore: 88,
    lightingQuality: 'high',
    ambientLux: 230,
    cctvMonitored: true,
    patrolFrequency: 'Temple precinct police guard',
    crimeRiskRating: 'very_low',
    distanceMeters: 95,
    walkTimeMinutes: 1,
    sensorBatteryPct: 90,
    lastOccupiedChange: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    userRating: 4.5,
    reviewCount: 112,
    features: ['Pilgrim & Devotee Fast Bay', 'Heritage Pavement Markers', 'Strict No-Towing Zone Sensor'],
    smartMeterNumber: 'GCC-SM-MY-702'
  },
  {
    id: 'spot-besantnagar-01',
    code: 'BN-ELT-501',
    name: "Elliot's Beach 6th Avenue Promenade Bay",
    streetAddress: "6th Avenue, Elliot's Beach, Besant Nagar, Chennai - 600090",
    zone: "Besant Nagar & Adyar (Elliot's Beach)",
    landmark: 'Opposite Karl Schmidt Memorial & Cozee Cafe',
    bayType: 'perpendicular',
    lat: 13.0001,
    lng: 80.2668,
    hourlyRateINR: 40,
    status: 'available',
    maxStayHours: 6,
    isEVCharging: true,
    evChargerPowerKw: 22,
    isHandicap: false,
    vehicleTypes: ['car', 'suv', 'ev_car', 'two_wheeler', 'ev_scooter'],
    safetyScore: 94,
    lightingQuality: 'high',
    ambientLux: 250,
    cctvMonitored: true,
    patrolFrequency: 'Coastal Security & J5 Shastri Nagar Police beat',
    crimeRiskRating: 'very_low',
    distanceMeters: 40,
    walkTimeMinutes: 1,
    sensorBatteryPct: 98,
    lastOccupiedChange: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    userRating: 4.9,
    reviewCount: 240,
    features: ['Direct Beach Access', 'Night Illumination Tower', 'EV Eco-charger', 'Beach Walker Companion Hub'],
    smartMeterNumber: 'GCC-SM-BN-801'
  },
  {
    id: 'spot-besantnagar-02',
    code: 'AD-KAS-506',
    name: 'Kasturibai Nagar 1st Main Curb Bay',
    streetAddress: '1st Main Road, Kasturibai Nagar, Adyar, Chennai - 600020',
    zone: "Besant Nagar & Adyar (Elliot's Beach)",
    landmark: 'Near Adyar Ananda Bhavan & MRTS Station',
    bayType: 'parallel',
    lat: 13.0067,
    lng: 80.2522,
    hourlyRateINR: 30,
    status: 'occupied',
    maxStayHours: 4,
    isEVCharging: false,
    isHandicap: false,
    vehicleTypes: ['car', 'suv', 'two_wheeler'],
    safetyScore: 88,
    lightingQuality: 'high',
    ambientLux: 205,
    cctvMonitored: true,
    patrolFrequency: 'Adyar police motorcycle beat',
    crimeRiskRating: 'low',
    distanceMeters: 210,
    walkTimeMinutes: 3,
    sensorBatteryPct: 89,
    lastOccupiedChange: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    currentPlate: 'TN-07-CS-4512',
    userRating: 4.4,
    reviewCount: 88,
    features: ['MRTS Commuter Spot', 'Shaded Bay', 'Quick UPI Meter'],
    smartMeterNumber: 'GCC-SM-AD-802'
  },
  {
    id: 'spot-velachery-01',
    code: 'VL-100FT-601',
    name: '100 Feet Bypass Road Mall Connector Bay',
    streetAddress: '100 Feet Bypass Road, Velachery, Chennai - 600042',
    zone: 'Velachery (100 Ft Bypass Rd)',
    landmark: '300m before Phoenix Marketcity & Grand Square',
    bayType: 'diagonal',
    lat: 12.9815,
    lng: 80.2180,
    hourlyRateINR: 40,
    status: 'available',
    maxStayHours: 5,
    isEVCharging: true,
    evChargerPowerKw: 60,
    isHandicap: true,
    vehicleTypes: ['car', 'suv', 'ev_car', 'two_wheeler'],
    safetyScore: 91,
    lightingQuality: 'high',
    ambientLux: 270,
    cctvMonitored: true,
    patrolFrequency: 'GCC traffic marshals regular',
    crimeRiskRating: 'very_low',
    distanceMeters: 150,
    walkTimeMinutes: 2,
    sensorBatteryPct: 95,
    lastOccupiedChange: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    userRating: 4.7,
    reviewCount: 156,
    features: ['60kW High-Speed CCS2 Gun', 'Mall Shoppers Express Line', 'Flood Sensor Integrated', 'Covered Kerb Guard'],
    smartMeterNumber: 'GCC-SM-VL-901'
  },
  {
    id: 'spot-omr-01',
    code: 'OMR-TH-701',
    name: 'OMR IT Corridor Tech Park Curb Bay',
    streetAddress: 'Rajiv Gandhi Salai, Thoraipakkam, Chennai - 600097',
    zone: 'OMR IT Corridor (Perungudi / Thoraipakkam)',
    landmark: 'Opposite ASV Suntech Park & BSR Mall',
    bayType: 'parallel',
    lat: 12.9388,
    lng: 80.2312,
    hourlyRateINR: 50,
    status: 'available',
    maxStayHours: 8,
    isEVCharging: true,
    evChargerPowerKw: 50,
    isHandicap: false,
    vehicleTypes: ['car', 'suv', 'ev_car', 'two_wheeler', 'ev_scooter'],
    safetyScore: 93,
    lightingQuality: 'high',
    ambientLux: 260,
    cctvMonitored: true,
    patrolFrequency: 'OMR highway police & Tech corridor guards',
    crimeRiskRating: 'very_low',
    distanceMeters: 90,
    walkTimeMinutes: 1,
    sensorBatteryPct: 97,
    lastOccupiedChange: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    userRating: 4.8,
    reviewCount: 178,
    features: ['Full Day Tech Work Pass', '50kW DC Fast EV Gun', 'Optical Road Sensor', 'Automatic FASTag Auto-Debit'],
    smartMeterNumber: 'GCC-SM-OMR-101'
  },
  {
    id: 'spot-marina-01',
    code: 'MB-KAM-801',
    name: 'Marina Beach Promenade Service Bay',
    streetAddress: 'Kamarajar Salai, Near Light House, Triplicane, Chennai - 600005',
    zone: 'Marina Beach (Kamarajar Salai)',
    landmark: 'Opposite Chennai Lighthouse & Gandhi Statue',
    bayType: 'perpendicular',
    lat: 13.0390,
    lng: 80.2795,
    hourlyRateINR: 25,
    status: 'available',
    maxStayHours: 4,
    isEVCharging: false,
    isHandicap: true,
    vehicleTypes: ['car', 'suv', 'two_wheeler', 'auto'],
    safetyScore: 90,
    lightingQuality: 'high',
    ambientLux: 240,
    cctvMonitored: true,
    patrolFrequency: 'Marina Coastal Division round-the-clock',
    crimeRiskRating: 'low',
    distanceMeters: 50,
    walkTimeMinutes: 1,
    sensorBatteryPct: 93,
    lastOccupiedChange: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    userRating: 4.6,
    reviewCount: 220,
    features: ['Lighthouse Sea-Breeze View', 'Tourist Guide Terminal', 'Wide Beach Pedestrian Access', 'Chennai Police Booth in 30m'],
    smartMeterNumber: 'GCC-SM-MB-201'
  },
  {
    id: 'spot-alwarpet-01',
    code: 'AL-TTK-901',
    name: 'TTK Road Gourmet Strip Roadside Bay',
    streetAddress: 'TTK Road, Near Music Academy Junction, Alwarpet, Chennai - 600018',
    zone: 'Alwarpet & RA Puram (TTK Rd)',
    landmark: 'Near Music Academy & The Park Hotel turn',
    bayType: 'parallel',
    lat: 13.0450,
    lng: 80.2520,
    hourlyRateINR: 50,
    status: 'available',
    maxStayHours: 4,
    isEVCharging: true,
    evChargerPowerKw: 22,
    isHandicap: false,
    vehicleTypes: ['car', 'suv', 'ev_car', 'two_wheeler'],
    safetyScore: 95,
    lightingQuality: 'high',
    ambientLux: 275,
    cctvMonitored: true,
    patrolFrequency: 'Alwarpet Law & Order patrol beat',
    crimeRiskRating: 'very_low',
    distanceMeters: 75,
    walkTimeMinutes: 1,
    sensorBatteryPct: 96,
    lastOccupiedChange: new Date(Date.now() - 19 * 60 * 1000).toISOString(),
    userRating: 4.8,
    reviewCount: 145,
    features: ['Music Season Special Access', '22kW EV Charging', 'Smart LED Surface Sensors', 'CCTV High Angle Guard'],
    smartMeterNumber: 'GCC-SM-AL-301'
  }
];

// In-memory Redis Store
const redisLocks = new Map<string, RedisLock>(); // key: spot_lock:<spotId> -> RedisLock
let redisContentionCount = 0;

// In-memory PostgreSQL Reservations & Tables
let reservations: Reservation[] = [
  {
    id: 'res-chennai-701',
    spotId: 'spot-tnagar-02',
    spotCode: 'TN-US-104',
    spotName: 'Usman Road Flyover Roadside Bay B',
    streetAddress: 'South Usman Road, Near Saravana Stores, T. Nagar, Chennai',
    zone: 'T. Nagar (Pondy Bazaar / Usman Rd)',
    userId: 'usr-suresh-41',
    userName: 'Suresh Kumar',
    userPhone: '+91 98401 23891',
    vehiclePlate: 'TN-09-AX-7721',
    vehicleType: 'car',
    startTime: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 80 * 60 * 1000).toISOString(),
    durationHours: 2,
    baseFeeINR: 60,
    convenienceFeeINR: 5,
    discountINR: 0,
    totalFeeINR: 65,
    status: 'active',
    qrCodeData: 'SMARTPARK-TN-US-104-RES701',
    pinCode: '4821',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    paymentMethod: 'UPI',
    paymentStatus: 'paid',
    guardianActive: true,
    actualCheckIn: new Date(Date.now() - 40 * 60 * 1000).toISOString()
  },
  {
    id: 'res-chennai-702',
    spotId: 'spot-besantnagar-02',
    spotCode: 'AD-KAS-506',
    spotName: 'Kasturibai Nagar 1st Main Curb Bay',
    streetAddress: '1st Main Road, Kasturibai Nagar, Adyar, Chennai - 600020',
    zone: "Besant Nagar & Adyar (Elliot's Beach)",
    userId: 'usr-divya-92',
    userName: 'Divya Narayanan',
    userPhone: '+91 94440 88219',
    vehiclePlate: 'TN-07-CS-4512',
    vehicleType: 'suv',
    startTime: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 102 * 60 * 1000).toISOString(),
    durationHours: 2,
    baseFeeINR: 60,
    convenienceFeeINR: 5,
    discountINR: 10,
    totalFeeINR: 55,
    status: 'active',
    qrCodeData: 'SMARTPARK-AD-KAS-506-RES702',
    pinCode: '9104',
    createdAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    paymentMethod: 'FASTag',
    paymentStatus: 'paid',
    guardianActive: false,
    actualCheckIn: new Date(Date.now() - 18 * 60 * 1000).toISOString()
  }
];

let guardianSessions: SafetyGuardianSession[] = [
  {
    id: 'guard-ses-101',
    reservationId: 'res-chennai-701',
    spotId: 'spot-tnagar-02',
    spotName: 'Usman Road Flyover Roadside Bay B',
    streetAddress: 'South Usman Road, T. Nagar, Chennai',
    userLat: 13.0378,
    userLng: 80.2304,
    status: 'monitoring',
    startedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    lightingScore: 84,
    cctvLiveStatus: 'online',
    perimeterSensors: {
      motionDetected: false,
      proximityWarning: false,
      vibrationTamper: false,
      ambientLux: 160
    },
    liveHazards: ['Busy pedestrian flow on pavement curb'],
    emergencyContactName: 'Chennai Police Control Room (100 / 112)',
    emergencyContactPhone: '112',
    alertsHistory: [
      {
        id: 'alt-1',
        type: 'zone_incident',
        message: 'Normal roadside traffic patrolling active in T. Nagar Sector 4',
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        severity: 'info'
      }
    ]
  }
];

let communityReports: CommunityReport[] = [
  {
    id: 'rep-ch-01',
    spotId: 'spot-tnagar-01',
    spotName: 'Pondy Bazaar Pedestrian Plaza Bay A',
    streetAddress: 'Sir Thyagaraya Road, T. Nagar, Chennai',
    zone: 'T. Nagar (Pondy Bazaar / Usman Rd)',
    reportType: 'gcc_sweeping',
    description: 'GCC mechanical sweeper cleared the pedestrian curb bay at 8:00 AM. Bay is spotlessly clean.',
    upvotes: 24,
    downvotes: 1,
    reportedBy: 'Karthik R (Chennai Commuter)',
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    status: 'resolved',
    severity: 'low'
  },
  {
    id: 'rep-ch-02',
    spotId: 'spot-besantnagar-01',
    spotName: "Elliot's Beach 6th Avenue Promenade Bay",
    streetAddress: "6th Avenue, Elliot's Beach, Besant Nagar, Chennai",
    zone: "Besant Nagar & Adyar (Elliot's Beach)",
    reportType: 'free_spot_opened',
    description: 'Two cars just pulled out near Cozee cafe. Fresh roadside bays available right now with high illumination.',
    upvotes: 38,
    downvotes: 0,
    reportedBy: 'Preethi S (Besant Resident)',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    status: 'active',
    severity: 'low'
  },
  {
    id: 'rep-ch-03',
    spotId: 'spot-mylapore-02',
    spotName: 'Kapaleeshwarar Sannidhi Street Bay',
    streetAddress: 'North Mada Street, Mylapore, Chennai',
    zone: 'Mylapore (Luz / Kapaleeshwarar)',
    reportType: 'auto_blockage',
    description: 'Temporary auto rickshaw stand near temple corner taking 1 slot. Police marshal currently directing traffic.',
    upvotes: 14,
    downvotes: 2,
    reportedBy: 'Venkatesh (Local Guide)',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    status: 'investigating',
    severity: 'medium'
  }
];

let ecoMetrics: EcoImpactMetrics = {
  totalTrips: 1840,
  totalMinutesSaved: 23920, // ~13 mins per driver
  totalFuelSavedLitres: 4600, // fuel saved not circling
  totalCo2ReducedKg: 10580,
  totalRupeesSavedINR: 483000, // fuel + wear in INR ₹
  treeEquivalent: 480
};

// Periodic Background Job: Expire Redis Locks (120s TTL check)
setInterval(() => {
  const now = Date.now();
  for (const [key, lock] of redisLocks.entries()) {
    if (now > lock.expiresAt && lock.lockState === 'active') {
      lock.lockState = 'expired';
      redisLocks.delete(key);
      // Reset spot to available if it was locked
      const spot = parkingSpots.find(s => s.id === lock.spotId);
      if (spot && spot.status === 'locked') {
        spot.status = 'available';
        spot.currentLockExpiresAt = undefined;
        spot.currentLockUserId = undefined;
      }
    }
  }
}, 1000);

// ==========================================
// GEMINI AI INTEGRATION (PARKMATE AI)
// ==========================================
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({ apiKey });
  } catch (e) {
    console.error('Failed to init GoogleGenAI client:', e);
    return null;
  }
}

// Fallback Rule-Based ParkMate NLP Parser
function parseLocalParkMateQuery(query: string) {
  const q = query.toLowerCase();
  
  let targetZone: ChennaiZone | null = null;
  if (q.includes('tnagar') || q.includes('t. nagar') || q.includes('t nagar') || q.includes('pondy') || q.includes('usman') || q.includes('ranganathan')) {
    targetZone = 'T. Nagar (Pondy Bazaar / Usman Rd)';
  } else if (q.includes('anna nagar') || q.includes('annanagar') || q.includes('shanthi') || q.includes('roundtana')) {
    targetZone = 'Anna Nagar (2nd Ave / Shanthi Colony)';
  } else if (q.includes('knk') || q.includes('khader') || q.includes('nungambakkam') || q.includes('taj coromandel')) {
    targetZone = 'Nungambakkam (Khader Nawaz Khan Rd)';
  } else if (q.includes('mylapore') || q.includes('kapaleeshwarar') || q.includes('luz') || q.includes('mada street')) {
    targetZone = 'Mylapore (Luz / Kapaleeshwarar)';
  } else if (q.includes('besant') || q.includes('elliot') || q.includes('beach') || q.includes('adyar') || q.includes('kasturibai')) {
    targetZone = "Besant Nagar & Adyar (Elliot's Beach)";
  } else if (q.includes('velachery') || q.includes('phoenix') || q.includes('100 ft') || q.includes('bypass')) {
    targetZone = 'Velachery (100 Ft Bypass Rd)';
  } else if (q.includes('omr') || q.includes('thoraipakkam') || q.includes('perungudi') || q.includes('it corridor')) {
    targetZone = 'OMR IT Corridor (Perungudi / Thoraipakkam)';
  } else if (q.includes('marina') || q.includes('lighthouse') || q.includes('triplicane') || q.includes('kamarajar')) {
    targetZone = 'Marina Beach (Kamarajar Salai)';
  } else if (q.includes('alwarpet') || q.includes('ttk') || q.includes('music academy') || q.includes('ra puram')) {
    targetZone = 'Alwarpet & RA Puram (TTK Rd)';
  }

  const wantsEV = q.includes('ev') || q.includes('electric') || q.includes('charge') || q.includes('charging') || q.includes('charger');
  const wantsHandicap = q.includes('handicap') || q.includes('wheelchair') || q.includes('accessible') || q.includes('disabled');
  const prioritizeSafety = q.includes('safe') || q.includes('security') || q.includes('night') || q.includes('family') || q.includes('women') || q.includes('cctv') || q.includes('light');
  const cheapBudget = q.includes('cheap') || q.includes('low cost') || q.includes('budget') || q.includes('under 30') || q.includes('under 40') || q.includes('free');
  
  let hours = 2;
  const matchHours = q.match(/(\d+)\s*(hr|hour|hrs|hours)/);
  if (matchHours) {
    hours = parseInt(matchHours[1], 10);
  }

  return { targetZone, wantsEV, wantsHandicap, prioritizeSafety, cheapBudget, hours };
}

// ==========================================
// REST API ROUTES
// ==========================================

// 1. ParkMate AI Natural Language Recommendation Endpoint
app.post('/api/parkmate/query', async (req, res) => {
  try {
    const { query, userLat, userLng, userVehicleType = 'car' } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query string is required' });
    }

    const ai = getGeminiClient();
    const availableSpots = parkingSpots.filter(s => s.status === 'available' || s.status === 'locked');
    const localParsed = parseLocalParkMateQuery(query);

    let rankedSpots: ParkMateAIRecommendation[] = [];

    if (ai) {
      try {
        const prompt = `You are ParkMate AI, an intelligent roadside parking assistant for Greater Chennai Corporation (GCC) smart roadside parking network.
User's natural language request: "${query}"
User Vehicle Type: ${userVehicleType}
Available Chennai Roadside Bays:
${JSON.stringify(availableSpots.map(s => ({
  id: s.id,
  code: s.code,
  name: s.name,
  streetAddress: s.streetAddress,
  zone: s.zone,
  landmark: s.landmark,
  hourlyRateINR: s.hourlyRateINR,
  status: s.status,
  isEVCharging: s.isEVCharging,
  evPower: s.evChargerPowerKw,
  isHandicap: s.isHandicap,
  safetyScore: s.safetyScore,
  lightingQuality: s.lightingQuality,
  cctvMonitored: s.cctvMonitored,
  patrolFrequency: s.patrolFrequency,
  features: s.features,
  distanceMeters: s.distanceMeters,
  walkTimeMinutes: s.walkTimeMinutes
})))}

Analyze the user's intent (Chennai locality, duration, budget in Indian Rupees ₹, EV fast charging needs, safety/lighting concerns, parking bay type).
Rank and return the top 3 best matching spots in JSON format.
Output format: A pure JSON array of objects with keys:
- spotId (string matching provided id)
- matchScore (number 0-100)
- reasons (array of 2-3 specific reasons in English with Chennai road context)
- safetyHighlights (array of 2 points, e.g., "GCC Dome CCTV + 24x7 Street Illumination", "Near K4 Police Station")
- estimatedCostINR (number, total in ₹ for expected duration)
- walkingRecommendation (string, e.g., "1 min walk through pedestrian plaza")
- availabilityConfidence (number 0-100)
- co2SavedGrams (number, e.g. 450)
- timeSavedMinutes (number, e.g. 14)
- bestSuitedFor (string, e.g., "Safe Evening Shopping & EV Fast Charging")
- chennaiLocalTips (string, e.g., "Enter via Panagal Park side to avoid evening rush hour")
Do not include markdown codeblocks or extra text.`;

        const geminiRes = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const text = geminiRes.text || '';
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        if (Array.isArray(parsed) && parsed.length > 0) {
          rankedSpots = parsed.map(item => {
            const spot = parkingSpots.find(s => s.id === item.spotId) || availableSpots[0];
            return {
              spotId: spot.id,
              spot,
              matchScore: item.matchScore || 95,
              reasons: item.reasons || ['Ideal spot for your route in Chennai', 'Verified roadside smart sensor'],
              safetyHighlights: item.safetyHighlights || ['CCTV Monitored', 'High Ambient Lighting'],
              estimatedCostINR: item.estimatedCostINR || spot.hourlyRateINR * 2,
              walkingRecommendation: item.walkingRecommendation || `${spot.walkTimeMinutes} min walk to destination`,
              availabilityConfidence: item.availabilityConfidence || 92,
              co2SavedGrams: item.co2SavedGrams || 520,
              timeSavedMinutes: item.timeSavedMinutes || 15,
              bestSuitedFor: item.bestSuitedFor || 'Quick hassle-free roadside parking',
              chennaiLocalTips: item.chennaiLocalTips || 'Park within designated yellow kerb marking.'
            };
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini AI parsing fallback triggered:', geminiErr);
      }
    }

    // Heuristic Fallback if AI not returned
    if (rankedSpots.length === 0) {
      const durationHours = localParsed.hours;
      
      const scored = availableSpots.map(spot => {
        let score = 70;
        const reasons: string[] = [];
        const safetyHighlights: string[] = [];

        // Locality match
        if (localParsed.targetZone && spot.zone === localParsed.targetZone) {
          score += 25;
          reasons.push(`Direct match for ${spot.zone}`);
        } else if (!localParsed.targetZone) {
          score += 10;
        }

        // EV match
        if (localParsed.wantsEV) {
          if (spot.isEVCharging) {
            score += 20;
            reasons.push(`Equipped with ${spot.evChargerPowerKw}kW EV charging gun`);
          } else {
            score -= 15;
          }
        }

        // Safety priority
        if (localParsed.prioritizeSafety) {
          if (spot.safetyScore >= 90) {
            score += 15;
            safetyHighlights.push(`High safety score (${spot.safetyScore}/100) with ${spot.lightingQuality} street lighting`);
          }
          if (spot.cctvMonitored) {
            safetyHighlights.push(`Monitored by Greater Chennai Police / GCC Dome CCTV`);
          }
        } else {
          safetyHighlights.push(`${spot.patrolFrequency}`);
          safetyHighlights.push(`${spot.ambientLux} Lux Street Illumination`);
        }

        // Handicap
        if (localParsed.wantsHandicap && spot.isHandicap) {
          score += 20;
          reasons.push('Designated handicap accessible curb bay');
        }

        // Budget
        if (localParsed.cheapBudget && spot.hourlyRateINR <= 35) {
          score += 15;
          reasons.push(`Affordable rate at ₹${spot.hourlyRateINR}/hr`);
        } else {
          reasons.push(`Official GCC rate: ₹${spot.hourlyRateINR}/hr`);
        }

        // Availability bonus
        if (spot.status === 'available') {
          score += 10;
        }

        const estCost = spot.hourlyRateINR * durationHours;
        const boundedScore = Math.min(99, Math.max(55, score));

        let localTips = 'Follow yellow kerb markings. FASTag / UPI auto-debit supported.';
        if (spot.zone.includes('T. Nagar')) {
          localTips = 'Pondy Bazaar Pedestrian Plaza is best accessed via Panagal Park during peak 5-8 PM.';
        } else if (spot.zone.includes('Anna Nagar')) {
          localTips = 'Adjacent to Metro Gate 2. Excellent pedestrian connectivity.';
        } else if (spot.zone.includes('Besant')) {
          localTips = "6th Avenue Elliot's Beach has high police patrol; perfect for evening walks.";
        } else if (spot.zone.includes('Nungambakkam')) {
          localTips = 'KNK Road has active GCC camera marshals. Avoid double parking.';
        }

        return {
          spotId: spot.id,
          spot,
          matchScore: boundedScore,
          reasons: reasons.slice(0, 3),
          safetyHighlights: safetyHighlights.slice(0, 2),
          estimatedCostINR: estCost,
          walkingRecommendation: `${spot.walkTimeMinutes} min walk (${spot.distanceMeters}m)`,
          availabilityConfidence: spot.status === 'available' ? 95 : 70,
          co2SavedGrams: 420,
          timeSavedMinutes: 12,
          bestSuitedFor: spot.isEVCharging ? 'EV Charging & Prime Access' : 'Quick Street Access & High Safety',
          chennaiLocalTips: localTips
        };
      });

      scored.sort((a, b) => b.matchScore - a.matchScore);
      rankedSpots = scored.slice(0, 3);
    }

    return res.json({
      success: true,
      query,
      results: rankedSpots,
      parsedIntent: localParsed
    });
  } catch (err: any) {
    console.error('ParkMate query error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// 2. Get All Parking Spots with filter options
app.get('/api/spots', (req, res) => {
  const { zone, evOnly, handicapOnly, maxPrice, vehicleType, status } = req.query;
  
  let list = [...parkingSpots];

  if (zone && zone !== 'All Zones') {
    list = list.filter(s => s.zone === zone);
  }

  if (evOnly === 'true') {
    list = list.filter(s => s.isEVCharging);
  }

  if (handicapOnly === 'true') {
    list = list.filter(s => s.isHandicap);
  }

  if (maxPrice) {
    const p = Number(maxPrice);
    list = list.filter(s => s.hourlyRateINR <= p);
  }

  if (vehicleType && typeof vehicleType === 'string' && vehicleType !== 'all') {
    list = list.filter(s => s.vehicleTypes.includes(vehicleType as any));
  }

  if (status && status !== 'all') {
    list = list.filter(s => s.status === status);
  }

  return res.json({ success: true, count: list.length, data: list });
});

// 3. Get Single Parking Spot Details
app.get('/api/spots/:id', (req, res) => {
  const spot = parkingSpots.find(s => s.id === req.params.id);
  if (!spot) {
    return res.status(404).json({ error: 'Parking spot not found in Chennai registry' });
  }
  return res.json({ success: true, data: spot });
});

// 4. Redis Temporary Slot Lock (SET spot_lock:<id> <user> EX 120 NX)
app.post('/api/spots/:id/lock', (req, res) => {
  const spotId = req.params.id;
  const { userId = 'usr-anon-' + Math.floor(Math.random() * 1000), userName = 'Chennai Driver' } = req.body;
  const spot = parkingSpots.find(s => s.id === spotId);

  if (!spot) {
    return res.status(404).json({ error: 'Spot not found' });
  }

  const lockKey = `spot_lock:${spotId}`;
  const now = Date.now();
  const existingLock = redisLocks.get(lockKey);

  // Check if active lock exists
  if (existingLock && existingLock.expiresAt > now && existingLock.userId !== userId) {
    redisContentionCount++;
    return res.status(409).json({
      error: 'Spot is temporarily locked by another Chennai driver in Redis',
      lockHolder: existingLock.userName,
      expiresInSeconds: Math.ceil((existingLock.expiresAt - now) / 1000),
      redisKey: lockKey
    });
  }

  if (spot.status === 'occupied') {
    return res.status(400).json({ error: 'Spot is currently occupied by vehicle on road' });
  }

  const ttlSeconds = 120; // 2 minutes temporary lock
  const expiresAt = now + ttlSeconds * 1000;

  const newLock: RedisLock = {
    key: lockKey,
    spotId,
    userId,
    userName,
    acquiredAt: now,
    expiresAt,
    ttlSeconds,
    lockState: 'active'
  };

  redisLocks.set(lockKey, newLock);
  spot.status = 'locked';
  spot.currentLockExpiresAt = expiresAt;
  spot.currentLockUserId = userId;

  return res.json({
    success: true,
    message: `Redis atomic lock acquired for 120 seconds on ${spot.name}`,
    lock: newLock,
    spot
  });
});

// 5. Release Redis Lock
app.delete('/api/spots/:id/lock', (req, res) => {
  const spotId = req.params.id;
  const { userId } = req.body;
  const lockKey = `spot_lock:${spotId}`;
  const lock = redisLocks.get(lockKey);

  if (lock) {
    if (userId && lock.userId !== userId) {
      return res.status(403).json({ error: 'Cannot release a Redis lock owned by another user' });
    }
    lock.lockState = 'released';
    redisLocks.delete(lockKey);
  }

  const spot = parkingSpots.find(s => s.id === spotId);
  if (spot && spot.status === 'locked') {
    spot.status = 'available';
    spot.currentLockExpiresAt = undefined;
    spot.currentLockUserId = undefined;
  }

  return res.json({ success: true, message: 'Redis lock released successfully' });
});

// 6. Confirm Reservation & Generate Digital Smart Parking Pass
app.post('/api/spots/:id/reserve', (req, res) => {
  const spotId = req.params.id;
  const {
    userId = 'usr-default-1',
    userName = 'Srividhya',
    userPhone = '+91 98400 11223',
    vehiclePlate = 'TN-09-CB-4821',
    vehicleType = 'car',
    durationHours = 2,
    paymentMethod = 'UPI'
  } = req.body;

  const spot = parkingSpots.find(s => s.id === spotId);
  if (!spot) {
    return res.status(404).json({ error: 'Spot not found' });
  }

  const lockKey = `spot_lock:${spotId}`;
  const lock = redisLocks.get(lockKey);

  // Validate that if a lock was active, it belongs to this user
  if (lock && lock.expiresAt > Date.now() && lock.userId !== userId) {
    return res.status(409).json({ error: 'Cannot reserve: Redis lock is held by another user' });
  }

  const baseFee = spot.hourlyRateINR * durationHours;
  const convenienceFee = 5; // ₹5 GCC smart infra fee
  const discount = durationHours >= 4 ? 15 : 0; // ₹15 discount for long stay
  const totalFee = baseFee + convenienceFee - discount;

  const resId = `res-chennai-${Math.floor(1000 + Math.random() * 9000)}`;
  const pin = Math.floor(1000 + Math.random() * 9000).toString();
  const startTime = new Date().toISOString();
  const endTime = new Date(Date.now() + durationHours * 3600 * 1000).toISOString();

  const newRes: Reservation = {
    id: resId,
    spotId: spot.id,
    spotCode: spot.code,
    spotName: spot.name,
    streetAddress: spot.streetAddress,
    zone: spot.zone,
    userId,
    userName,
    userPhone,
    vehiclePlate,
    vehicleType,
    startTime,
    endTime,
    durationHours,
    baseFeeINR: baseFee,
    convenienceFeeINR: convenienceFee,
    discountINR: discount,
    totalFeeINR: totalFee,
    status: 'active',
    qrCodeData: `SMARTPARK-CHENNAI-${spot.code}-${resId}-${pin}`,
    pinCode: pin,
    createdAt: new Date().toISOString(),
    paymentMethod,
    paymentStatus: 'paid',
    guardianActive: true,
    actualCheckIn: new Date().toISOString()
  };

  reservations.unshift(newRes);

  // Update spot status
  spot.status = 'reserved';
  spot.currentPlate = vehiclePlate;
  spot.lastOccupiedChange = new Date().toISOString();

  // Release/promote the Redis lock
  if (lock) {
    lock.lockState = 'promoted';
    redisLocks.delete(lockKey);
  }

  // Create Virtual Safety Guardian Session for this reservation
  const guardianSession: SafetyGuardianSession = {
    id: `guard-${resId}`,
    reservationId: resId,
    spotId: spot.id,
    spotName: spot.name,
    streetAddress: spot.streetAddress,
    userLat: spot.lat,
    userLng: spot.lng,
    status: 'monitoring',
    startedAt: new Date().toISOString(),
    lightingScore: spot.safetyScore,
    cctvLiveStatus: 'online',
    perimeterSensors: {
      motionDetected: false,
      proximityWarning: false,
      vibrationTamper: false,
      ambientLux: spot.ambientLux
    },
    liveHazards: [],
    emergencyContactName: 'Greater Chennai Police SOS (100 / 112)',
    emergencyContactPhone: '112',
    alertsHistory: [
      {
        id: `alt-${Date.now()}`,
        type: 'zone_incident',
        message: `Virtual Guardian activated for ${spot.name}. Roadside sensors & CCTV monitoring live.`,
        timestamp: new Date().toISOString(),
        severity: 'info'
      }
    ]
  };

  guardianSessions.unshift(guardianSession);

  // Increment Eco stats
  ecoMetrics.totalTrips += 1;
  ecoMetrics.totalMinutesSaved += 14;
  ecoMetrics.totalFuelSavedLitres += 0.85;
  ecoMetrics.totalCo2ReducedKg += 1.95;
  ecoMetrics.totalRupeesSavedINR += 90;

  return res.json({
    success: true,
    message: `Roadside parking reserved at ${spot.name} for ₹${totalFee}`,
    reservation: newRes,
    guardianSession,
    spot
  });
});

// 7. Get Reservations
app.get('/api/reservations', (req, res) => {
  return res.json({ success: true, data: reservations });
});

// 8. Check-in & Check-out actions
app.post('/api/reservations/:id/checkin', (req, res) => {
  const reservation = reservations.find(r => r.id === req.params.id);
  if (!reservation) return res.status(404).json({ error: 'Reservation not found' });

  reservation.actualCheckIn = new Date().toISOString();
  reservation.status = 'active';

  const spot = parkingSpots.find(s => s.id === reservation.spotId);
  if (spot) {
    spot.status = 'occupied';
    spot.currentPlate = reservation.vehiclePlate;
  }

  return res.json({ success: true, message: 'Checked in at roadside parking bay', reservation, spot });
});

app.post('/api/reservations/:id/checkout', (req, res) => {
  const reservation = reservations.find(r => r.id === req.params.id);
  if (!reservation) return res.status(404).json({ error: 'Reservation not found' });

  reservation.actualCheckOut = new Date().toISOString();
  reservation.status = 'completed';
  reservation.guardianActive = false;

  const spot = parkingSpots.find(s => s.id === reservation.spotId);
  if (spot) {
    spot.status = 'available';
    spot.currentPlate = undefined;
    spot.lastOccupiedChange = new Date().toISOString();
  }

  const gSession = guardianSessions.find(g => g.reservationId === reservation.id);
  if (gSession) {
    gSession.status = 'ended';
  }

  return res.json({ success: true, message: 'Checked out successfully. Roadside bay released.', reservation, spot });
});

// 9. Availability & Congestion Predictions
app.get('/api/spots/:id/forecast', (req, res) => {
  const spot = parkingSpots.find(s => s.id === req.params.id);
  if (!spot) return res.status(404).json({ error: 'Spot not found' });

  const currentHour = new Date().getHours();
  const isRushHour = (currentHour >= 8 && currentHour <= 11) || (currentHour >= 17 && currentHour <= 21);

  const forecast: AvailabilityForecast = {
    spotId: spot.id,
    spotName: spot.name,
    zone: spot.zone,
    currentOccupancyProbability: spot.status === 'available' ? 25 : 85,
    predictions: [
      {
        timeOffset: '+30 mins',
        displayTime: new Date(Date.now() + 30 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        probabilityAvailable: spot.zone.includes('T. Nagar') ? 68 : 82,
        crowdLevel: spot.zone.includes('T. Nagar') ? 'moderate' : 'low',
        rushHourRisk: isRushHour ? 'High traffic flow on arterial road' : 'Smooth roadside vacancy'
      },
      {
        timeOffset: '+1 hour',
        displayTime: new Date(Date.now() + 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        probabilityAvailable: 75,
        crowdLevel: 'moderate',
        rushHourRisk: 'Peak market shopping hours approaching'
      },
      {
        timeOffset: '+2 hours',
        displayTime: new Date(Date.now() + 120 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        probabilityAvailable: 55,
        crowdLevel: 'high',
        rushHourRisk: 'High turnover probability; reserve in advance'
      },
      {
        timeOffset: '+4 hours',
        displayTime: new Date(Date.now() + 240 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        probabilityAvailable: 88,
        crowdLevel: 'low',
        rushHourRisk: 'Low traffic density expected'
      }
    ],
    peakHours: ['09:30 AM - 11:30 AM', '05:30 PM - 08:30 PM'],
    bestTimeToArrive: 'Arrive within the next 45 minutes for guaranteed immediate kerb parking.',
    aiAnalysis: `Historical sensor patterns for ${spot.name} show steady turnover every 35-45 minutes. GCC smart camera enforcement keeps illegal double-parking minimal.`
  };

  return res.json({ success: true, data: forecast });
});

// 10. Virtual Safety Guardian Session Management
app.get('/api/guardian/active', (req, res) => {
  const activeSessions = guardianSessions.filter(g => g.status !== 'ended');
  return res.json({ success: true, data: activeSessions });
});

app.post('/api/guardian/:id/trigger-sos', (req, res) => {
  const session = guardianSessions.find(g => g.id === req.params.id || g.reservationId === req.params.id);
  if (!session) return res.status(404).json({ error: 'Guardian session not found' });

  session.status = 'alert';
  session.alertsHistory.unshift({
    id: `sos-${Date.now()}`,
    type: 'unusual_motion',
    message: 'EMERGENCY SOS Triggered! Greater Chennai Police (100) & GCC Traffic Control Room alerted with GPS coordinates.',
    timestamp: new Date().toISOString(),
    severity: 'critical'
  });

  return res.json({
    success: true,
    message: 'SOS Alert broadcasted to Chennai Police Control & Emergency Contacts',
    session
  });
});

app.post('/api/guardian/:id/sensor-ping', (req, res) => {
  const session = guardianSessions.find(g => g.id === req.params.id);
  if (!session) return res.status(404).json({ error: 'Guardian session not found' });

  const { motionDetected, vibrationTamper } = req.body;
  if (motionDetected !== undefined) session.perimeterSensors.motionDetected = motionDetected;
  if (vibrationTamper !== undefined) session.perimeterSensors.vibrationTamper = vibrationTamper;

  if (vibrationTamper) {
    session.alertsHistory.unshift({
      id: `vib-${Date.now()}`,
      type: 'unusual_motion',
      message: 'Perimeter vibration sensor triggered near vehicle chassis.',
      timestamp: new Date().toISOString(),
      severity: 'warning'
    });
  }

  return res.json({ success: true, session });
});

// 11. Community Reports (Crowdsourced Chennai Roadside Intel)
app.get('/api/reports', (req, res) => {
  return res.json({ success: true, data: communityReports });
});

app.post('/api/reports', (req, res) => {
  const { spotId, streetAddress, zone, reportType, description, severity = 'medium', reportedBy = 'Chennai Driver' } = req.body;
  if (!streetAddress || !reportType || !description) {
    return res.status(400).json({ error: 'Missing required report fields' });
  }

  const spot = parkingSpots.find(s => s.id === spotId);

  const newReport: CommunityReport = {
    id: `rep-ch-${Math.floor(100 + Math.random() * 900)}`,
    spotId,
    spotName: spot?.name || 'Roadside Curb Segment',
    streetAddress,
    zone: (zone as ChennaiZone) || spot?.zone || 'T. Nagar (Pondy Bazaar / Usman Rd)',
    reportType,
    description,
    upvotes: 1,
    downvotes: 0,
    reportedBy,
    createdAt: new Date().toISOString(),
    status: 'active',
    severity
  };

  communityReports.unshift(newReport);
  return res.json({ success: true, message: 'Community report broadcasted across Chennai SmartPark network', report: newReport });
});

app.post('/api/reports/:id/vote', (req, res) => {
  const { type } = req.body; // 'upvote' | 'downvote'
  const report = communityReports.find(r => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });

  if (type === 'upvote') {
    report.upvotes += 1;
    report.userAction = 'upvoted';
  } else if (type === 'downvote') {
    report.downvotes += 1;
    report.userAction = 'downvoted';
  }

  return res.json({ success: true, report });
});

// 12. Eco & Time Savings Impact
app.get('/api/eco-impact', (req, res) => {
  return res.json({ success: true, data: ecoMetrics });
});

// 13. Admin & Traffic Police Dashboard Metrics
app.get('/api/admin/metrics', (req, res) => {
  const totalSpots = parkingSpots.length;
  const occupiedSpots = parkingSpots.filter(s => s.status === 'occupied').length;
  const availableSpots = parkingSpots.filter(s => s.status === 'available').length;
  const reservedSpots = parkingSpots.filter(s => s.status === 'reserved').length;
  const lockedSpots = parkingSpots.filter(s => s.status === 'locked').length;

  const occupancyRate = Math.round(((occupiedSpots + reservedSpots + lockedSpots) / totalSpots) * 100);

  const todayRevenueINR = reservations.reduce((sum, r) => sum + r.totalFeeINR, 0) + 14850; // includes day's meter aggregation

  // Zone breakdown
  const zones: ChennaiZone[] = [
    'T. Nagar (Pondy Bazaar / Usman Rd)',
    'Anna Nagar (2nd Ave / Shanthi Colony)',
    'Nungambakkam (Khader Nawaz Khan Rd)',
    'Mylapore (Luz / Kapaleeshwarar)',
    "Besant Nagar & Adyar (Elliot's Beach)",
    'Velachery (100 Ft Bypass Rd)',
    'OMR IT Corridor (Perungudi / Thoraipakkam)',
    'Marina Beach (Kamarajar Salai)',
    'Alwarpet & RA Puram (TTK Rd)'
  ];

  const zoneOccupancies = zones.map(z => {
    const spotsInZone = parkingSpots.filter(s => s.zone === z);
    const occ = spotsInZone.filter(s => s.status !== 'available').length;
    const rate = spotsInZone.length > 0 ? Math.round((occ / spotsInZone.length) * 100) : 0;
    return {
      zone: z,
      count: spotsInZone.length,
      available: spotsInZone.filter(s => s.status === 'available').length,
      rate
    };
  });

  const metrics: AdminMetrics = {
    totalSpots,
    occupiedSpots,
    availableSpots,
    reservedSpots,
    lockedSpots,
    occupancyRate,
    todayRevenueINR,
    activeGuardianSessions: guardianSessions.filter(g => g.status !== 'ended').length,
    pendingReportsCount: communityReports.filter(r => r.status === 'active').length,
    zoneOccupancies,
    redisLockContentionCount: redisContentionCount,
    sensorHealthPct: 98.4,
    simSpeedMultiplier: 1
  };

  return res.json({ success: true, data: metrics });
});

// 14. Admin Simulation Controls
app.post('/api/admin/simulate-rush', (req, res) => {
  // Randomly toggle 3 available spots to occupied
  let count = 0;
  for (const s of parkingSpots) {
    if (s.status === 'available' && count < 3) {
      s.status = 'occupied';
      s.currentPlate = `TN-02-ZZ-${Math.floor(1000 + Math.random() * 9000)}`;
      s.lastOccupiedChange = new Date().toISOString();
      count++;
    }
  }
  return res.json({ success: true, message: `Rush hour simulated: ${count} bays marked occupied`, spots: parkingSpots });
});

app.post('/api/admin/simulate-race-condition', (req, res) => {
  // Test Redis atomic locks with 5 concurrent driver threads trying to lock the same available spot
  const availableSpot = parkingSpots.find(s => s.status === 'available') || parkingSpots[0];
  const lockKey = `spot_lock:${availableSpot.id}`;

  const results: any[] = [];
  const drivers = ['Driver A (Creta)', 'Driver B (Tata Nexon EV)', 'Driver C (Honda City)', 'Driver D (Ather 450X)', 'Driver E (Mahindra XUV700)'];

  drivers.forEach((driverName, idx) => {
    const userId = `usr-race-${idx + 1}`;
    const now = Date.now();
    const existing = redisLocks.get(lockKey);

    if (!existing || existing.expiresAt <= now) {
      // Won the lock
      const lockObj: RedisLock = {
        key: lockKey,
        spotId: availableSpot.id,
        userId,
        userName: driverName,
        acquiredAt: now,
        expiresAt: now + 120 * 1000,
        ttlSeconds: 120,
        lockState: 'active'
      };
      redisLocks.set(lockKey, lockObj);
      availableSpot.status = 'locked';
      availableSpot.currentLockUserId = userId;
      availableSpot.currentLockExpiresAt = lockObj.expiresAt;

      results.push({
        driver: driverName,
        status: 'ACQUIRED_LOCK (200 OK)',
        detail: `Successfully acquired Redis atomic mutex lock on ${lockKey}. 120s hold.`
      });
    } else {
      redisContentionCount++;
      results.push({
        driver: driverName,
        status: 'LOCK_REJECTED (409 Conflict)',
        detail: `Redis single-owner mutex rejected. Held by ${existing.userName} (expires in ${Math.ceil((existing.expiresAt - now) / 1000)}s).`
      });
    }
  });

  return res.json({
    success: true,
    test: 'Redis Single-Owner Concurrency & Race Condition Test',
    spot: availableSpot,
    contentionResults: results,
    redisContentionTotal: redisContentionCount
  });
});

app.post('/api/admin/toggle-spot', (req, res) => {
  const { spotId, status } = req.body;
  const spot = parkingSpots.find(s => s.id === spotId);
  if (!spot) return res.status(404).json({ error: 'Spot not found' });

  spot.status = status;
  if (status === 'available') {
    spot.currentPlate = undefined;
    redisLocks.delete(`spot_lock:${spot.id}`);
  }
  return res.json({ success: true, spot });
});

// 15. Redis State Inspector
app.get('/api/redis/state', (req, res) => {
  const now = Date.now();
  const keys = Array.from(redisLocks.values()).map(lock => ({
    ...lock,
    remainingSeconds: Math.max(0, Math.ceil((lock.expiresAt - now) / 1000)),
    isExpired: now > lock.expiresAt
  }));

  return res.json({
    success: true,
    redisHost: 'redis://smartpark-inmemory-redis:6379 (0ms latency)',
    activeKeysCount: keys.filter(k => !k.isExpired).length,
    totalContentionEvents: redisContentionCount,
    keys
  });
});

// 16. PostgreSQL Database Table Metadata & Interactive SQL Console
app.get('/api/sql/tables', (req, res) => {
  const tables: PostgresTableMeta[] = [
    {
      tableName: 'parking_spots',
      description: 'GCC roadside sensor bays, geospatial coordinates, hourly rates (₹), and safety ratings',
      rowCount: parkingSpots.length,
      columns: [
        { name: 'id', type: 'VARCHAR(64)', isPrimary: true },
        { name: 'code', type: 'VARCHAR(20)' },
        { name: 'name', type: 'VARCHAR(128)' },
        { name: 'street_address', type: 'TEXT' },
        { name: 'zone', type: 'VARCHAR(64)' },
        { name: 'hourly_rate_inr', type: 'NUMERIC(6,2)' },
        { name: 'status', type: 'VARCHAR(20)' },
        { name: 'is_ev_charging', type: 'BOOLEAN' },
        { name: 'ev_charger_power_kw', type: 'INTEGER' },
        { name: 'is_handicap', type: 'BOOLEAN' },
        { name: 'safety_score', type: 'INTEGER' },
        { name: 'ambient_lux', type: 'INTEGER' },
        { name: 'cctv_monitored', type: 'BOOLEAN' },
        { name: 'smart_meter_number', type: 'VARCHAR(32)' },
        { name: 'lat', type: 'DOUBLE PRECISION' },
        { name: 'lng', type: 'DOUBLE PRECISION' }
      ],
      sampleRows: parkingSpots.slice(0, 5)
    },
    {
      tableName: 'reservations',
      description: 'Bookings, digital parking passes, UPI/FASTag transactions in ₹, QR codes, and PINs',
      rowCount: reservations.length,
      columns: [
        { name: 'id', type: 'VARCHAR(64)', isPrimary: true },
        { name: 'spot_id', type: 'VARCHAR(64)', isForeign: true },
        { name: 'user_name', type: 'VARCHAR(128)' },
        { name: 'user_phone', type: 'VARCHAR(20)' },
        { name: 'vehicle_plate', type: 'VARCHAR(20)' },
        { name: 'vehicle_type', type: 'VARCHAR(20)' },
        { name: 'duration_hours', type: 'INTEGER' },
        { name: 'total_fee_inr', type: 'NUMERIC(8,2)' },
        { name: 'payment_status', type: 'VARCHAR(20)' },
        { name: 'payment_method', type: 'VARCHAR(20)' },
        { name: 'pin_code', type: 'VARCHAR(10)' },
        { name: 'status', type: 'VARCHAR(20)' },
        { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE' }
      ],
      sampleRows: reservations.slice(0, 5)
    },
    {
      tableName: 'redis_locks',
      description: 'Temporary mutex hold records for preventing double booking on Chennai roadside kerbs',
      rowCount: redisLocks.size,
      columns: [
        { name: 'key', type: 'VARCHAR(128)', isPrimary: true },
        { name: 'spot_id', type: 'VARCHAR(64)', isForeign: true },
        { name: 'user_id', type: 'VARCHAR(64)' },
        { name: 'user_name', type: 'VARCHAR(128)' },
        { name: 'ttl_seconds', type: 'INTEGER' },
        { name: 'acquired_at', type: 'BIGINT' },
        { name: 'expires_at', type: 'BIGINT' },
        { name: 'lock_state', type: 'VARCHAR(20)' }
      ],
      sampleRows: Array.from(redisLocks.values())
    },
    {
      tableName: 'community_reports',
      description: 'Crowdsourced road intel (GCC sweeping, waterlogging, broken meter, free spot alerts)',
      rowCount: communityReports.length,
      columns: [
        { name: 'id', type: 'VARCHAR(64)', isPrimary: true },
        { name: 'spot_id', type: 'VARCHAR(64)', isForeign: true },
        { name: 'zone', type: 'VARCHAR(64)' },
        { name: 'report_type', type: 'VARCHAR(32)' },
        { name: 'description', type: 'TEXT' },
        { name: 'upvotes', type: 'INTEGER' },
        { name: 'downvotes', type: 'INTEGER' },
        { name: 'severity', type: 'VARCHAR(20)' },
        { name: 'status', type: 'VARCHAR(20)' },
        { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE' }
      ],
      sampleRows: communityReports
    },
    {
      tableName: 'guardian_sessions',
      description: 'Virtual parking guardian telemetry, lighting readings, and Chennai Police SOS logs',
      rowCount: guardianSessions.length,
      columns: [
        { name: 'id', type: 'VARCHAR(64)', isPrimary: true },
        { name: 'reservation_id', type: 'VARCHAR(64)', isForeign: true },
        { name: 'spot_id', type: 'VARCHAR(64)' },
        { name: 'status', type: 'VARCHAR(20)' },
        { name: 'lighting_score', type: 'INTEGER' },
        { name: 'cctv_live_status', type: 'VARCHAR(20)' },
        { name: 'started_at', type: 'TIMESTAMP WITH TIME ZONE' }
      ],
      sampleRows: guardianSessions
    }
  ];

  return res.json({ success: true, tables });
});

// Interactive SQL Executor
app.post('/api/sql/query', (req, res) => {
  const { query } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'SQL query string required' });
  }

  const q = query.trim().toUpperCase();

  try {
    if (q.includes('FROM PARKING_SPOTS')) {
      let filtered = [...parkingSpots];
      if (q.includes("STATUS = 'AVAILABLE'") || q.includes('STATUS=\'AVAILABLE\'')) {
        filtered = filtered.filter(s => s.status === 'available');
      }
      if (q.includes('IS_EV_CHARGING = TRUE')) {
        filtered = filtered.filter(s => s.isEVCharging);
      }
      return res.json({
        success: true,
        executionTimeMs: 1.4,
        rowsAffected: filtered.length,
        columns: Object.keys(filtered[0] || {}),
        rows: filtered
      });
    }

    if (q.includes('FROM RESERVATIONS')) {
      return res.json({
        success: true,
        executionTimeMs: 0.9,
        rowsAffected: reservations.length,
        columns: Object.keys(reservations[0] || {}),
        rows: reservations
      });
    }

    if (q.includes('FROM REDIS_LOCKS')) {
      const lockArr = Array.from(redisLocks.values());
      return res.json({
        success: true,
        executionTimeMs: 0.5,
        rowsAffected: lockArr.length,
        columns: ['key', 'spotId', 'userId', 'userName', 'acquiredAt', 'expiresAt', 'lockState'],
        rows: lockArr
      });
    }

    if (q.includes('FROM COMMUNITY_REPORTS')) {
      return res.json({
        success: true,
        executionTimeMs: 0.7,
        rowsAffected: communityReports.length,
        columns: Object.keys(communityReports[0] || {}),
        rows: communityReports
      });
    }

    if (q.includes('SELECT COUNT(*)') || q.includes('SELECT AVG(') || q.includes('SELECT SUM(')) {
      const avgRate = Math.round(parkingSpots.reduce((a, b) => a + b.hourlyRateINR, 0) / parkingSpots.length);
      const totalRev = reservations.reduce((a, b) => a + b.totalFeeINR, 0);
      return res.json({
        success: true,
        executionTimeMs: 1.1,
        rowsAffected: 1,
        columns: ['total_spots', 'available_spots', 'avg_rate_inr', 'total_revenue_inr'],
        rows: [
          {
            total_spots: parkingSpots.length,
            available_spots: parkingSpots.filter(s => s.status === 'available').length,
            avg_rate_inr: avgRate,
            total_revenue_inr: totalRev
          }
        ]
      });
    }

    // Default table schema query
    return res.json({
      success: true,
      executionTimeMs: 1.2,
      rowsAffected: parkingSpots.length,
      columns: Object.keys(parkingSpots[0]),
      rows: parkingSpots.slice(0, 10)
    });
  } catch (err: any) {
    return res.status(400).json({ error: 'SQL Execution Error: ' + err.message });
  }
});

// ==========================================
// STATIC FRONTEND SERVING / VITE INTEGRATION
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Serve production build from dist
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Dev Mode with Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SmartPark Full-Stack Chennai Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
