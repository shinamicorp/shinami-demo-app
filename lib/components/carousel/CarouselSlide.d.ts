/// <reference types="react" />
interface CarouselSlideProps {
    content: JSX.Element;
    onClick?: () => void;
    currentIndex?: number | null;
    currentSlide?: number | null;
    offsetRadius: number;
    index: number;
    animationConfig: object;
}
export default function CarouselSlide({ content, onClick, currentIndex, currentSlide, offsetRadius, index, animationConfig, }: CarouselSlideProps): JSX.Element;
export {};
