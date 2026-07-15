import type { IconProps } from "../types"

const IconEyes = ({width, height, className} : IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    className={className}
    viewBox="0 0 512 512"
  >
    <title>{"eye-filled"}</title>
    <path
      fillRule="evenodd"
      d="M256 85.333C405.333 85.333 469.333 256 469.333 256s-64 170.667-213.333 170.667S42.667 256 42.667 256 106.667 85.333 256 85.333Zm0 96c-41.237 0-74.667 33.43-74.667 74.667s33.43 74.667 74.667 74.667 74.667-33.43 74.667-74.667-33.43-74.667-74.667-74.667ZM256 288c-17.645 0-32-14.355-32-32s14.355-32 32-32 32 14.355 32 32-14.355 32-32 32Z"
    />
  </svg>
)
export default IconEyes
