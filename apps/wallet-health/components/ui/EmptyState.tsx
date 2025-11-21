/**
 * Empty State Component
 */

'use client';

import React from 'react';
import { View, Text } from 'react-native';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
}) => {
  return (
    <View className="flex flex-col items-center justify-center p-8 text-center">
      {icon && (
        <View className="mb-4 text-gray-400">
          {icon}
        </View>
      )}
      <Text className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </Text>
      {description && (
        <Text className="text-gray-600 mb-4 max-w-md">
          {description}
        </Text>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {action.label}
        </button>
      )}
    </View>
  );
};

