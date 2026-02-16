'use client';

import { usePathname } from '@/navigation';
import { useMemo, useEffect, useRef } from 'react';
import {
  animationDurationMs,
  pathsConfig,
  styleRectTag,
  styleStopTag,
  svgTagStyle,
  wrapperStyle,
} from './consts';
import { useTheme } from 'next-themes';

export const BackgroundContainer = () => {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);

  const isDark = resolvedTheme === 'dark';

  const currentConfig = useMemo(() => {
    return pathsConfig[pathname] || pathsConfig.defaultPath;
  }, [pathname]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const stops = svg.querySelectorAll('stop');
    stops.forEach((stop) => {
      stop.style.willChange = 'stop-color';
    });

    const timer = setTimeout(() => {
      stops.forEach((stop) => {
        stop.style.willChange = 'auto';
      });
    }, animationDurationMs);

    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const htmlElement = document.documentElement;
    const bgColor = isDark ? currentConfig.dark.outerColor : currentConfig.light.outerColor;

    htmlElement.style.backgroundColor = bgColor;
  }, [isDark, currentConfig]);

  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      aria-hidden="true"
      style={wrapperStyle}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={svgTagStyle}
      >
        <defs>
          <radialGradient
            id="bg-gradient-light"
            cx="50%"
            cy="50%"
            r="70%"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={currentConfig.light.color1} style={styleStopTag} />
            <stop offset="50%" stopColor={currentConfig.light.color2} style={styleStopTag} />
            <stop offset="90%" stopColor={currentConfig.light.color3} style={styleStopTag} />
            <stop offset="100%" stopColor={currentConfig.light.outerColor} style={styleStopTag} />
          </radialGradient>

          <radialGradient
            id="bg-gradient-dark"
            cx="50%"
            cy="50%"
            r="70%"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={currentConfig.dark.color1} style={styleStopTag} />
            <stop offset="50%" stopColor={currentConfig.dark.color2} style={styleStopTag} />
            <stop offset="90%" stopColor={currentConfig.dark.color3} style={styleStopTag} />
            <stop offset="100%" stopColor={currentConfig.dark.outerColor} style={styleStopTag} />
          </radialGradient>
        </defs>

        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#bg-gradient-light)"
          className="dark:opacity-0 opacity-100"
          style={styleRectTag}
        />

        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#bg-gradient-dark)"
          className="dark:opacity-100 opacity-0"
          style={styleRectTag}
        />
      </svg>
    </div>
  );
};
