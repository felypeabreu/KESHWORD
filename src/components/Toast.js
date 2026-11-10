import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { colors, radius } from '../theme';

const ToastContext = createContext({ show: () => {} });

// Mensagem rápida de feedback (sucesso/erro) exibida no topo da tela.
export function ToastProvider({ children }) {
  const [message, setMessage] = useState('');
  const [type, setType] = useState('success');
  const opacity = useRef(new Animated.Value(0)).current;

  const show = useCallback((msg, kind = 'success') => {
    setMessage(msg);
    setType(kind);
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [opacity]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.toast,
          { opacity, backgroundColor: type === 'error' ? colors.error : colors.success },
        ]}
      >
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    padding: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    zIndex: 99,
  },
  text: { color: '#fff', fontWeight: '600', textAlign: 'center' },
});
