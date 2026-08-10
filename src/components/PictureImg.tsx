// Renders an <img> wrapped in <picture> with a WebP source derived from the
// original JPG/PNG path. The `.webp` sibling is generated for every image in
// public/projects and public/images; browsers that don't support WebP fall
// back to the original. Explicit width/height defends CLS regardless of the
// image's true aspect, since layout is controlled by the surrounding CSS
// (usually aspect-square + object-cover).

import type { ImgHTMLAttributes } from "react";

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

const toWebp = (src: string) => src.replace(/\.(jpe?g|png)$/i, ".webp");

const PictureImg = ({
  src,
  alt,
  width = 1200,
  height = 1200,
  loading = "lazy",
  decoding = "async",
  className,
  ...rest
}: Props) => {
  const webp = toWebp(src);
  const hasWebp = webp !== src;
  return (
    <picture>
      {hasWebp && <source srcSet={webp} type="image/webp" />}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding={decoding}
        className={className}
        {...rest}
      />
    </picture>
  );
};

export default PictureImg;
