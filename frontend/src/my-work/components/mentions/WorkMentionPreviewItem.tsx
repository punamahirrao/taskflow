import { AtSign } from "lucide-react";
export function WorkMentionPreviewItem() {
  return (
    <li>
      <span className="my-work-avatar preview">
        <AtSign size={18} />
      </span>
      <div className="my-work-list-label">
        <b>A teammate mentioned you</b>
        <small>Example of a tagged comment on your task</small>
      </div>
      <span className="my-work-demo">Demo</span>
    </li>
  );
}
