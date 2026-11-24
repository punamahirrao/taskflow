import type { BacklogControlsProps } from "../../entities/backlogControls";
import { BacklogControlsBar } from "../../components/controls/BacklogControlsBar";
import { BacklogControlsHeading } from "../../components/controls/BacklogControlsHeading";
import { BacklogControlsActions } from "../../components/controls/BacklogControlsActions";
import { BacklogGroupSelect } from "../../components/controls/BacklogGroupSelect";
import { BacklogSearch } from "../../components/controls/BacklogSearch";
import { BacklogModeSwitcher } from "../../components/controls/BacklogModeSwitcher";
import { BacklogEstimationHint } from "../../components/controls/BacklogEstimationHint";

export function BacklogControls({
  mode,
  setMode,
  groupBy,
  setGroupBy,
  search,
  setSearch,
}: BacklogControlsProps) {
  return (
    <>
      <BacklogControlsBar>
        <BacklogControlsHeading />
        <BacklogControlsActions>
          <BacklogGroupSelect value={groupBy} onChange={setGroupBy} />
          <BacklogSearch value={search} onChange={setSearch} />
          <BacklogModeSwitcher mode={mode} onChange={setMode} />
        </BacklogControlsActions>
      </BacklogControlsBar>
      {mode === "estimate" && <BacklogEstimationHint />}
    </>
  );
}
