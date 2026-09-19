import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

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
 * Parses inline markdown tokens like **bold**, *italic*, and `code` into nested React Native Text nodes.
 */
function renderInlineTokens(
  line: string,
  baseStyle: any,
  isDark: boolean,
  accentColor: string
): React.ReactNode {
  // Matches **bold**, *italic*, or `code`
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = line.split(regex);

  return parts.map((part, idx) => {
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
  if (!content || !content.trim()) return null;

  const lines = content.split('\n');
  const textColor = isDark ? '#CBD5E1' : '#334155';
  const headingColor = isDark ? '#F8FAFC' : '#0F172A';
  const subHeadingColor = isDark ? '#E2E8F0' : '#1E293B';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.07)';

  return (
    <View style={styles.container}>
      {lines.map((rawLine, index) => {
        const trimmed = rawLine.trim();

        // 1. Empty lines -> paragraph spacing
        if (!trimmed) {
          return <View key={index} style={styles.spacer} />;
        }

        // 2. Horizontal divider
        if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
          return (
            <View
              key={index}
              style={[styles.divider, { backgroundColor: borderColor }]}
            />
          );
        }

        // 3. Heading 1 (# ...)
        if (rawLine.startsWith('# ')) {
          const text = rawLine.replace(/^#\s+/, '');
          return (
            <View key={index} style={styles.h1Container}>
              <Text style={[styles.h1Text, { color: headingColor }]}>
                {renderInlineTokens(text, { color: headingColor }, isDark, colors.accent)}
              </Text>
              <View style={[styles.h1Underline, { backgroundColor: colors.accent }]} />
            </View>
          );
        }

        // 4. Heading 2 (## ...)
        if (rawLine.startsWith('## ')) {
          const text = rawLine.replace(/^##\s+/, '');
          return (
            <View key={index} style={styles.h2Container}>
              <View style={[styles.h2Indicator, { backgroundColor: colors.accent }]} />
              <Text style={[styles.h2Text, { color: headingColor }]}>
                {renderInlineTokens(text, { color: headingColor }, isDark, colors.accent)}
              </Text>
            </View>
          );
        }

        // 5. Heading 3 (### ...)
        if (rawLine.startsWith('### ')) {
          const text = rawLine.replace(/^###\s+/, '');
          return (
            <View key={index} style={styles.h3Container}>
              <Text style={[styles.h3Text, { color: subHeadingColor }]}>
                {renderInlineTokens(text, { color: subHeadingColor }, isDark, colors.accent)}
              </Text>
            </View>
          );
        }

        // 6. Blockquote (> ...)
        if (rawLine.startsWith('> ')) {
          const text = rawLine.replace(/^>\s+/, '');
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
                {renderInlineTokens(text, { color: isDark ? '#94A3B8' : '#475569' }, isDark, colors.accent)}
              </Text>
            </View>
          );
        }

        // 7. Bullet lists (- ... or * ...) with indentation support
        const bulletMatch = rawLine.match(/^(\s*)([\*\-])\s+(.*)$/);
        if (bulletMatch) {
          const indentSpaces = bulletMatch[1].length;
          const text = bulletMatch[3];
          const level = Math.min(Math.floor(indentSpaces / 2), 2);
          const isNested = level > 0;

          return (
            <View
              key={index}
              style={[
                styles.bulletRow,
                { paddingLeft: level * 16 },
              ]}>
              <Text
                style={[
                  styles.bulletSymbol,
                  {
                    color: isNested ? (isDark ? '#94A3B8' : '#64748B') : colors.accent,
                    fontSize: isNested ? 14 : 16,
                  },
                ]}>
                {level === 0 ? '•' : level === 1 ? '◦' : '–'}
              </Text>
              <Text style={[styles.bulletContent, { color: textColor }]}>
                {renderInlineTokens(text, { color: textColor }, isDark, colors.accent)}
              </Text>
            </View>
          );
        }

        // 8. Numbered lists (1. ... or 2. ...)
        const numberedMatch = rawLine.match(/^(\s*)(\d+)\.\s+(.*)$/);
        if (numberedMatch) {
          const num = numberedMatch[2];
          const text = numberedMatch[3];

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
                  {num}
                </Text>
              </View>
              <Text style={[styles.numberedContent, { color: textColor }]}>
                {renderInlineTokens(text, { color: textColor }, isDark, colors.accent)}
              </Text>
            </View>
          );
        }

        // 9. Standard body paragraph
        return (
          <Text key={index} style={[styles.paragraphText, { color: textColor }]}>
            {renderInlineTokens(rawLine, { color: textColor }, isDark, colors.accent)}
          </Text>
        );
      })}
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
});
