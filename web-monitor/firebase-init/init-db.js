// Firebase Database Initialization Script - CommonJS Version
// Run this as: node init-db.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');
const { getAuth } = require('firebase/auth');
const crypto = require('crypto');

const firebaseConfig = {
  apiKey: 'AIzaSyCE1QgwebhQ8NL4lcloclFyVWyIzjWmvMY',
  appId: '1:521728664554:web:8ea0a5a61823fef9db4893',
  messagingSenderId: '521728664554',
  projectId: 'safe-commute-cb13b',
  authDomain: 'safe-commute-cb13b.firebaseapp.com',
  storageBucket: 'safe-commute-cb13b.firebasestorage.app',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Initialize sample data
async function initializeDatabase() {
  console.log('Starting database initialization...');

  try {
    // 1. Create sample bus routes
    const routes = [
      {
        id: 'ROUTE_001',
        name: 'Airport Express',
        color: '#3B82F6',
        startPoint: 'Kotoka Airport',
        endPoint: 'Accra Mall',
        isActive: true,
        estimatedDuration: 45,
        createdAt: serverTimestamp()
      },
      {
        id: 'ROUTE_002', 
        name: 'City Center Loop',
        color: '#10B981',
        startPoint: 'Circle',
        endPoint: 'Osu',
        isActive: true,
        estimatedDuration: 30,
        createdAt: serverTimestamp()
      },
      {
        id: 'ROUTE_003',
        name: 'University Shuttle',
        color: '#F59E0B',
        startPoint: 'University of Ghana',
        endPoint: 'Madina Station',
        isActive: true,
        estimatedDuration: 25,
        createdAt: serverTimestamp()
      }
    ];

    console.log('Creating bus routes...');
    for (const route of routes) {
      await addDoc(collection(db, 'bus_routes'), route);
      console.log(`✅ Created route: ${route.name}`);
    }

    // 2. Create sample drivers
    const drivers = [
      {
        email: 'driver1@safecommute.com',
        password: 'driver123',
        companyId: 'COMPANY_001',
        busNumber: 'BUS-001',
        licenseNumber: 'DL001234',
        phoneNumber: '+233501234567',
        routeId: 'ROUTE_001',
        isActive: true,
        currentSession: null,
        lastLogin: null,
        createdAt: serverTimestamp()
      },
      {
        email: 'driver2@safecommute.com', 
        password: 'driver123',
        companyId: 'COMPANY_001',
        busNumber: 'BUS-002',
        licenseNumber: 'DL001235',
        phoneNumber: '+233501234568',
        routeId: 'ROUTE_002',
        isActive: true,
        currentSession: null,
        lastLogin: null,
        createdAt: serverTimestamp()
      },
      {
        email: 'driver3@safecommute.com',
        password: 'driver123', 
        companyId: 'COMPANY_001',
        busNumber: 'BUS-003',
        licenseNumber: 'DL001236',
        phoneNumber: '+233501234569',
        routeId: 'ROUTE_003',
        isActive: true,
        currentSession: null,
        lastLogin: null,
        createdAt: serverTimestamp()
      }
    ];

    console.log('Creating driver accounts...');
    for (const driver of drivers) {
      // Hash password
      const passwordHash = crypto.createHash('sha256').update(driver.password).digest('hex');
      
      // Create driver record (exclude plain password)
      const { password, ...driverData } = driver;
      await addDoc(collection(db, 'drivers'), {
        ...driverData,
        passwordHash
      });
      
      console.log(`✅ Created driver: ${driver.email}`);
    }

    // 3. Create sample tickets
    const tickets = [
      {
        ticketNumber: 'TKT-20250826-0001',
        passengerName: 'John Doe',
        phoneNumber: '+233501111111',
        isValid: true,
        isUsed: false,
        currentSession: null,
        createdAt: serverTimestamp(),
        lastUsed: null
      },
      {
        ticketNumber: 'TKT-20250826-0002',
        passengerName: 'Jane Smith',
        phoneNumber: '+233501111112', 
        isValid: true,
        isUsed: false,
        currentSession: null,
        createdAt: serverTimestamp(),
        lastUsed: null
      },
      {
        ticketNumber: 'TKT-20250826-0003',
        passengerName: 'Michael Johnson',
        phoneNumber: '+233501111113',
        isValid: true,
        isUsed: true,
        currentSession: null,
        createdAt: serverTimestamp(),
        lastUsed: serverTimestamp()
      }
    ];

    console.log('Creating sample tickets...');
    for (const ticket of tickets) {
      await addDoc(collection(db, 'tickets'), ticket);
      console.log(`✅ Created ticket: ${ticket.ticketNumber}`);
    }

    // 4. Create sample driver status (for map display)
    const driverStatuses = [
      {
        driverId: 'driver1_uid', // This would be the actual Firebase Auth UID
        busNumber: 'BUS-001',
        location: {
          latitude: 5.6037,
          longitude: -0.1870,
          timestamp: serverTimestamp(),
          accuracy: 10,
          altitude: 100,
          heading: 45,
          speed: 15.5,
          speedAccuracy: 2
        },
        alertLevel: 'none',
        isDrowsy: false,
        closedEyeFrames: 0,
        isOnline: true,
        lastUpdate: serverTimestamp()
      },
      {
        driverId: 'driver2_uid',
        busNumber: 'BUS-002', 
        location: {
          latitude: 5.6150,
          longitude: -0.1950,
          timestamp: serverTimestamp(),
          accuracy: 8,
          altitude: 95,
          heading: 180,
          speed: 22.3,
          speedAccuracy: 1.5
        },
        alertLevel: 'mild',
        isDrowsy: true,
        closedEyeFrames: 18,
        isOnline: true,
        lastUpdate: serverTimestamp()
      }
    ];

    console.log('Creating driver status data...');
    for (const status of driverStatuses) {
      await addDoc(collection(db, 'driver_status'), status);
      console.log(`✅ Created driver status: ${status.busNumber}`);
    }

    // 5. Create sample companies
    const companies = [
      {
        name: 'Accra Transport Company',
        companyId: 'COMPANY_001',
        contactEmail: 'admin@accratransport.com',
        phoneNumber: '+233302123456',
        address: 'Accra, Ghana',
        isActive: true,
        totalBuses: 25,
        totalDrivers: 30,
        createdAt: serverTimestamp()
      }
    ];

    console.log('Creating company data...');
    for (const company of companies) {
      await addDoc(collection(db, 'companies'), company);
      console.log(`✅ Created company: ${company.name}`);
    }

    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n📝 Sample credentials:');
    console.log('Driver 1: driver1@safecommute.com / driver123');
    console.log('Driver 2: driver2@safecommute.com / driver123'); 
    console.log('Driver 3: driver3@safecommute.com / driver123');
    console.log('\n🎫 Sample ticket numbers:');
    console.log('TKT-20250826-0001 (Valid)');
    console.log('TKT-20250826-0002 (Valid)');
    console.log('TKT-20250826-0003 (Used)');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    console.error('\nCheck that:');
    console.error('1. Firebase config is correct');
    console.error('2. Firestore security rules allow writes');
    console.error('3. Internet connection is stable');
  }
}

// Run initialization
initializeDatabase();