import DebugSQLite from '@/components/DebugSQLite';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
     <SafeAreaView style={{ flex: 1, marginTop: 50 }}>
      <DebugSQLite />
    </SafeAreaView>
  );
}

