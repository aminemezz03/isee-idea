import { TextShimmer } from "@/components/ui/shimmer-text";

export function StatusLine({ message = "Agent is thinking ..." }: { message?: string }) {
  return (
    <TextShimmer
      as="p"
      className="font-light text-sm sm:text-base tracking-tight"
      duration={2.5}
    >
      {message}
    </TextShimmer>
  );
}

export default StatusLine;
