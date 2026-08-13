import { View } from 'react-native';

export function EstimateNoteIcon({ color = '#9A6C00' }: { color?: string }) {
  return (
    <View style={{ width: 15, height: 16, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 11, height: 13, paddingHorizontal: 2, paddingTop: 2.5, gap: 2, borderWidth: 1.2, borderColor: color, borderRadius: 1.5 }}>
        <View style={{ width: 6, height: 1.1, borderRadius: 1, backgroundColor: color }} />
        <View style={{ width: 6, height: 1.1, borderRadius: 1, backgroundColor: color }} />
        <View style={{ width: 4.5, height: 1.1, borderRadius: 1, backgroundColor: color }} />
      </View>
    </View>
  );
}
