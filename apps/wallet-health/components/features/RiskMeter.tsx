/**
 * Risk Meter Component
 */

import React from 'react';
import { View, Text } from 'react-native';

interface RiskMeterProps {
  score: number;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ score }) => {
  const getColor = () => {
    if (score < 25) return 'bg-green-500';
    if (score < 50) return 'bg-yellow-500';
    if (score < 75) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getLabel = () => {
    if (score < 25) return 'LOW';
    if (score < 50) return 'MEDIUM';
    if (score < 75) return 'HIGH';
    return 'CRITICAL';
  };

  return (
    <View className="p-4">
      <View className="flex-row justify-between mb-2">
        <Text className="text-gray-600 dark:text-gray-400">Risk Level</Text>
        <Text className="font-bold text-gray-900 dark:text-white">{getLabel()}</Text>
      </View>
      <View className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <View 
          className={`h-full ${getColor()} transition-all duration-300`}
          style={{ width: `${score}%` }}
        />
      </View>
      <Text className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">
        {score}/100
      </Text>
    </View>
  );
};


