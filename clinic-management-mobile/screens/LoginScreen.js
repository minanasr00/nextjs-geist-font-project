import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signIn } from '../services/firebase/auth';
import { AuthContext } from '../contexts/AuthContext';
import Toast from 'react-native-toast-message';
import styles from '../styles/common';

const loginSchema = z.object({
  email: z.string().email("Email invalid").min(1, 'Email is required'),
  password: z.string().min(1, "Password required")
});

export default function LoginScreen({ navigation }) {
  const { role, loading } = useContext(AuthContext);
  const [submitMessage, setSubmitMessage] = useState();

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onChange"
  });

  const onSubmit = async (data) => {
    try {
      setSubmitMessage(null);
      await signIn(data.email, data.password);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'User logged in successfully',
        position: 'top'
      });
      
      if (loading && !role) {
        setSubmitMessage("Loading...");
      } else if (role === "patient" || role === "doctor" || role === "admin") {
        navigation.navigate('Home');
      }
    } catch (error) {
      console.log(error);
      const friendlyError = getFriendlyError(error.code);
      setSubmitMessage(friendlyError);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: friendlyError,
        position: 'top'
      });
    }
  };

  const getFriendlyError = (code) => {
    switch(code) {
      case 'auth/invalid-email':
        return "Please enter a valid email address";
      case 'auth/user-not-found':
        return "No account found with this email";
      case 'auth/wrong-password':
        return "Incorrect password";
      case 'auth/invalid-credential':
        return "Invalid login credentials";
      case 'auth/user-disabled':
        return "This account has been disabled";
      case 'auth/too-many-requests':
        return "Too many attempts. Try again later";
      case 'auth/network-request-failed':
        return "Network error. Check your connection";
      case 'auth/internal-error':
        return "Server error. Please try again";
      case 'auth/popup-closed-by-user':
        return "Login window was closed";
      case 'auth/cancelled-popup-request':
        return "Login cancelled";
      default:
        return "Login failed. Please try again";
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ImageBackground
        source={{ uri: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.centerContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Sign In</Text>
            
            <Text style={styles.label}>Your email</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="name@gmail.com"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

            <Text style={styles.label}>Your password</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  secureTextEntry
                />
              )}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

            {submitMessage && <Text style={styles.errorText}>{submitMessage}</Text>}

            <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
      <Toast />
    </KeyboardAvoidingView>
  );
}
