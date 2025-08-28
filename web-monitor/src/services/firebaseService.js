import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  where,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';

export class FirebaseService {
  // Tickets
  static async createTicket(ticketData) {
    try {
      const docRef = await addDoc(collection(db, 'tickets'), {
        ...ticketData,
        isValid: true,
        isUsed: false,
        currentSession: null,
        createdAt: serverTimestamp(),
        lastUsed: null
      });
      return { id: docRef.id, ...ticketData };
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }

  static async getTickets() {
    try {
      const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error getting tickets:', error);
      throw error;
    }
  }

  static subscribeToTickets(callback) {
    const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const tickets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
      }));
      callback(tickets);
    }, (error) => {
      console.error('Error in tickets subscription:', error);
      callback([]);
    });
  }

  // Complaints
  static async createComplaint(complaintData) {
    try {
      const docRef = await addDoc(collection(db, 'complaints'), {
        ...complaintData,
        status: 'pending',
        resolved: false,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...complaintData };
    } catch (error) {
      console.error('Error creating complaint:', error);
      throw error;
    }
  }

  static async getComplaints() {
    try {
      const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error getting complaints:', error);
      throw error;
    }
  }

  static subscribeToComplaints(callback) {
    const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const complaints = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
      }));
      callback(complaints);
    }, (error) => {
      console.error('Error in complaints subscription:', error);
      callback([]);
    });
  }

  // Driver Status (for map) - Fixed field mapping
  static subscribeToDriverStatus(callback) {
    return onSnapshot(collection(db, 'driver_status'), (snapshot) => {
      const drivers = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          driverId: data.driverId || doc.id, // Use explicit driverId or fall back to doc ID
          busNumber: data.busNumber || `BUS-${doc.id.slice(-3)}`,
          location: data.location ? {
            latitude: data.location.latitude,
            longitude: data.location.longitude,
            speed: data.location.speed || 0,
            timestamp: data.location.timestamp?.toDate?.() || new Date(),
            accuracy: data.location.accuracy || 0,
            altitude: data.location.altitude || 0,
            heading: data.location.heading || 0,
            speedAccuracy: data.location.speedAccuracy || 0
          } : null,
          alertLevel: data.alertLevel || 'none',
          isDrowsy: Boolean(data.isDrowsy),
          closedEyeFrames: data.closedEyeFrames || 0,
          isOnline: Boolean(data.isOnline),
          lastUpdate: data.lastUpdate?.toDate?.()?.toISOString() || new Date().toISOString()
        };
      });
      callback(drivers);
    }, (error) => {
      console.error('Error in driver status subscription:', error);
      callback([]);
    });
  }

  // Bus Routes and Management
  static async createBusRoute(routeData) {
    try {
      const docRef = await addDoc(collection(db, 'bus_routes'), {
        ...routeData,
        isActive: true,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...routeData };
    } catch (error) {
      console.error('Error creating bus route:', error);
      throw error;
    }
  }

  static async getBusRoutes() {
    try {
      const querySnapshot = await getDocs(collection(db, 'bus_routes'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting bus routes:', error);
      throw error;
    }
  }

  static subscribeToRoutes(callback) {
    return onSnapshot(collection(db, 'bus_routes'), (snapshot) => {
      const routes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(routes);
    }, (error) => {
      console.error('Error in routes subscription:', error);
      callback([]);
    });
  }

  // Drivers Management
  static async createDriver(driverData) {
    try {
      const docRef = await addDoc(collection(db, 'drivers'), {
        ...driverData,
        isActive: true,
        currentSession: null,
        createdAt: serverTimestamp(),
        lastLogin: null
      });
      return { id: docRef.id, ...driverData };
    } catch (error) {
      console.error('Error creating driver:', error);
      throw error;
    }
  }

  static async getDrivers() {
    try {
      const querySnapshot = await getDocs(collection(db, 'drivers'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting drivers:', error);
      throw error;
    }
  }

  static async updateDriverStatus(driverId, statusData) {
    try {
      const driverRef = doc(db, 'driver_status', driverId);
      await updateDoc(driverRef, {
        ...statusData,
        lastUpdate: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating driver status:', error);
      throw error;
    }
  }

  // Incidents
  static async getIncidents() {
    try {
      const q = query(
        collection(db, 'incidents'), 
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()?.toISOString() || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error getting incidents:', error);
      throw error;
    }
  }

  static subscribeToIncidents(callback) {
    const q = query(
      collection(db, 'incidents'), 
      orderBy('timestamp', 'desc'),
      limit(100)
    );
    return onSnapshot(q, (snapshot) => {
      const incidents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()?.toISOString() || new Date().toISOString()
      }));
      callback(incidents);
    }, (error) => {
      console.error('Error in incidents subscription:', error);
      callback([]);
    });
  }

  // Companies
  static async getCompanies() {
    try {
      const querySnapshot = await getDocs(collection(db, 'companies'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting companies:', error);
      throw error;
    }
  }

  // Analytics helpers
  static async getActiveDriversCount() {
    try {
      const q = query(
        collection(db, 'driver_status'),
        where('isOnline', '==', true)
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting active drivers count:', error);
      return 0;
    }
  }

  static async getDrowsyDriversCount() {
    try {
      const q = query(
        collection(db, 'driver_status'),
        where('isDrowsy', '==', true)
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting drowsy drivers count:', error);
      return 0;
    }
  }

  static async getTodaysIncidentCount() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const q = query(
        collection(db, 'incidents'),
        where('timestamp', '>=', today)
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting today\'s incident count:', error);
      return 0;
    }
  }
}