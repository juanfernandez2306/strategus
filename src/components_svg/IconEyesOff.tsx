import type { IconProps } from "../types";

const IconEyesOff = ({width, height, className}: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      className={className}
      fillRule="evenodd"
      d="M2.293 2.293a1 1 0 0 1 1.414 0l18 18a1 1 0 0 1-1.414 1.414l-18-18a1 1 0 0 1 0-1.414Z"
      clipRule="evenodd"
    />
    <path
    className={className}
      fillRule="evenodd"
      d="M7.15 6.563c-.228.144-.447.294-.659.446-1.51 1.087-2.71 2.391-3.45 3.29a2.66 2.66 0 0 0 0 3.402c.74.899 1.94 2.203 3.45 3.29C7.994 18.073 9.891 19 12.001 19s4.005-.927 5.508-2.009l.04-.028-2.443-2.443A4 4 0 1 1 9.48 8.893l-2.33-2.33Zm8.813 5.986a4 4 0 0 0-4.511-4.511l-1.9-1.9c-.254-.254-.164-.685.18-.79A7.776 7.776 0 0 1 12 5c2.11 0 4.006.927 5.51 2.009 1.51 1.087 2.71 2.391 3.45 3.29a2.66 2.66 0 0 1 0 3.402 20.884 20.884 0 0 1-1.513 1.65.49.49 0 0 1-.69-.008l-2.794-2.794Zm-5.054-2.226a2 2 0 1 0 2.767 2.767l-2.767-2.767Z"
      clipRule="evenodd"
    />
  </svg>
)
export default IconEyesOff
