import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function BoardFormHeading({ editing }: { editing: boolean }) {
  const { t } = useTranslation();
  return (
    <h2 className="text-xl font-bold">{t(editing ? "boards.editBoard" : "boards.createBoard")}</h2>
  );
}
