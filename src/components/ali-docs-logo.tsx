import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  title?: string;
};

/** Ali Docs file icon — matches brand mark / favicon */
export function AliDocsLogo({ className, title = "Ali Docs" }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-5", className)}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M7 2.75h7.25L19.25 8v13.25a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3.75a1 1 0 0 1 1-1Z"
        fill="currentColor"
      />
      <path
        d="M14.25 2.75V7.5a.75.75 0 0 0 .75.75h4.25"
        stroke="#fff"
        strokeWidth="1.25"
        strokeLinejoin="round"
        opacity="0.35"
      />
      <path
        d="M8.5 12h7M8.5 15.25h7M8.5 18.5h4.5"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
