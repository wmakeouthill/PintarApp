import React, {useRef, useState} from 'react';
import {PanResponder, StyleSheet, View} from 'react-native';
import Svg, {Path as SvgPath} from 'react-native-svg';

type BrushSurfaceProps = {
  width: number;
  height: number;
  color: string;
  strokeWidth?: number;
  onBrushStroke: (path: string) => void;
  clipPath?: string;
};

export const BrushSurface: React.FC<BrushSurfaceProps> = ({
  width,
  height,
  color,
  strokeWidth = 8,
  onBrushStroke,
  clipPath,
}) => {
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [paths, setPaths] = useState<Array<{d: string; color: string}>>([]);
  const pathRef = useRef<string>('');

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: evt => {
        const {locationX, locationY} = evt.nativeEvent;
        pathRef.current = `M ${locationX} ${locationY}`;
        setCurrentPath(pathRef.current);
      },
      onPanResponderMove: evt => {
        const {locationX, locationY} = evt.nativeEvent;
        pathRef.current += ` L ${locationX} ${locationY}`;
        setCurrentPath(pathRef.current);
      },
      onPanResponderRelease: () => {
        if (pathRef.current) {
          const newPath = {
            d: pathRef.current,
            color,
          };
          setPaths(prev => [...prev, newPath]);
          onBrushStroke(pathRef.current);
          setCurrentPath(null);
          pathRef.current = '';
        }
      },
    }),
  ).current;

  return (
    <View
      style={[styles.container, {width, height}]}
      {...panResponder.panHandlers}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        {clipPath && (
          <SvgPath
            d={clipPath}
            fill="none"
            stroke="transparent"
            strokeWidth={strokeWidth * 2}
            clipPath="url(#brushClip)"
          />
        )}
        <defs>
          <clipPath id="brushClip">
            {clipPath && <SvgPath d={clipPath} />}
          </clipPath>
        </defs>
        <g clipPath={clipPath ? 'url(#brushClip)' : undefined}>
          {paths.map((p, idx) => (
            <SvgPath
              key={`brush-${idx}`}
              d={p.d}
              stroke={p.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ))}
          {currentPath && (
            <SvgPath
              d={currentPath}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          )}
        </g>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

