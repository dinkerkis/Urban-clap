import { type ReactNode, useState } from 'react';
import { View } from 'react-native';

const DOT_SIZE = 1.4;
const DOT_GAP = 1.7;
const DOT_STYLE = {
  width: DOT_SIZE,
  height: DOT_SIZE,
  borderRadius: DOT_SIZE / 2,
  backgroundColor: '#C5C1C6',
} as const;

export function DottedUnderline({
  children,
  fullWidth = false,
  lineMarginTop = 2,
  dotColor = '#C5C1C6',
}: {
  children: ReactNode;
  fullWidth?: boolean;
  lineMarginTop?: number;
  dotColor?: string;
}) {
  const [count, setCount] = useState(0);

  return (
    <View
      style={{ alignSelf: fullWidth ? 'stretch' : 'flex-start' }}
      onLayout={(event) => {
        const next = Math.max(0, Math.floor((event.nativeEvent.layout.width + DOT_GAP) / (DOT_SIZE + DOT_GAP)));
        setCount((current) => (current === next ? current : next));
      }}
    >
      {children}
      <View style={{ height: DOT_SIZE, marginTop: lineMarginTop, flexDirection: 'row', gap: DOT_GAP, overflow: 'hidden' }}>
        {Array.from({ length: count }, (_, index) => (
          <View key={index} style={[DOT_STYLE, { backgroundColor: dotColor }]} />
        ))}
      </View>
    </View>
  );
}
