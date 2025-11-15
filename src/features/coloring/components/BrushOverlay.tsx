import React, {useEffect, useRef, useState} from 'react';
import {PanResponder, StyleSheet, View} from 'react-native';
import Svg, {ClipPath, Defs, Path as SvgPath} from 'react-native-svg';

import {BrushStroke} from '../state/coloringReducer';
import {ColoringPath} from '../models/coloringTypes';

type TransformState = {
  scale: number;
  translateX: number;
  translateY: number;
};

type BrushOverlayProps = {
  width: number;
  height: number;
  paths: ColoringPath[];
  color: string;
  strokeWidth: number;
  selectedPathId?: string | null;
  viewBox?: string;
  transform?: TransformState;
  onStrokeComplete: (stroke: BrushStroke) => void;
};

export const BrushOverlay: React.FC<BrushOverlayProps> = ({
  width,
  height,
  paths,
  color,
  strokeWidth,
  selectedPathId,
  viewBox = '0 0 100 100',
  transform = {scale: 1, translateX: 0, translateY: 0},
  onStrokeComplete,
}) => {
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const pathRef = useRef<string>('');
  const startPointRef = useRef<{x: number; y: number} | null>(null);
  const viewBoxRef = useRef<string>(viewBox);
  const transformRef = useRef<TransformState>(transform);

  useEffect(() => {
    viewBoxRef.current = viewBox;
  }, [viewBox]);

  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  const screenToViewBox = (screenX: number, screenY: number): {x: number; y: number} => {
    const [vx, vy, vw, vh] = viewBoxRef.current.split(' ').map(Number);
    const currentTransform = transformRef.current;

    const centerX = width / 2;
    const centerY = height / 2;

    const relativeX = screenX - centerX;
    const relativeY = screenY - centerY;

    const unscaleX = (relativeX - currentTransform.translateX) / currentTransform.scale;
    const unscaleY = (relativeY - currentTransform.translateY) / currentTransform.scale;

    const normalizedX = (unscaleX / width) * vw + vw / 2;
    const normalizedY = (unscaleY / height) * vh + vh / 2;

    return {
      x: normalizedX + vx,
      y: normalizedY + vy,
    };
  };

  const getViewBoxStrokeWidth = (): number => {
    const [,, vw, vh] = viewBoxRef.current.split(' ').map(Number);
    const avgSize = (vw + vh) / 2;
    return (strokeWidth / Math.max(width, height)) * avgSize;
  };


  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: evt => {
        const {locationX, locationY} = evt.nativeEvent;
        const vb = screenToViewBox(locationX, locationY);
        startPointRef.current = vb;
        pathRef.current = `M ${vb.x} ${vb.y}`;
        setCurrentPath(pathRef.current);
      },
      onPanResponderMove: evt => {
        const {locationX, locationY} = evt.nativeEvent;
        if (!startPointRef.current) {
          return;
        }

        const vb = screenToViewBox(locationX, locationY);
        pathRef.current += ` L ${vb.x} ${vb.y}`;
        setCurrentPath(pathRef.current);
      },
      onPanResponderRelease: () => {
        if (pathRef.current && startPointRef.current) {
          const stroke: BrushStroke = {
            id: `brush-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            d: pathRef.current,
            color,
            width: strokeWidth,
            clipPathId: selectedPathId || undefined,
          };
          onStrokeComplete(stroke);
        }
        setCurrentPath(null);
        pathRef.current = '';
        startPointRef.current = null;
      },
    }),
  ).current;

  const selectedPath = selectedPathId
    ? paths.find(p => p.id === selectedPathId)
    : null;

  return (
    <View
      style={[StyleSheet.absoluteFill, {width, height}]}
      {...panResponder.panHandlers}>
      <Svg
        viewBox={viewBox}
        width="100%"
        height="100%"
        style={StyleSheet.absoluteFill}
        preserveAspectRatio="xMidYMid meet">
        <Defs>
          {selectedPath && (
            <ClipPath id="brushClip">
              <SvgPath d={selectedPath.d} />
            </ClipPath>
          )}
        </Defs>
        {currentPath && (
          <SvgPath
            d={currentPath}
            stroke={color}
            strokeWidth={getViewBoxStrokeWidth()}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            clipPath={selectedPath ? 'url(#brushClip)' : undefined}
          />
        )}
      </Svg>
    </View>
  );
};

