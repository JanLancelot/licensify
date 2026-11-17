import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Maximize2, X } from 'lucide-react-native';
import {
  ContentBlock,
  normalizeInlineTags,
  parseContentToBlocks,
} from './contentParser';

export { ContentBlock, parseContentToBlocks };

interface MarkdownContentViewProps {
  content: string;
  isDark: boolean;
  colors: {
    text: string;
    background: string;
    accent: string;
    border?: string;
  };
}

/**
 * Parses inline tokens like bold, italic, underline, strikethrough, and code
 * into styled React Native Text components.
 */
function renderInlineTokens(
  rawText: string,
  baseStyle: any,
  isDark: boolean,
  accentColor: string
): React.ReactNode {
  const normalized = normalizeInlineTags(rawText);

  // Regex matches:
  // 1. **bold**
  // 2. *italic*
  // 3. `code`
  // 4. __U_START__underline__U_END__
  // 5. __S_START__strike__S_END__
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|__U_START__.*?__U_END__|__S_START__.*?__S_END__)/g;
  const parts = normalized.split(regex);

  return parts.map((part, idx) => {
    if (!part) return null;

    // Bold
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <Text
          key={idx}
          style={[
            baseStyle,
            {
              fontWeight: '700',
              color: isDark ? '#FFFFFF' : '#0F172A',
            },
          ]}>
          {part.slice(2, -2)}
        </Text>
      );
    }

    // Italic
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <Text
          key={idx}
          style={[
            baseStyle,
            {
              fontStyle: 'italic',
            },
          ]}>
          {part.slice(1, -1)}
        </Text>
      );
    }

    // Monospace Code
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <Text
          key={idx}
          style={[
            baseStyle,
            {
              fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
              fontSize: 12.5,
              fontWeight: '600',
              color: accentColor,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
              paddingHorizontal: 4,
              borderRadius: 4,
            },
          ]}>
          {part.slice(1, -1)}
        </Text>
      );
    }

    // Underline
    if (part.startsWith('__U_START__') && part.endsWith('__U_END__')) {
      const inner = part.slice(11, -9);
      return (
        <Text key={idx} style={[baseStyle, { textDecorationLine: 'underline' }]}>
          {inner}
        </Text>
      );
    }

    // Strikethrough
    if (part.startsWith('__S_START__') && part.endsWith('__S_END__')) {
      const inner = part.slice(11, -9);
      return (
        <Text key={idx} style={[baseStyle, { textDecorationLine: 'line-through' }]}>
          {inner}
        </Text>
      );
    }

    return (
      <Text key={idx} style={baseStyle}>
        {part}
      </Text>
    );
  });
}

