import { BacklogHeaderLayout } from "../../components/header/BacklogHeaderLayout";
import { BacklogCaptureButton } from "../../components/header/BacklogCaptureButton";

export function BacklogHeader({ onCapture }: { onCapture: () => void }) {
  return (
    <BacklogHeaderLayout>
      <BacklogCaptureButton onCapture={onCapture} />
    </BacklogHeaderLayout>
  );
}
