import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { ChevronRight, ChevronLeft, EyeOff, RotateCcw } from "lucide-react-native";

export interface HotspotItem {
  id: string;
  stepIndex: number;
  title: string;
  description?: string;
  xPercent: number;     // 0 to 100
  yPercent: number;     // 0 to 100
  widthPercent: number; // 0 to 100
  heightPercent: number;// 0 to 100
  zoomScale?: number;   // e.g. 2.0 to 3.5
  isOccluded?: boolean; // For flashcards: hides answer under mask
}

export interface InteractiveHotspotViewerProps {
  imageUrl: string;
  hotspots?: HotspotItem[];
  isFlashcardMode?: boolean;
}

const VIEWER_HEIGHT = 280;

export function InteractiveHotspotViewer({
  imageUrl,
  hotspots = [],
  isFlashcardMode = false,
}: InteractiveHotspotViewerProps) {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  // Reanimated shared values for zoom & pan
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const focusOnHotspot = (hs: HotspotItem) => {
    setActiveStep(hs.stepIndex);
    const targetScale = hs.zoomScale || 2.5;

    // Calculate translation offset so hotspot is centered
    const centerX = hs.xPercent + hs.widthPercent / 2;
    const centerY = hs.yPercent + hs.heightPercent / 2;

    const deltaX = (50 - centerX) * 2;
    const deltaY = (50 - centerY) * 2;

    scale.value = withTiming(targetScale, { duration: 400, easing: Easing.out(Easing.cubic) });
    translateX.value = withTiming(deltaX, { duration: 400, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(deltaY, { duration: 400, easing: Easing.out(Easing.cubic) });
  };

  const resetView = () => {
    setActiveStep(null);
    scale.value = withTiming(1, { duration: 350 });
    translateX.value = withTiming(0, { duration: 350 });
    translateY.value = withTiming(0, { duration: 350 });
  };

  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const currentHotspot = hotspots.find((h) => h.stepIndex === activeStep);

  const nextStep = () => {
    if (hotspots.length === 0) return;
    if (activeStep === null) {
      focusOnHotspot(hotspots[0]);
    } else {
      const nextIdx = (activeStep % hotspots.length) + 1;
      const nextHs = hotspots.find((h) => h.stepIndex === nextIdx);
      if (nextHs) focusOnHotspot(nextHs);
    }
  };

  const prevStep = () => {
    if (hotspots.length === 0) return;
    if (activeStep === null || activeStep === 1) {
      focusOnHotspot(hotspots[hotspots.length - 1]);
    } else {
      const prevHs = hotspots.find((h) => h.stepIndex === activeStep - 1);
      if (prevHs) focusOnHotspot(prevHs);
    }
  };

  return (
    <View style={styles.container}>
      {/* Viewport for Diagram & Zoom */}
      <View style={styles.viewport}>
        <Animated.View style={[styles.imageWrapper, animatedImageStyle]}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="contain"
          />

          {/* Render Hotspot Overlays */}
          {hotspots.map((hs) => {
            const isActive = hs.stepIndex === activeStep;
            const isRevealed = revealedIds[hs.id];

            return (
              <TouchableOpacity
                key={hs.id}
                onPress={() => {
                  focusOnHotspot(hs);
                  if (hs.isOccluded) toggleReveal(hs.id);
                }}
                activeOpacity={0.8}
                style={[
                  styles.hotspotBox,
                  {
                    left: `${hs.xPercent}%`,
                    top: `${hs.yPercent}%`,
                    width: `${hs.widthPercent}%`,
                    height: `${hs.heightPercent}%`,
                  },
                  isActive && styles.activeHotspotBox,
                  hs.isOccluded && !isRevealed && styles.occludedBox,
                ]}
              >
                {/* Number Badge */}
                <View style={[styles.badge, isActive && styles.activeBadge]}>
                  <Text style={styles.badgeText}>{hs.stepIndex}</Text>
                </View>

                {/* Occlusion Mask for Flashcards */}
                {hs.isOccluded && !isRevealed && (
                  <View style={styles.occlusionMask}>
                    <EyeOff size={10} color="#78350F" />
                    <Text style={styles.tapToRevealText}>TAP</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* Reset Zoom Button */}
        {activeStep !== null && (
          <TouchableOpacity
            onPress={resetView}
            style={styles.resetButton}
            accessibilityLabel="Reset Zoom View"
          >
            <RotateCcw size={14} color="#FFFFFF" />
            <Text style={styles.resetText}>Overview</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Guided Tour Bottom Bar */}
      {hotspots.length > 0 && (
        <View style={styles.toolbar}>
          <TouchableOpacity
            onPress={prevStep}
            style={styles.navButton}
            accessibilityLabel="Previous Point"
          >
            <ChevronLeft size={16} color="#4B5563" />
          </TouchableOpacity>

          <View style={styles.infoCenter}>
            {currentHotspot ? (
              <View style={styles.labelContainer}>
                <Text style={styles.stepTitle}>
                  Step {currentHotspot.stepIndex}: {currentHotspot.isOccluded && !revealedIds[currentHotspot.id] ? "[Hidden Label]" : currentHotspot.title}
                </Text>
                {currentHotspot.description && (
                  <Text style={styles.stepDesc} numberOfLines={1}>
                    {currentHotspot.description}
                  </Text>
                )}
              </View>
            ) : (
              <Text style={styles.hintText}>
                Tap any point or &quot;Next&quot; for guided tour ({hotspots.length} points)
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={nextStep}
            style={[styles.navButton, styles.nextButton]}
            accessibilityLabel="Next Point"
          >
            <Text style={styles.nextText}>Next</Text>
            <ChevronRight size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginVertical: 8,
  },
  viewport: {
    width: "100%",
    height: VIEWER_HEIGHT,
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#18181B",
  },
  imageWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  hotspotBox: {
    position: "absolute",
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#10B981",
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  activeHotspotBox: {
    borderColor: "#EAB308",
    backgroundColor: "rgba(234, 179, 8, 0.35)",
    borderWidth: 2,
  },
  occludedBox: {
    borderColor: "#F59E0B",
    backgroundColor: "rgba(245, 158, 11, 0.8)",
  },
  occlusionMask: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  tapToRevealText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#78350F",
  },
  badge: {
    position: "absolute",
    top: -8,
    left: -8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  activeBadge: {
    backgroundColor: "#EAB308",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  resetButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  resetText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  navButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAB308",
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 2,
  },
  nextText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  infoCenter: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  labelContainer: {
    justifyContent: "center",
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
  },
  stepDesc: {
    fontSize: 10,
    color: "#6B7280",
  },
  hintText: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
  },
});
