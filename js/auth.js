// Módulo de autenticación sencillo con usuarios y roles.

import {
  loadCurrentUser,
  saveCurrentUser,
  findUserByCredentials,
} from "./storage.js";

/**
 * Devuelve el usuario autenticado actualmente o null.
 */
export function getCurrentUser() {
  return loadCurrentUser();
}

/**
 * Indica si hay usuario autenticado.
 */
export function isAuthenticated() {
  return !!getCurrentUser();
}

/**
 * Inicia sesión verificando usuario y contraseña.
 * @param {string} username
 * @param {string} password
 */
export function login(username, password) {
  const user = findUserByCredentials(username, password);
  if (!user) {
    throw new Error("Usuario o contraseña incorrectos.");
  }

  const sessionUser = {
    username: user.username,
    role: user.role,
  };

  saveCurrentUser(sessionUser);
  return sessionUser;
}

/**
 * Cierra la sesión actual.
 */
export function logout() {
  saveCurrentUser(null);
}

