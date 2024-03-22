/*

Original Carousel created by Zinan Zhang
https://github.com/Zinan-Zhang/react-carousel-card-3d

*/

import { Component } from "react";
export type CarouselSlideType = {
  key: string | number;
  content: JSX.Element;
  index?: number | null;
  onClick?: () => void;
};
interface CarouselState {
  index: number;
  goToSlide: number | null;
  prevPropsGoToSlide: number;
  newSlide: boolean;
}
interface CarouselProps {
  slides: CarouselSlideType[];
  goToSlide?: number;
  offsetRadius: number;
  animationConfig: object;
  goToSlideDelay: number;
}
declare class Carousel extends Component<CarouselProps, CarouselState> {
  state: CarouselState;
  goToIn?: number;
  static defaultProps: {
    offsetRadius: number;
    animationConfig: {
      tension: number;
      friction: number;
    };
    goToSlideDelay: number;
  };
  static getDerivedStateFromProps(
    props: CarouselProps,
    state: CarouselState,
  ): {
    prevPropsGoToSlide: number | undefined;
    goToSlide: number | undefined;
    newSlide: boolean;
  } | null;
  componentDidUpdate(): void;
  componentWillUnmount(): void;
  modBySlidesLength: (index: number) => number;
  moveSlide: (direction: -1 | 1) => void;
  getShortestDirection(from: number, to: number): -1 | 0 | 1;
  handleGoToSlide: () => void;
  clampOffsetRadius(offsetRadius: number): number;
  getPresentableSlides(): CarouselSlideType[];
  render(): JSX.Element;
}
export { Carousel };
