import { ArrowUpRight } from "lucide-react";
import type { ResourceLink } from "../../../common/entities/document";
export function WorkDocumentLink({ link }: { link: ResourceLink }) {
  return (
    <li>
      <ArrowUpRight size={18} className="my-work-list-icon" />
      <a className="my-work-item-link" href={link.url} target="_blank" rel="noreferrer">
        {link.name}
        <small>Private resource link</small>
      </a>
    </li>
  );
}
