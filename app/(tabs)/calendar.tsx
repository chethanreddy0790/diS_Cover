import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../store/useStore';
import { useEventStore } from '../../store/useEventStore';
import { format, parseISO, isAfter, isBefore, addDays, startOfDay, isSameDay } from 'date-fns';
import { EventCard } from '../../components/EventCard';
import { router } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { Feather } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function CalendarScreen() {
  const { currentUser } = useStore();
  const { events, deleteEvent } = useEventStore();
  const userId = currentUser?.id || (currentUser as any)?.uid;
  
  // Use YYYY-MM-DD format for react-native-calendars
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleCalendar = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  // Helper to normalize date to YYYY-MM-DD
  const normalizeDate = (dateObj: any): string => {
    try {
      if (!dateObj) return '';
      if (typeof dateObj === 'string') {
        // If it's already YYYY-MM-DD or ISO
        return dateObj.split('T')[0];
      }
      if (dateObj.toDate) {
        return format(dateObj.toDate(), 'yyyy-MM-dd');
      }
      if (dateObj instanceof Date) {
        return format(dateObj, 'yyyy-MM-dd');
      }
      return '';
    } catch (e) {
      console.error('Error normalizing date:', e);
      return '';
    }
  };

  // Generate marked dates for the calendar
  const markedDates = useMemo(() => {
    const marks: any = {};
    const now = new Date();
    
    // Group events by date to check if all events on a date are completed
    const eventsByDate: Record<string, any[]> = {};
    events.forEach(event => {
      const dateStr = normalizeDate(event.date);
      if (dateStr) {
        if (!eventsByDate[dateStr]) eventsByDate[dateStr] = [];
        eventsByDate[dateStr].push(event);
      }
    });

    Object.keys(eventsByDate).forEach(dateStr => {
      const dateEvents = eventsByDate[dateStr];
      const hasUpcoming = dateEvents.some(event => {
        let eventDate: Date;
        if (typeof event.date === 'string') {
          eventDate = parseISO(event.date);
        } else if (event.date?.toDate) {
          eventDate = event.date.toDate();
        } else {
          return false;
        }
        // If event time is provided, we should ideally use it too. 
        // For now, if the date is today or in future, we check time if possible.
        return isAfter(eventDate, now) || isSameDay(eventDate, now);
      });

      marks[dateStr] = {
        marked: true,
        dotColor: hasUpcoming ? '#3B5BFF' : '#94A3B8', // Grey for completed
      };
    });

    // Mark the selected date
    if (marks[selectedDate]) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: '#3B5BFF',
      };
    } else {
      marks[selectedDate] = {
        selected: true,
        selectedColor: '#3B5BFF',
      };
    }

    return marks;
  }, [events, selectedDate]);

  const filteredEvents = useMemo(() => {
    return events
      .filter(e => normalizeDate(e.date) === selectedDate)
      .sort((a, b) => {
        const timeA = a.time || '00:00';
        const timeB = b.time || '00:00';
        return timeA.localeCompare(timeB);
      });
  }, [events, selectedDate]);

  // Upcoming events within next 3 days
  const upcomingEvents = useMemo(() => {
    const now = startOfDay(new Date());
    const threeDaysLater = addDays(now, 3); // This gives a 3-day window (Today, Tomorrow, Day after)

    return events.filter(event => {
      try {
        let eventDate: Date;
        if (event.date && typeof event.date === 'string') {
          eventDate = parseISO(event.date);
        } else if (event.date?.toDate) {
          eventDate = (event.date as any).toDate();
        } else {
          return false;
        }
        
        const eventDay = startOfDay(eventDate);
        
        // Include events from today up to 2 days after today (total 3 days: today, tomorrow, day after)
        // Strictly within the next 3 days window
        const isWithinWindow = (isSameDay(eventDay, now) || isAfter(eventDay, now)) && isBefore(eventDay, addDays(now, 3));
        
        // Exclude expired events (if today, check if time has passed - for simplicity we just check date here, 
        // but user asked to exclude expired/completed events)
        const isCompleted = isBefore(eventDate, new Date());
        
        return isWithinWindow && !isCompleted;
      } catch {
        return false;
      }
    }).sort((a, b) => {
      try {
        const dateA = typeof a.date === 'string' ? parseISO(a.date) : a.date?.toDate ? a.date.toDate() : new Date(0);
        const dateB = typeof b.date === 'string' ? parseISO(b.date) : b.date?.toDate ? b.date.toDate() : new Date(0);
        return dateA.getTime() - dateB.getTime();
      } catch {
        return 0;
      }
    });
  }, [events]);

  const handleEditEvent = (id: string) => {
    router.push(`/create-event?id=${id}`);
  };

  const handleDeleteEvent = (id: string) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to remove this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteEvent(id).catch((err) => {
              Alert.alert('Error', 'Could not delete event. Please try again.');
              console.error('[Calendar] deleteEvent failed:', err?.message);
            });
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
        <TouchableOpacity style={styles.expandButton} onPress={toggleCalendar}>
          <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#3B5BFF" />
          <Text style={styles.expandText}>{isExpanded ? 'Collapse' : 'Expand'}</Text>
        </TouchableOpacity>
      </View>
      
      {isExpanded && (
        <View style={styles.calendarWrapper}>
          <Calendar
            // Initial date
            current={todayStr}
            // Handler which gets executed on day press
            onDayPress={day => {
              setSelectedDate(day.dateString);
              // Auto-collapse after selection as requested
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setIsExpanded(false);
            }}
            // Month format in calendar title
            monthFormat={'MMMM yyyy'}
            // Hide arrows when reaching min/max allowed date
            hideExtraDays={true}
            // Enable horizontal scrolling
            enableSwipeMonths={true}
            // Custom theme
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#b6c1cd',
              selectedDayBackgroundColor: '#3B5BFF',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#3B5BFF',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: '#3B5BFF',
              selectedDotColor: '#ffffff',
              arrowColor: '#3B5BFF',
              monthTextColor: '#111',
              indicatorColor: '#3B5BFF',
              textDayFontWeight: '600',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '500',
              textDayFontSize: 14,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 12
            }}
            markedDates={markedDates}
          />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.timelineContainer} showsVerticalScrollIndicator={false}>
        
        {/* Selected Date Header */}
        <View style={styles.timelineHeader}>
           <Feather name="calendar" size={20} color="#111" />
           <Text style={styles.timelineTitle}>
             {format(parseISO(selectedDate), 'MMMM d, yyyy')}
           </Text>
        </View>
        
        {/* Selected Date Events */}
        {filteredEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="info" size={40} color="#E2E8F0" />
            <Text style={styles.emptyText}>No events scheduled for this day.</Text>
          </View>
        ) : (
          filteredEvents.map(event => (
            <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                category={event.category}
                date={`${normalizeDate(event.date)} • ${event.time}`}
                location={event.venue}
                image={event.image}
                tags={event.tags}
                likes={event.likes || 0}
                comments={event.comments?.length || 0}
                onPress={() => router.push(`/event-details/${event.id}`)}
                isOwner={event.createdBy?.id === userId}
                onEdit={() => handleEditEvent(event.id)}
                onDelete={() => handleDeleteEvent(event.id)}
              />
          ))
        )}

        {/* Divider */}
        <View style={styles.sectionDivider} />

        {/* Upcoming Events Within 3 Days */}
        <View style={styles.upcomingSection}>
          <View style={styles.timelineHeader}>
            <Feather name="zap" size={20} color="#3B5BFF" />
            <Text style={styles.timelineTitle}>Upcoming (Next 3 Days)</Text>
          </View>
          {upcomingEvents.length === 0 ? (
            <View style={styles.upcomingEmpty}>
              <Text style={styles.upcomingEmptyText}>No upcoming events in the next 3 days</Text>
            </View>
          ) : (
            upcomingEvents
              .filter(ue => !filteredEvents.some(fe => fe.id === ue.id)) // Prevent duplicates
              .map(event => (
                <EventCard
                  key={`upcoming-${event.id}`}
                  id={event.id}
                  title={event.title}
                  category={event.category}
                  date={`${normalizeDate(event.date)} • ${event.time}`}
                  location={event.venue}
                  image={event.image}
                  tags={event.tags}
                  likes={event.likes || 0}
                  comments={event.comments?.length || 0}
                  onPress={() => router.push(`/event-details/${event.id}`)}
                  isOwner={event.createdBy?.id === userId}
                  onEdit={() => handleEditEvent(event.id)}
                  onDelete={() => handleDeleteEvent(event.id)}
                />
              ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    letterSpacing: -0.5,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(59, 91, 255, 0.1)',
    borderRadius: 12,
  },
  expandText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B5BFF',
  },
  calendarWrapper: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 4,
    marginBottom: 24,
  },
  timelineContainer: {
    paddingHorizontal: 24,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F0F2F5',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    marginTop: 12,
  },
  upcomingSection: {
    marginBottom: 24,
  },
  upcomingEmpty: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F2F5',
    paddingVertical: 32,
    alignItems: 'center',
  },
  upcomingEmptyText: {
    color: '#999',
    fontSize: 14,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E8EAED',
    marginVertical: 20,
  },
});

export default CalendarScreen;
