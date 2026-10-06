import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/** A4 = 210mm ≈ 794px. Escala el documento para encajar en el ancho disponible. */
const A4_PX = 794;
const A4_H_PX = 1123;

export function ScaledDoc({ children, maxScale = 1 }: { children: ReactNode; maxScale?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [height, setHeight] = useState(A4_H_PX);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      setScale(Math.min(maxScale, el.clientWidth / A4_PX));
      if (inner.current) setHeight(inner.current.offsetHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (inner.current) ro.observe(inner.current);
    return () => ro.disconnect();
  }, [maxScale]);

  return (
    <div ref={ref} className="w-full">
      <div style={{ height: height * scale }} className="relative mx-auto overflow-hidden" >
        <div
          ref={inner}
          style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: A4_PX }}
          className="absolute left-0 top-0"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
