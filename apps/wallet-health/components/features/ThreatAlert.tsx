/**
 * Threat Alert Component
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';

interface ThreatAlertProps {
  threat: {
    type: string;
    severity: string;
    message: string;
  };
  onDismiss?: () => void;
}

export const ThreatAlert: React.FC<ThreatAlertProps> = ({ threat, onDismiss }) => {
  const getSeverityColor = () => {
    switch (threat.severity) {
      case 'critical': return 'bg-red-100 dark:bg-red-900 border-red-500';
      case 'high': return 'bg-orange-100 dark:bg-orange-900 border-orange-500';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900 border-yellow-500';
      default: return 'bg-blue-100 dark:bg-blue-900 border-blue-500';
    }
  };

  const getSeverityIcon = () => {
    switch (threat.severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      default: return 'ℹ️';
    }
  };

  return (
    <View className={`border-l-4 rounded-lg p-4 mb-3 ${getSeverityColor()}`}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-lg mr-2">{getSeverityIcon()}</Text>
            <Text className="font-semibold text-gray-900 dark:text-white">
              {threat.type}
            </Text>
          </View>
          <Text className="text-sm text-gray-700 dark:text-gray-300">
            {threat.message}
          </Text>
        </View>
        {onDismiss && (
          <Pressable onPress={onDismiss} className="ml-2">
            <Text className="text-gray-500 text-lg">✕</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};


