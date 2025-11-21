/**
 * Spinner Component
 */

'use client';

import React from 'react';
import { View, ActivityIndicator } from 'react-native';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = '#3B82F6',
}) => {
  const getSize = () => {
    switch (size) {
      case 'sm':
        return 'small';
      case 'lg':
        return 'large';
      default:
        return 'small';
    }
  };

  return (
    <View className="flex items-center justify-center">
      <ActivityIndicator size={getSize()} color={color} />
    </View>
  );
};

