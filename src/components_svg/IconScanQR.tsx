import type { IconProps } from "../types";


const IconScanQR = ({ width, height }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
    viewBox="-0.5 0 25 25"
    
  >
    <path
      stroke="#0F0F0F"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      d="M19.88 16.44v3.45c0 .27-.22.49-.49.49h-5.42M13.97 4.62h5.42c.27 0 .49.22.49.49v5.42M4.12 10.53V5.11c0-.27.22-.49.49-.49h5.42M4.12 16.44v3.45c0 .27.22.49.49.49h5.42M2.49 14.47h19.02"
    />
  </svg>
)
export default IconScanQR

