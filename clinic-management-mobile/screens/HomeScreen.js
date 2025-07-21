import React, { useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Image
} from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import styles from '../styles/common';

const services = [
  {
    title: "General Consultation",
    description: "Comprehensive health checkups and consultations"
  },
  {
    title: "Cardiology",
    description: "Heart health and cardiovascular care"
  },
  {
    title: "Pharmacy",
    description: "Prescription medications and health products"
  },
  {
    title: "First Aid",
    description: "Emergency medical care and treatment"
  }
];

export default function HomeScreen({ navigation }) {
  const { user, role } = useContext(AuthContext);

  return (
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <ImageBackground
        source={{ uri: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }}
        style={styles.heroSection}
        resizeMode="cover"
      >
        <View style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>Your Health, Our Priority</Text>
          <Text style={styles.heroSubtitle}>
            Welcome to Dr. Bennett's Clinic, where we provide personalized healthcare. 
            Book your appointment and take the first step towards a healthier you.
          </Text>
        </View>
      </ImageBackground>

      <View style={styles.scrollContainer}>
        {/* Services Section */}
        <Text style={styles.sectionTitle}>Our Services</Text>
        {services.map((service, index) => (
          <View key={index} style={styles.serviceCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: '#4DB6AC',
                marginRight: 12
              }} />
              <Text style={styles.serviceTitle}>{service.title}</Text>
            </View>
            <Text style={styles.cardText}>{service.description}</Text>
          </View>
        ))}

        {/* Doctor Section */}
        <Text style={styles.sectionTitle}>Meet Dr. Bennett</Text>
        <View style={styles.card}>
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1' }}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                marginBottom: 12
              }}
            />
            <Text style={styles.cardTitle}>Dr. Bennett</Text>
            <Text style={{ color: '#4DB6AC', fontWeight: '500', fontSize: 16 }}>
              General Practitioner
            </Text>
          </View>
          <Text style={styles.cardText}>
            Dr. Bennett is a board-certified orthopedic surgeon specializing in sports medicine 
            and joint replacement. With over 15 years of experience, Dr. Bennett is dedicated 
            to providing compassionate care and helping patients regain their mobility and live 
            pain-free. Welcome to our practice, where your health and well-being are our top priority.
          </Text>
        </View>

        {/* Navigation Buttons */}
        <View style={{ marginTop: 24, marginBottom: 40 }}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate('Appointment')}
          >
            <Text style={styles.buttonText}>Book Appointment</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => navigation.navigate('MedicalHistory')}
          >
            <Text style={styles.secondaryButtonText}>Medical History</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
