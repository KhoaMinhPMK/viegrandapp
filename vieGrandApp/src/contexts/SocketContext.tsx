import React, { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getUserData, getNotifications, markNotificationsRead, deleteNotifications, debugPhoneCheck } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import config from '../config/env';
 