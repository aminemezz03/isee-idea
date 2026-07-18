import { useTranslation } from "react-i18next";
import { TextShimmer } from "@/components/ui/shimmer-text";

export function StatusLine({ message }: { message?: string }) {
  const { t } = useTranslation();
  return (
    <TextShimmer
      as="p"
      className="font-light text-sm sm:text-base tracking-tight"
      duration={2.5}
    >
      {message ?? t("loading.thinking")}
    </TextShimmer>
  );
}

export default StatusLine;
