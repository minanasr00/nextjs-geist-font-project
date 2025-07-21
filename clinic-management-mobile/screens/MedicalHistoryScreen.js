import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { 
  getPatientAppointments, 
  getPatientDiagnoses, 
  getTreatmentHistory 
} from '../services/firebase/patientServices';
import { AuthContext } from '../contexts/AuthContext';
import Toast from 'react-native-toast-message';
import styles from '../styles/common';

export default function MedicalHistoryScreen({ navigation }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch appointments
      const pappointments = await getPatientAppointments(user.uid);
      setAppointments(pappointments);
      console.log("Fetched appointments:", pappointments);

      // Fetch diagnoses
      const pdiagnoses = await getPatientDiagnoses(user.uid);
      setDiagnoses(pdiagnoses);
      console.log("Fetched diagnoses:", pdiagnoses);

      // Fetch treatments for each diagnosis
      const allTreatments = [];
      for (const diagnosis of pdiagnoses) {
        try {
          const diagnosisTreatments = await getTreatmentHistory(diagnosis.id);
          allTreatments.push(...diagnosisTreatments);
        } catch (error) {
          console.error("Error fetching treatments for diagnosis", diagnosis.id, ":", error);
        }
      }
      setTreatments(allTreatments);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load medical history',
        position: 'top'
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadedDocuments = [
    {
      name: "Blood Test Results",
      date: "July 16, 2024",
      type: "Lab Report"
    },
    {
      name: "Allergy Test Results",
      date: "June 21, 2024",
      type: "Lab Report"
    }
  ];

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: true
      });

      if (!result.canceled && result.assets) {
        const newFiles = result.assets.map(asset => ({
          id: Date.now() + Math.random(),
          name: asset.name,
          size: asset.size,
          type: asset.mimeType,
          uri: asset.uri,
          uploadDate: new Date().toLocaleDateString()
        }));
        
        setUploadedFiles(prev => [...prev, ...newFiles]);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: `${newFiles.length} file(s) uploaded successfully`,
          position: 'top'
        });
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to upload document',
        position: 'top'
      });
    }
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderAppointment = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>
        {item.start_time?.toDate ? item.start_time.toDate().toLocaleDateString('en-US') : 'Date not available'}
      </Text>
      <Text style={styles.cardText}>Visit Type: {item.visitType}</Text>
      <Text style={styles.cardText}>Reason: {item.reason_for_visit}</Text>
      <Text style={styles.cardText}>Status: {item.status}</Text>
      <Text style={styles.cardText}>Payment: {item.payment_method} - ${item.payment_amount}</Text>
    </View>
  );

  const renderDiagnosis = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.prescription}</Text>
      <Text style={styles.cardText}>{item.instructions}</Text>
    </View>
  );

  const renderTreatment = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.medicationName}</Text>
      <Text style={styles.cardText}>Diagnosis: {item.diagnoseName}</Text>
      <Text style={styles.cardText}>Dosage: {item.dosage}</Text>
      <Text style={styles.cardText}>Frequency: {item.frequency}</Text>
      <Text style={styles.cardText}>Refills: {item.refills}</Text>
      {item.notes && <Text style={styles.cardText}>Notes: {item.notes}</Text>}
    </View>
  );

  const renderDocument = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardText}>Date: {item.date}</Text>
      <Text style={styles.cardText}>Type: {item.type}</Text>
    </View>
  );

  const renderUploadedFile = ({ item }) => (
    <View style={[styles.card, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardText}>
          {formatFileSize(item.size)} • Uploaded {item.uploadDate}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => removeFile(item.id)}
        style={{ padding: 8 }}
      >
        <Text style={{ color: '#d32f2f', fontSize: 16, fontWeight: 'bold' }}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Text style={styles.subtitle}>Loading medical history...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.scrollContainer}>
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={styles.sectionTitle}>Medical History</Text>
          <Text style={styles.cardText}>
            Review your complete medical history, including appointments, diagnoses, treatments, and uploaded documents.
          </Text>
        </View>

        {/* Appointments Section */}
        <Text style={styles.subtitle}>Appointments</Text>
        {appointments.length > 0 ? (
          <FlatList
            data={appointments}
            renderItem={renderAppointment}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            style={{ marginBottom: 24 }}
          />
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardText}>No appointments found</Text>
          </View>
        )}

        {/* Diagnoses Section */}
        <Text style={styles.subtitle}>Diagnoses</Text>
        {diagnoses.length > 0 ? (
          <FlatList
            data={diagnoses}
            renderItem={renderDiagnosis}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            style={{ marginBottom: 24 }}
          />
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardText}>No diagnoses found</Text>
          </View>
        )}

        {/* Medications Section */}
        <Text style={styles.subtitle}>Medications</Text>
        {treatments.length > 0 ? (
          <FlatList
            data={treatments}
            renderItem={renderTreatment}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            style={{ marginBottom: 24 }}
          />
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardText}>No medications found</Text>
          </View>
        )}

        {/* Uploaded Documents Section */}
        <Text style={styles.subtitle}>Documents</Text>
        <FlatList
          data={uploadedDocuments}
          renderItem={renderDocument}
          keyExtractor={(item, index) => index.toString()}
          scrollEnabled={false}
          style={{ marginBottom: 24 }}
        />

        {/* Upload Documents Section */}
        <Text style={styles.subtitle}>Upload Documents</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add New Documents</Text>
          <Text style={styles.cardText}>
            Upload medical documents, lab reports, or other health-related files.
          </Text>
          
          <TouchableOpacity style={styles.button} onPress={handleFileUpload}>
            <Text style={styles.buttonText}>Choose Files</Text>
          </TouchableOpacity>
        </View>

        {/* Recently Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <>
            <Text style={styles.subtitle}>Recently Uploaded</Text>
            <FlatList
              data={uploadedFiles}
              renderItem={renderUploadedFile}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              style={{ marginBottom: 24 }}
            />
            
            <TouchableOpacity style={[styles.button, { backgroundColor: '#4caf50' }]}>
              <Text style={styles.buttonText}>Save All Documents</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Navigation Button */}
        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
      <Toast />
    </ScrollView>
  );
}
