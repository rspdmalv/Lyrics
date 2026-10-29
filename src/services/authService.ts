/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { addActivityLog } from './firestoreService';
import { UserAccount } from '../types';

export function getFriendlyAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Este correo electrónico ya está registrado. Inicia sesión o recupera tu contraseña.';
    case 'auth/invalid-email':
      return 'El formato del correo electrónico no es válido.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Correo o contraseña incorrectos. Verifica tus datos.';
    case 'auth/operation-not-allowed':
      return 'El proveedor de Correo/Contraseña aún no está habilitado en la consola de Firebase. Debes activarlo en Firebase Console > Authentication > Sign-in method.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Por seguridad, espera unos minutos antes de volver a intentar.';
    case 'auth/network-request-failed':
      return 'Error de conexión. Comprueba tu conexión a Internet.';
    default:
      return `Error de autenticación: ${errorCode}`;
  }
}

/**
 * Registers a new user with Email and Password, sends verification email, creates user document in Firestore and logs the event
 */
export async function registerUser(email: string, password: string, displayName?: string): Promise<{ user: User; verificationSent: boolean }> {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const user = credential.user;

  const resolvedName = (displayName || '').trim() || email.split('@')[0];

  // Update profile display name in Firebase Auth
  try {
    await updateProfile(user, { displayName: resolvedName });
  } catch (e) {
    console.warn('Error al actualizar nombre en perfil:', e);
  }

  // Create initial user document in Firestore
  try {
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      id: user.uid,
      email: user.email || email,
      displayName: resolvedName,
      emailVerified: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('No se pudo crear el documento de usuario en Firestore:', e);
  }

  // Send verification email
  let verificationSent = false;
  try {
    await sendEmailVerification(user);
    verificationSent = true;
  } catch (e) {
    console.warn('Error al enviar correo de verificación:', e);
  }

  // Log activity
  await addActivityLog(
    user.uid,
    user.email || email,
    'register',
    `Cuenta registrada con correo ${email}. ${verificationSent ? 'Correo de confirmación enviado exitosamente.' : 'No se pudo enviar correo de confirmación de forma automática.'}`
  );

  return { user, verificationSent };
}

/**
 * Logs in with Email and Password, updates last login timestamp and logs the activity
 */
export async function loginUser(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const user = credential.user;

  // Update last login in user doc
  try {
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(
      userDocRef,
      {
        lastLoginAt: new Date().toISOString(),
        emailVerified: user.emailVerified,
      },
      { merge: true }
    );
  } catch (e) {
    console.warn('Error actualizando timestamp de inicio de sesión:', e);
  }

  await addActivityLog(
    user.uid,
    user.email || email,
    'login',
    `Inicio de sesión exitoso. Verificación de correo: ${user.emailVerified ? 'Confirmado' : 'Pendiente'}`
  );

  return user;
}

/**
 * Re-sends the verification email to the current authenticated user
 */
export async function resendVerification(): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('No hay ninguna sesión activa para enviar el correo.');
  }
  await sendEmailVerification(auth.currentUser);
  await addActivityLog(
    auth.currentUser.uid,
    auth.currentUser.email || '',
    'email_verified',
    'Reenvío de enlace de confirmación de cuenta solicitado'
  );
}

/**
 * Reloads the current user from Firebase Auth to check if they have confirmed their email
 */
export async function refreshEmailVerification(): Promise<boolean> {
  if (!auth.currentUser) return false;
  await auth.currentUser.reload();
  const isVerified = auth.currentUser.emailVerified;

  if (isVerified) {
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userDocRef, { emailVerified: true }, { merge: true });
      await addActivityLog(
        auth.currentUser.uid,
        auth.currentUser.email || '',
        'email_verified',
        'Correo electrónico verificado exitosamente'
      );
    } catch (e) {
      console.warn('Error al actualizar estado verificado en Firestore:', e);
    }
  }

  return isVerified;
}

/**
 * Sends a password reset email
 */
export async function resetUserPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Signs out the current user
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}