export function MarkdownContentView({
  content,
  isDark,
  colors,
}: MarkdownContentViewProps) {
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt?: string } | null>(null);

  if (!content || !content.trim()) return null;

  const blocks = parseContentToBlocks(content);

  const textColor = isDark ? '#CBD5E1' : '#334155';
  const headingColor = isDark ? '#F8FAFC' : '#0F172A';
  const subHeadingColor = isDark ? '#E2E8F0' : '#1E293B';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.07)';

  return (
    <View style={styles.container}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'spacer':
            return <View key={index} style={styles.spacer} />;

          case 'divider':
            return (
              <View
                key={index}
                style={[styles.divider, { backgroundColor: borderColor }]}
              />
            );

          case 'h1':
            return (
              <View key={index} style={styles.h1Container}>
                <Text style={[styles.h1Text, { color: headingColor }]}>
                  {renderInlineTokens(block.text, { color: headingColor }, isDark, colors.accent)}
                </Text>
                <View style={[styles.h1Underline, { backgroundColor: colors.accent }]} />
              </View>
            );

          case 'h2':
            return (
              <View key={index} style={styles.h2Container}>
                <View style={[styles.h2Indicator, { backgroundColor: colors.accent }]} />
                <Text style={[styles.h2Text, { color: headingColor }]}>
                  {renderInlineTokens(block.text, { color: headingColor }, isDark, colors.accent)}
                </Text>
              </View>
            );

          case 'h3':
            return (
              <View key={index} style={styles.h3Container}>
                <Text style={[styles.h3Text, { color: subHeadingColor }]}>
                  {renderInlineTokens(block.text, { color: subHeadingColor }, isDark, colors.accent)}
                </Text>
              </View>
            );

          case 'blockquote':
            return (
              <View
                key={index}
                style={[
                  styles.blockquote,
                  {
                    borderLeftColor: colors.accent,
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  },
                ]}>
                <Text style={[styles.blockquoteText, { color: isDark ? '#94A3B8' : '#475569' }]}>
                  {renderInlineTokens(block.text, { color: isDark ? '#94A3B8' : '#475569' }, isDark, colors.accent)}
                </Text>
              </View>
            );

          case 'code':
            return (
              <View
                key={index}
                style={[
                  styles.codeBlock,
                  {
                    backgroundColor: isDark ? '#14171F' : '#F1F5F9',
                    borderColor: borderColor,
                  },
                ]}>
                <Text
                  style={[
                    styles.codeText,
                    {
                      color: isDark ? '#38BDF8' : '#0284C7',
                    },
                  ]}>
                  {block.code}
                </Text>
              </View>
            );

          case 'bullet': {
            const isNested = block.level > 0;
            return (
              <View
                key={index}
                style={[
                  styles.bulletRow,
                  { paddingLeft: block.level * 16 },
                ]}>
                <Text
                  style={[
                    styles.bulletSymbol,
                    {
                      color: isNested ? (isDark ? '#94A3B8' : '#64748B') : colors.accent,
                      fontSize: isNested ? 14 : 16,
                    },
                  ]}>
                  {block.level === 0 ? '•' : block.level === 1 ? '◦' : '–'}
                </Text>
                <Text style={[styles.bulletContent, { color: textColor }]}>
                  {renderInlineTokens(block.text, { color: textColor }, isDark, colors.accent)}
                </Text>
              </View>
            );
          }

          case 'numbered':
            return (
              <View key={index} style={styles.numberedRow}>
                <View
                  style={[
                    styles.numberBadge,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.numberText,
                      { color: isDark ? '#E2E8F0' : '#334155' },
                    ]}>
                    {block.num}
                  </Text>
                </View>
                <Text style={[styles.numberedContent, { color: textColor }]}>
                  {renderInlineTokens(block.text, { color: textColor }, isDark, colors.accent)}
                </Text>
              </View>
            );

          case 'image':
            return (
              <View
                key={index}
                style={[
                  styles.imageCard,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    borderColor: borderColor,
                  },
                ]}>
                <Pressable
                  onPress={() => setSelectedImage({ src: block.src, alt: block.alt })}
                  style={styles.imagePressable}
                  accessibilityRole="imagebutton"
                  accessibilityLabel={block.alt || 'Architectural study illustration'}>
                  <ExpoImage
                    source={{ uri: block.src }}
                    style={styles.illustrationImage}
                    contentFit="contain"
                    transition={250}
                    accessibilityLabel={block.alt || 'Illustration'}
                  />
                  <View style={styles.zoomPill}>
                    <Maximize2 size={12} color="#FFFFFF" strokeWidth={2.4} />
                    <Text style={styles.zoomPillText}>Expand</Text>
                  </View>
                </Pressable>

                {block.alt && block.alt.trim().length > 0 ? (
                  <Text
                    style={[
                      styles.imageCaption,
                      { color: isDark ? '#94A3B8' : '#64748B' },
                    ]}>
                    {block.alt}
                  </Text>
                ) : null}
              </View>
            );

          case 'p':
          default:
            return (
              <Text key={index} style={[styles.paragraphText, { color: textColor }]}>
                {renderInlineTokens(block.text, { color: textColor }, isDark, colors.accent)}
              </Text>
            );
        }
      })}

      {/* Full-screen Image Viewer Modal */}
      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}>
        <View style={styles.modalBackdrop}>
          <Pressable
            style={styles.modalCloseButton}
            onPress={() => setSelectedImage(null)}
            accessibilityRole="button"
            accessibilityLabel="Close full-screen image">
            <X size={20} color="#FFFFFF" strokeWidth={2.4} />
          </Pressable>

          {selectedImage ? (
            <View style={styles.modalImageWrapper}>
              <ExpoImage
                source={{ uri: selectedImage.src }}
                style={styles.modalImage}
                contentFit="contain"
              />
              {selectedImage.alt ? (
                <View style={styles.modalCaptionBox}>
                  <Text style={styles.modalCaptionText}>{selectedImage.alt}</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  spacer: {
    height: 8,
  },
  divider: {
    height: 1,
    marginVertical: 12,
    borderRadius: 1,
  },
  h1Container: {
    marginTop: 10,
    marginBottom: 8,
    gap: 4,
  },
  h1Text: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  h1Underline: {
    height: 2.5,
    width: 36,
    borderRadius: 2,
  },
  h2Container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    marginBottom: 6,
  },
  h2Indicator: {
    width: 3.5,
    height: 16,
    borderRadius: 2,
  },
  h2Text: {
    fontSize: 16.5,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 22,
    flex: 1,
  },
  h3Container: {
    marginTop: 10,
    marginBottom: 4,
  },
  h3Text: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.1,
    lineHeight: 20,
  },
  blockquote: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    paddingVertical: 6,
    marginVertical: 6,
    borderRadius: 4,
  },
  blockquoteText: {
    fontSize: 13.5,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  codeBlock: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 8,
  },
  codeText: {
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
    fontSize: 12.5,
    lineHeight: 18,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginVertical: 2.5,
  },
  bulletSymbol: {
    lineHeight: 21,
    fontWeight: '700',
  },
  bulletContent: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21.5,
    fontWeight: '400',
  },
  numberedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginVertical: 3,
  },
  numberBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    paddingHorizontal: 4,
  },
  numberText: {
    fontSize: 11,
    fontWeight: '700',
  },
  numberedContent: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21.5,
    fontWeight: '400',
  },
  paragraphText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
    marginVertical: 2,
  },
  imageCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 6,
    marginVertical: 10,
    alignItems: 'center',
    overflow: 'hidden',
  },
  imagePressable: {
    width: '100%',
    height: 240,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
  },
  zoomPill: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  zoomPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  imageCaption: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 6,
    marginBottom: 4,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  modalImageWrapper: {
    width: '100%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalCaptionBox: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  modalCaptionText: {
    color: '#F8FAFC',
    fontSize: 13,
    textAlign: 'center',
  },
});
