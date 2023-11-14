/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRef, useCallback, useEffect, useState, useMemo, ReactElement } from 'react';

import './card-slider.style.scss';

interface ICardSlider {
  noWrap?: boolean;
  children: ReactElement[];
}

const CardSlider = ({ children, noWrap }: ICardSlider) => {
  const ref = useRef<any>();
  const [showArrow, setShowArrow] = useState({ left: false, right: false });

  useEffect(() => {
    const handleResize = () => {
      handleScroll({ adjust: true });
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [children]);

  useEffect(() => {
    let touchDownHandler: {
      (e: TouchEvent): void;
    };
    // let mouseDownHandler: any;
    let handleScrollEvent: { (e: Event): void };
    if (ref.current && children.length > 0) {
      const element = ref.current;

      // set scroll event
      handleScrollEvent = (e: Event) => {
        handleArrowVisibility();
      };

      // set mouse event listener

      let pos = { top: 0, left: 0, x: 0, y: 0 };

      const downHandler = (left: number, top: number, x: number, y: number) => {
        pos = {
          // The current scroll
          left,
          top,
          // Get the current mouse position
          x,
          y,
        };
      };

      touchDownHandler = (e: TouchEvent) => {
        downHandler(
          element.scrollLeft,
          element.scrollTop,
          e.touches[0].clientX,
          e.touches[0].clientY
        );

        element.addEventListener('touchmove', touchMoveHandler, { passive: true });
        element.addEventListener('touchend', touchUpHandler, { passive: true });
      };

      // mouseDownHandler = (e: MouseEvent) => {
      //   downHandler(element.scrollLeft, element.scrollTop, e.clientX, e.clientY);
      //   element.addEventListener('mousemove', mouseMoveHandler);
      //   element.addEventListener('mouseup', mouseUpHandler);
      // };

      const touchMoveHandler = (e: TouchEvent) => {
        // How far the mouse has been moved
        const dx = e.touches[0].clientX - pos.x;

        // Scroll the element
        handleScroll({ pos: pos.left - dx, adjust: true });
      };

      // const mouseMoveHandler = (e: MouseEvent) => {
      //   // How far the mouse has been moved
      //   const dx = e.clientX - pos.x;
      //   // Scroll the element
      //   handleScroll(pos.left - dx);
      // };

      const touchUpHandler = () => {
        element.removeEventListener('touchmove', touchMoveHandler);
        element.removeEventListener('touchend', touchUpHandler);
      };

      // const mouseUpHandler = () => {
      //   element.removeEventListener('mousemove', mouseMoveHandler);
      //   element.removeEventListener('mouseup', mouseUpHandler);
      // };

      element.addEventListener('touchstart', touchDownHandler, { passive: true });
      // element.addEventListener('mousedown', mouseDownHandler);
      element.addEventListener('scroll', handleScrollEvent, { passive: true });

      handleScroll({ adjust: true });
    }

    return () => {
      if (ref.current) {
        // (carouselRef.current as HTMLElement).removeEventListener(
        //   'mousedown',
        //   mouseDownHandler,
        // );
        ref.current.removeEventListener('touchstart', touchDownHandler);
        ref.current.removeEventListener('scroll', handleScrollEvent);
      }
    };
  }, [children]);

  const itemWidth = useMemo(() => {
    const numChildren = children.length;
    const gaps = 24 * (numChildren - 1);
    if (ref.current) {
      return (ref.current.scrollWidth - gaps) / numChildren;
    }
    return 0;
  }, [children]);

  const handleArrowVisibility = useCallback(() => {
    const threshhold = 20;
    if (ref.current) {
      if (ref.current.scrollLeft === 0) {
        setShowArrow({
          left: false,
          right: ref.current.scrollWidth > ref.current.clientWidth,
        });
      } else if (
        ref.current.scrollLeft >=
        Math.max(ref.current.scrollWidth - ref.current.clientWidth - threshhold, 0)
      ) {
        setShowArrow({ left: true, right: false });
      } else {
        setShowArrow({ left: true, right: true });
      }
    }
  }, []);

  const handleScroll = useCallback(
    ({ left, adjust, pos }: { left?: boolean; adjust?: boolean; pos?: number }) => {
      if (ref.current) {
        const step = ref.current.clientWidth * 0.8;

        const threshhold = itemWidth * 1.5;
        let nextStep = pos || ref.current.scrollLeft;
        if (adjust) {
          nextStep = ref.current.scrollLeft;
        }

        if (left) {
          nextStep -= step;
          if (nextStep <= itemWidth * 0.5) nextStep = 0;
        } else {
          nextStep += step;
          if (nextStep >= ref.current.scrollWidth - threshhold) {
            nextStep = ref.current.scrollWidth;
          }
        }

        handleArrowVisibility();

        if (!adjust) {
          ref.current.scrollLeft = nextStep;
        }
      }
    },
    [ref.current, children, itemWidth]
  );

  return (
    <div className={`card-slider-container ${noWrap ? 'no-wrap' : ''}`}>
      <div className='card-slider-view' ref={ref}>
        {showArrow.left && (
          <div className='scroll-deem-left-background'>
            <button
              type='button'
              onClick={() => {
                handleScroll({ left: true });
              }}
            >{`<`}</button>
          </div>
        )}
        {children}
        {showArrow.right && (
          <div className='scroll-deem-right-background'>
            <button
              type='button'
              onClick={() => {
                handleScroll({});
              }}
            >
              {'>'}
            </button>
          </div>
        )}
      </div>
      <div className='card-grid-view'>{children}</div>
    </div>
  );
};

export default CardSlider;
