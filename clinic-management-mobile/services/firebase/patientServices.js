import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const addAppointment = async (appointmentData, paymentStatus, patientName) => {
  try {
    const appointmentRef = await addDoc(collection(db, 'appointments'), {
      ...appointmentData,
      patientName: patientName,
      paymentStatus: paymentStatus,
      createdAt: Timestamp.now(),
      start_time: Timestamp.fromDate(new Date(`${appointmentData.appointmentDate} ${appointmentData.appointmentTime}`)),
      reason_for_visit: appointmentData.reasonForVisit,
      visitType: appointmentData.visitType,
      payment_method: appointmentData.paymentMethod,
      payment_amount: appointmentData.paymentAmount,
      status: appointmentData.status || 'pending'
    });
    
    return appointmentRef.id;
  } catch (error) {
    console.error('Error adding appointment:', error);
    throw error;
  }
};

export const getPatientAppointments = async (patientId) => {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('patientId', '==', patientId),
      orderBy('start_time', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const appointments = [];
    
    querySnapshot.forEach((doc) => {
      appointments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return appointments;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

export const getScheduledAppointments = async () => {
  try {
    const q = query(collection(db, 'appointments'));
    const querySnapshot = await getDocs(q);
    const appointments = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.start_time) {
        appointments.push(data.start_time.toDate());
      }
    });
    
    return appointments;
  } catch (error) {
    console.error('Error fetching scheduled appointments:', error);
    throw error;
  }
};

export const getPatientDiagnoses = async (patientId) => {
  try {
    const q = query(
      collection(db, 'diagnoses'),
      where('patientId', '==', patientId)
    );
    
    const querySnapshot = await getDocs(q);
    const diagnoses = [];
    
    querySnapshot.forEach((doc) => {
      diagnoses.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return diagnoses;
  } catch (error) {
    console.error('Error fetching diagnoses:', error);
    throw error;
  }
};

export const getTreatmentHistory = async (diagnosisId) => {
  try {
    const q = query(
      collection(db, 'treatments'),
      where('diagnosisId', '==', diagnosisId)
    );
    
    const querySnapshot = await getDocs(q);
    const treatments = [];
    
    querySnapshot.forEach((doc) => {
      treatments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return treatments;
  } catch (error) {
    console.error('Error fetching treatments:', error);
    throw error;
  }
};
