import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signUp } from '../services/firebase/auth';
import Toast from 'react-native-toast-message';
import styles from '../styles/common';

const signUpSchema = z.object({
  email: z.string().email("Invalid Email").min(1, "Email is required"),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: z.string().min(1, "Confirm password is required"),
  name: z.string().max(20, "Name must be less than 20 characters").min(3, "Name must be at least 3 characters"),
  phone: z.string().min(1, "Phone is required").regex(/^(?:\+20|0)?1[0125][-\s]?[0-9]{4}[-\s]?[0-9]{4}$/, "Phone number must be 10 digits"),
  dob: z.string().min(1, "Date of birth is required").refine((val) => {
    const regex = /^\d{2}-\d{2}-\d{4}$/;
    return regex.test(val);
  }, {
    message: "Invalid date format. Use DD-MM-YYYY"
  }),
  gender: z.enum(["male", "female"], {
    required_error: "Gender selection is required",
    invalid_type_error: "Please select a valid gender option"
  })
}).refine((data) => {
  return data.password === data.confirmPassword;
}, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

export default function RegisterScreen({ navigation }) {
  const [submitMessage, setSubmitMessage] = useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(signUpSchema),
    mode: "onChange"
  });

  const onSubmit = async (data) => {
    try {
      setSubmitMessage(null);
      const res = await signUp(data.email, data.password, data);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Registration successful!',
        position: 'top'
      });
      console.log(res);
      navigation.navigate('Login');
    } catch (error) {
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
      case 'auth/email-already-in-use':
        return "Email already exists";
      case 'auth/weak-password':
        return "Password should be at least 6 characters";
      case 'auth/invalid-email':
        return "Invalid email address";
      default:
        return "Signup failed. Please try again";
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
        <ScrollView contentContainerStyle={styles.centerContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Sign Up</Text>
            
            <Text style={styles.label}>Name</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Your Name"
                  placeholderTextColor="#999"
                />
              )}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

            <Text style={styles.label}>Email</Text>
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

            <Text style={styles.label}>Password</Text>
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

            <Text style={styles.label}>Confirm Password</Text>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Confirm Password"
                  placeholderTextColor="#999"
                  secureTextEntry
                />
              )}
            />
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}

            <Text style={styles.label}>Phone</Text>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Phone Number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                />
              )}
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}

            <Text style={styles.label}>Date of Birth (DD-MM-YYYY)</Text>
            <Controller
              control={control}
              name="dob"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="DD-MM-YYYY"
                  placeholderTextColor="#999"
                />
              )}
            />
            {errors.dob && <Text style={styles.errorText}>{errors.dob.message}</Text>}

            <Text style={styles.label}>Gender</Text>
            <Controller
              control={control}
              name="gender"
              render={({ field: { onChange, value } }) => (
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  <TouchableOpacity
                    style={[
                      styles.paymentOption,
                      value === 'male' && styles.paymentOptionSelected
                    ]}
                    onPress={() => onChange('male')}
                  >
                    <Text style={[
                      styles.paymentOptionText,
                      value === 'male' && styles.paymentOptionTextSelected
                    ]}>
                      Male
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.paymentOption,
                      value === 'female' && styles.paymentOptionSelected
                    ]}
                    onPress={() => onChange('female')}
                  >
                    <Text style={[
                      styles.paymentOptionText,
                      value === 'female' && styles.paymentOptionTextSelected
                    ]}>
                      Female
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.gender && <Text style={styles.errorText}>{errors.gender.message}</Text>}

            {submitMessage && <Text style={styles.errorText}>{submitMessage}</Text>}

            <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>Have an account? Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
      <Toast />
    </KeyboardAvoidingView>
  );
}
