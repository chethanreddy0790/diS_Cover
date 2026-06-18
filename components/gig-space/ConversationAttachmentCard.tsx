import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

type ConversationAttachmentCardProps = {
  fileName: string;
  sizeLabel: string;
  onDownloadPress?: () => void;
};

export default function ConversationAttachmentCard({
  fileName,
  sizeLabel,
  onDownloadPress,
}: ConversationAttachmentCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.preview}>
        <Feather name="shield" size={92} color="#4EB7F6" />
      </View>

      <Text style={styles.fileName}>{fileName}</Text>

      <View style={styles.footerRow}>
        <Text style={styles.sizeLabel}>{sizeLabel}</Text>

        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.82}
          onPress={onDownloadPress}
          style={styles.downloadButton}>
          <Feather name="download" size={17} color="#3553EC" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'flex-end',
    width: 244,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    shadowColor: '#D6DDEA',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 6,
  },
  preview: {
    height: 176,
    borderRadius: 28,
    backgroundColor: '#07070A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '700',
    color: '#151515',
  },
  footerRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sizeLabel: {
    fontSize: 13,
    color: '#686F81',
  },
  downloadButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
