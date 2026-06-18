import { router } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import GigCard from '../components/gig-space/GigCard';
import { useGigStore } from '../store/useGigStore';
import { useStore } from '../store/useStore';

export default function GigsListScreen() {
  const publishedGigs = useGigStore((state) => state.publishedGigs);
  const toggleSaveGig = useStore((state) => state.toggleSaveGig);
  const currentUser = useStore((state) => state.currentUser);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Gigs</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {publishedGigs.map((gig) => (
          <GigCard
            key={gig.id}
            company={gig.company}
            companyMark={gig.companyMark}
            location={gig.location}
            priceLabel={gig.priceLabel}
            rating={gig.rating}
            title={gig.title}
            image={gig.image}
            isSaved={currentUser?.savedGigs?.includes(gig.id)}
            onSavePress={() => toggleSaveGig(gig.id)}
            onContactPress={() =>
              router.push({
                pathname: '/contact-seller',
                params: {
                  gigId: gig.id,
                  gigTitle: gig.title,
                  sellerName: gig.sellerName,
                  sellerRole: gig.sellerRole,
                  sellerRating: gig.sellerRating,
                  sellerId: gig.createdBy?.id,
                },
              })
            }
            onDetailsPress={() => router.push(`/gig-details/${gig.id}`)}
          />
        ))}
        
        {publishedGigs.length === 0 && (
          <View style={styles.emptyContainer}>
            <Feather name="briefcase" size={48} color="#C8CCDE" />
            <Text style={styles.emptyText}>No gigs available yet.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F7FB' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 16, 
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7F9FC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: 24, gap: 20 },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7E839A',
    fontWeight: '500',
  },
});
