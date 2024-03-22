/*

Original Carousel created by Zinan Zhang
https://github.com/Zinan-Zhang/react-carousel-card-3d

*/

import React, { Component } from "react";
import CarouselSlide from "./CarouselSlide";
function mod(a, b) {
  return ((a % b) + b) % b;
}
class Carousel extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      index: 0,
      goToSlide: null,
      prevPropsGoToSlide: 0,
      newSlide: false,
    };
    this.modBySlidesLength = (index) => {
      return mod(index, this.props.slides.length);
    };
    this.moveSlide = (direction) => {
      this.setState({
        index: this.modBySlidesLength(this.state.index + direction),
        goToSlide: null,
      });
    };
    this.handleGoToSlide = () => {
      if (typeof this.state.goToSlide !== "number") {
        return;
      }
      const { index } = this.state;
      const goToSlide = mod(this.state.goToSlide, this.props.slides.length);
      if (goToSlide !== index) {
        let direction = this.getShortestDirection(index, goToSlide);
        const isFinished =
          this.modBySlidesLength(index + direction) === goToSlide;
        this.setState({
          index: this.modBySlidesLength(index + direction),
          newSlide: isFinished,
          goToSlide: isFinished ? null : goToSlide,
        });
      }
    };
  }
  static getDerivedStateFromProps(props, state) {
    const { goToSlide } = props;
    if (goToSlide !== state.prevPropsGoToSlide) {
      return { prevPropsGoToSlide: goToSlide, goToSlide, newSlide: true };
    }
    return null;
  }
  componentDidUpdate() {
    const { goToSlideDelay } = this.props;
    const { index, goToSlide, newSlide } = this.state;
    if (typeof goToSlide === "number") {
      if (newSlide) {
        this.handleGoToSlide();
      } else if (index !== goToSlide && typeof window !== "undefined") {
        window.clearTimeout(this.goToIn);
        this.goToIn = window.setTimeout(this.handleGoToSlide, goToSlideDelay);
      } else if (typeof window !== "undefined") {
        window.clearTimeout(this.goToIn);
      }
    }
  }
  componentWillUnmount() {
    if (typeof window !== "undefined") {
      window.clearTimeout(this.goToIn);
    }
  }
  getShortestDirection(from, to) {
    if (from > to) {
      if (from - to > this.props.slides.length - 1 - from + to) {
        return 1;
      } else return -1;
    } else if (to > from) {
      if (to - from > from + this.props.slides.length - 1 - to) {
        return -1;
      } else return 1;
    }
    return 0;
  }
  clampOffsetRadius(offsetRadius) {
    const { slides } = this.props;
    const upperBound = Math.floor((slides.length - 1) / 2);
    if (offsetRadius < 0) {
      return 0;
    }
    if (offsetRadius > upperBound) {
      return upperBound;
    }
    return offsetRadius;
  }
  getPresentableSlides() {
    const { slides } = this.props;
    const { index } = this.state;
    let { offsetRadius } = this.props;
    offsetRadius = this.clampOffsetRadius(offsetRadius);
    const presentableSlides = new Array();
    for (let i = -offsetRadius; i < 1 + offsetRadius; i++) {
      const slide = slides[this.modBySlidesLength(index + i)];
      if (slide) presentableSlides.push(slide);
    }
    return presentableSlides;
  }
  render() {
    const { goToSlide, offsetRadius, animationConfig } = this.props;
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        "div",
        { style: { position: "relative", width: "100%", height: "100%" } },
        this.getPresentableSlides().map((slide, presentableIndex) =>
          React.createElement(CarouselSlide, {
            key: slide.key,
            content: slide.content,
            currentIndex: slide.index,
            onClick: slide.onClick,
            currentSlide: goToSlide,
            offsetRadius: this.clampOffsetRadius(offsetRadius),
            index: presentableIndex,
            animationConfig: animationConfig,
          }),
        ),
      ),
    );
  }
}
Carousel.defaultProps = {
  offsetRadius: 2,
  animationConfig: { tension: 120, friction: 14 },
  goToSlideDelay: 200,
};
export { Carousel };
