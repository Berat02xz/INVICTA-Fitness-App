/**
 * DrumPicker — cross-platform horizontal scroll picker.
 * Works on iOS, Android, and Web. No external picker library needed.
 *
 * Usage:
 *   <DrumPicker
 *     data={items}
 *     itemWidth={65}
 *     defaultIndex={0}
 *     height={70}
 *     onChange={(index) => setSelectedIndex(index)}
 *     renderItem={(item, index) => <Text>{item}</Text>}
 *   />
 *
 * For unit-switch remount, pass `key={unit}` so defaultIndex resets cleanly.
 */

import React, { useRef, useCallback, useState, useEffect } from "react";
import { ScrollView, View } from "react-native";

interface DrumPickerProps<T> {
  data: T[];
  itemWidth: number;
  defaultIndex?: number;
  onChange: (index: number) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  height?: number;
}

export function DrumPicker<T>({
  data,
  itemWidth,
  defaultIndex = 0,
  onChange,
  renderItem,
  height = 70,
}: DrumPickerProps<T>) {
  const scrollRef = useRef<ScrollView>(null);

  // Tracks the true current index — updated by scroll, NOT synced back from parent prop.
  // This avoids feedback loops when parent updates state from onChange.
  const currentIndexRef = useRef(defaultIndex);

  // Container width needed to calculate centering padding.
  const [containerWidth, setContainerWidth] = useState(0);

  // Horizontal padding so the first/last items can be centered in the viewport.
  // When containerWidth is 0 we skip (no padding) — effect below scrolls after layout.
  const paddingH = containerWidth > 0 ? (containerWidth - itemWidth) / 2 : 0;

  // Scroll to default position once the container dimensions are known, and whenever
  // the container is resized (e.g. orientation change).
  useEffect(() => {
    if (containerWidth > 0) {
      scrollRef.current?.scrollTo({
        x: currentIndexRef.current * itemWidth,
        animated: false,
      });
    }
  }, [containerWidth, itemWidth]);

  const handleLayout = useCallback(
    (e: { nativeEvent: { layout: { width: number } } }) => {
      const w = e.nativeEvent.layout.width;
      if (w !== containerWidth) setContainerWidth(w);
    },
    [containerWidth]
  );

  const handleScroll = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      const x = e.nativeEvent.contentOffset.x;
      const raw = Math.round(x / itemWidth);
      const index = Math.max(0, Math.min(raw, data.length - 1));
      if (index !== currentIndexRef.current) {
        currentIndexRef.current = index;
        onChange(index);
      }
    },
    [itemWidth, data.length, onChange]
  );

  return (
    <View
      style={{ width: "100%", height }}
      onLayout={handleLayout}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        style={{ flex: 1 }}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemWidth}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={
          paddingH > 0 ? { paddingHorizontal: paddingH } : undefined
        }
      >
        {data.map((item, i) => (
          <React.Fragment key={i}>{renderItem(item, i)}</React.Fragment>
        ))}
      </ScrollView>
    </View>
  );
}
