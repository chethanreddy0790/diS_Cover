import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

type ConversationMessageBubbleProps = {
  text: string;
  variant: 'incoming' | 'outgoing';
  style?: StyleProp<ViewStyle>;
};

export default function ConversationMessageBubble({
  text,
  variant,
  style,
}: ConversationMessageBubbleProps) {
  const isOutgoing = variant === 'outgoing';

  return (
    <View
      style={[
        styles.bubble,
        isOutgoing ? styles.outgoingBubble : styles.incomingBubble,
        style,
      ]}>
      <Text style={[styles.text, isOutgoing && styles.outgoingText]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '85%',
  },
  incomingBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  outgoingBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#3B5BFF',
    borderBottomRightRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: '#111',
  },
  outgoingText: {
    color: '#FFFFFF',
  },
});
