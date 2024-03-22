/*

Original Carousel created by Zinan Zhang
https://github.com/Zinan-Zhang/react-carousel-card-3d

*/

import React from "react";
import { animated, useSpring } from "react-spring";
export default function CarouselSlide({
  content,
  onClick,
  currentIndex,
  currentSlide,
  offsetRadius,
  index,
  animationConfig,
}) {
  const offsetFromCenter = index - offsetRadius;
  const totalPresentables = 2 * offsetRadius + 1;
  const distanceFactor = 1 - Math.abs(offsetFromCenter / (offsetRadius + 1));
  const translateXoffset =
    50 * (Math.abs(offsetFromCenter) / (offsetRadius + 1));
  let translateX = -50;
  if (offsetRadius !== 0) {
    if (index === 0) {
      translateX = 0;
    } else if (index === totalPresentables - 1) {
      translateX = -100;
    }
  }
  if (offsetFromCenter > 0) {
    translateX += translateXoffset;
  } else if (offsetFromCenter < 0) {
    translateX -= translateXoffset;
  }
  const styles = useSpring({
    transform: `translateY(-50%) translateX(${translateX}%) scale(${
      distanceFactor === 1 ? 1 : 0.8
    })`,
    left: `${
      offsetRadius === 0 ? 50 : 50 + (offsetFromCenter * 50) / offsetRadius
    }%`,
    opacity: distanceFactor * distanceFactor,
    config: animationConfig,
  });

  return React.createElement(
    animated.div,
    {
      style: Object.assign(
        {
          position: "absolute",
          height: "100%",
          top: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transformOrigin: "50% 50%",
          zIndex: Math.abs(Math.abs(offsetFromCenter) - 2),
        },
        styles,
      ),
      onClick: onClick,
    },
    React.cloneElement(content, { currentSlide, currentIndex }),
  );
}
