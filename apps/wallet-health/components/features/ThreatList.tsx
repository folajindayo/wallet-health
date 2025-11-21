/**
 * Threat List Component
 */

import React from 'react';
import { View, Text, ScrollView } from 'react-native';

interface Threat {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp?: string;
}

interface ThreatListProps {
  threats: Threat[];
}

export const ThreatList: React.FC<ThreatListProps> = ({ threats }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700';
      case 'high': return 'bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-700';
      case 'critical': return 'bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700';
      default: return 'bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700';
    }
  };

  if (threats.length === 0) {
    return (
      <View className="bg-white dark:bg-gray-800 rounded-lg p-6 items-center">
        <Text className="text-green-600 dark:text-green-400 font-medium">
          ✓ No threats detected
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="bg-white dark:bg-gray-800 rounded-lg p-4">
      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Detected Threats ({threats.length})
      </Text>
      {threats.map((threat, index) => (
        <View
          key={index}
          className={`mb-3 p-3 rounded-lg border ${getSeverityColor(threat.severity)}`}
        >
          <View className="flex-row justify-between items-start mb-1">
            <Text className="font-medium text-gray-900 dark:text-white">
              {threat.type}
            </Text>
            <Text className="text-xs text-gray-600 dark:text-gray-400">
              {threat.severity.toUpperCase()}
            </Text>
          </View>
          <Text className="text-sm text-gray-700 dark:text-gray-300">
            {threat.description}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

