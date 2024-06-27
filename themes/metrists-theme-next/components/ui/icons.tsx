type IconProps = React.HTMLAttributes<SVGElement>;

export const Icons = {
  twitter: (props: IconProps) => (
    <svg
      {...props}
      height="23"
      viewBox="0 0 1200 1227"
      width="23"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" />
    </svg>
  ),
  americanAirline: (props: IconProps) => (
    <svg
      version="1.2"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 253 240"
      width="253"
      height="240"
      {...props}
    >
      <path
        d="m9.3 2.1h29.4c0 0 17.5-0.9 28.5 12.4l64.1 80.7h-45c0 0-19.9 0.9-28-12.6z"
        fill="currentColor"
      />
      <path
        d="m110.3 168.4l26.4 43.5c0 0 9.7 22.1 41.7 22.1h67.4l-95.4-115.1-40.1 9.1c0 0-11 14.6 0 40.4z"
        fill="currentColor"
      />
      <path
        d="m164.8 136.2l-15.5-18.7-38.9 10.5c0 0-11 14.6 0 40.4l1.6 2.7c-0.1-1.7-1.3-28.3 52.8-34.9z"
        fill="currentColor"
      />
      <path
        d="m111.9 171.1c0 0-12.2-31.4 27.6-46.4 0 0 28.3-10.1 47.3-4.1 0 0-1.3-22.9-47.9-21.4 0 0-24.6-0.2-43.9 6.6 0 0-20.5 5.4-5.3 28.9z"
        fill="currentColor"
      />
    </svg>
  ),
  google: (props: IconProps) => (
    <svg role="img" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
      />
    </svg>
  ),
  airCanada: (props: IconProps) => (
    <svg role="img" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12.394 16.958c0-.789.338-.902 1.127-.451a54.235 54.235 0 0 0 2.704 1.465c0-.45.451-.789 1.24-.564.789.226 1.577.338 1.577.338s-.45-1.014-.676-1.464c-.338-.789 0-1.24.338-1.352 0 0-.45-.338-.789-.564-.676-.45-.563-1.014.113-1.24.902-.45 2.141-.9 2.141-.9-.338-.226-.789-.79-.338-1.578.45-.676 1.24-1.69 1.24-1.69H18.93c-.79 0-1.015-.676-1.015-1.127 0 0-1.239.901-2.14 1.465-.79.563-1.465 0-1.352-.902a37 37 0 0 0 .338-2.93c-.451.451-1.24.339-1.69-.337-.564-1.127-1.127-2.48-1.127-2.48S11.38 4 10.817 5.128c-.338.676-1.127.788-1.578.45a37 37 0 0 0 .338 2.93c.113.789-.563 1.352-1.352.789-.901-.564-2.253-1.465-2.253-1.465 0 .45-.226 1.014-1.014 1.127H2.817s.789 1.014 1.24 1.69c.45.676 0 1.352-.339 1.577 0 0 1.127.564 2.141.902.676.338.902.788.113 1.24-.226.225-.789.563-.789.563.45.112.789.563.45 1.352-.225.45-.675 1.464-.675 1.464s.788-.225 1.577-.338c.789-.225 1.127.226 1.24.564 0 0 1.352-.789 2.704-1.465.676-.45 1.127-.225 1.127.45v1.916c0 1.127-.226 2.254-.564 2.93-5.07-.564-9.352-4.62-9.352-10.028 0-5.521 4.62-10.029 10.366-10.029 5.747 0 10.367 4.508 10.367 10.029 0 5.183-4.057 9.464-9.24 10.028v1.352C19.268 22.592 24 17.746 24 11.775 24 5.352 18.592.282 11.944.282 5.408.282 0 5.352 0 11.662c0 5.521 4.169 10.14 9.69 11.155.902.225 1.465.338 2.028.901.564-1.126.676-3.38.676-4.62z"
      />
    </svg>
  ),
  spinner: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
};
