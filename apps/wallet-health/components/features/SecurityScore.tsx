/**
 * Security Score Component
 */

import React from 'react';
import { View, Text } from 'react-native';

interface SecurityScoreProps {
  score: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export const SecurityScore: React.FC<SecurityScoreProps> = ({ score, riskLevel }) => {
  const getRiskColor = () => {
    switch (riskLevel) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTextColor = () => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <View className="bg-white dark:bg-gray-800 rounded-lg p-6 items-center">
      <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        Security Score
      </Text>
      <Text className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
        {score}
      </Text>
      <View className={`px-4 py-1 rounded-full ${getRiskColor()}`}>
        <Text className="text-white font-medium text-sm">
          {riskLevel.toUpperCase()} RISK
        </Text>
      </View>
      <View className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-4">
        <View 
          className={`h-2 rounded-full ${getRiskColor()}`}
          style={{ width: `${score}%` }}
        />
      </View>
    </View>
  );
};


